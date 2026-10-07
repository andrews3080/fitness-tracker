// pages/Goals.jsx
import { useState, useEffect } from 'react';
import { FaWalking, FaTint, FaBed } from 'react-icons/fa';
import { useLogsData } from '../useLogsData';
import { useToast } from '../ToastContext';

function Goals() {
  const { goals, updateGoals } = useLogsData();
  const showToast = useToast();

  const [walkGoal, setWalkGoal] = useState('');
  const [waterGoal, setWaterGoal] = useState('');
  const [sleepGoal, setSleepGoal] = useState('');

  useEffect(() => {
    if (goals) {
      setWalkGoal(goals.walk_goal);
      setWaterGoal(goals.water_goal);
      setSleepGoal(goals.sleep_goal);
    }
  }, [goals]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateGoals({
        walk_goal: Number(walkGoal),
        water_goal: Number(waterGoal),
        sleep_goal: Number(sleepGoal),
      });
      showToast('Goals updated');
    } catch (err) {
      console.error(err);
      showToast('Failed to update goals', 'error');
    }
  };

  if (!goals) return <p className="empty-note">Loading...</p>;

  return (
    <>
      <div className="main-header">
        <h1>Goals</h1>
        <p>Set your daily targets for each activity.</p>
      </div>

      <form onSubmit={handleSave} className="goal-targets">
        <div className="goal-target-card">
          <span className="goal-target-icon walk"><FaWalking /></span>
          <label>
            Steps
            <input type="number" value={walkGoal} onChange={e => setWalkGoal(e.target.value)} />
          </label>
        </div>

        <div className="goal-target-card">
          <span className="goal-target-icon water"><FaTint /></span>
          <label>
            Water (ml)
            <input type="number" value={waterGoal} onChange={e => setWaterGoal(e.target.value)} />
          </label>
        </div>

        <div className="goal-target-card">
          <span className="goal-target-icon sleep"><FaBed /></span>
          <label>
            Sleep (hrs)
            <input type="number" step="0.5" value={sleepGoal} onChange={e => setSleepGoal(e.target.value)} />
          </label>
        </div>

        <button type="submit" className="goal-targets-save">Save Goals</button>
      </form>
    </>
  );
}

export default Goals;