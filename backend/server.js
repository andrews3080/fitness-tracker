// server.js
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('./config/db');
const jwt = require('jsonwebtoken');
const authenticate = require('./middleware/auth');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Hash the password before it ever touches the database
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );

    // Note: we RETURN id, name, email, created_at — deliberately NOT password_hash,
    // even though it's the same table. Never send a password hash back in a response.
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      // Postgres unique_violation — this email already has an account
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Deliberately vague — don't reveal whether the email exists or the password was wrong
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Compare the submitted password against the stored hash
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Password verified — issue a JWT containing the user's id
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // token becomes invalid after 7 days, forcing re-login
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

app.get('/api/me', authenticate, async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, email FROM users WHERE id = $1',
    [req.userId]
  );
  res.json(result.rows[0]);
});

// Log a new activity entry — protected, scoped to whoever is logged in
app.post('/api/logs', authenticate, async (req, res) => {
  try {
    const { type, value, logged_at } = req.body;

    const validTypes = ['walk', 'water', 'sleep'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${validTypes.join(', ')}` });
    }
    if (value === undefined || value === null || isNaN(value)) {
      return res.status(400).json({ error: 'value is required and must be a number' });
    }

    const result = await pool.query(
      `INSERT INTO activity_logs (user_id, type, value, logged_at)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE))
       RETURNING *`,
      [req.userId, type, value, logged_at || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

// Get all logs for the logged-in user
app.get('/api/logs', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM activity_logs WHERE user_id = $1 ORDER BY logged_at DESC, created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Delete a log — but ONLY if it belongs to the logged-in user
app.delete('/api/logs/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM activity_logs WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }

    res.json({ deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

// Aggregated totals per type, for the last 7 days — what the dashboard chart consumes
app.get('/api/logs/weekly', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         type,
         logged_at,
         SUM(value) AS total
       FROM activity_logs
       WHERE user_id = $1
         AND logged_at >= CURRENT_DATE - INTERVAL '6 days'
       GROUP BY type, logged_at
       ORDER BY logged_at ASC`,
      [req.userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch weekly logs' });
  }
});

// Get the logged-in user's goals — creates default goals on first request if none exist
app.get('/api/goals', authenticate, async (req, res) => {
  try {
    let result = await pool.query('SELECT * FROM goals WHERE user_id = $1', [req.userId]);

    if (result.rows.length === 0) {
      // No goals row yet for this user — insert one using the table's defaults
      result = await pool.query(
        'INSERT INTO goals (user_id) VALUES ($1) RETURNING *',
        [req.userId]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Update the logged-in user's goals
app.put('/api/goals', authenticate, async (req, res) => {
  try {
    const { walk_goal, water_goal, sleep_goal } = req.body;

    if (!walk_goal || !water_goal || !sleep_goal) {
      return res.status(400).json({ error: 'All three goals are required' });
    }

    // ON CONFLICT handles both "first time saving" and "updating existing" in one query
    const result = await pool.query(
      `INSERT INTO goals (user_id, walk_goal, water_goal, sleep_goal, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id) DO UPDATE
       SET walk_goal = $2, water_goal = $3, sleep_goal = $4, updated_at = NOW()
       RETURNING *`,
      [req.userId, walk_goal, water_goal, sleep_goal]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update goals' });
  }
});



const PORT = 3001; // different port from Expense Splitter, so you can run both if needed
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
