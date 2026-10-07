// utils.js

// Turns [{type, logged_at, total}, ...] into
// [{ date: 'Sep 25', walk: 8200, water: 2000, sleep: 7.5 }, ...]
export function shapeWeeklyData(weekly) {
  const byDate = {};

  weekly.forEach(row => {
    const dateLabel = new Date(row.logged_at).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    });
    if (!byDate[dateLabel]) {
      byDate[dateLabel] = { date: dateLabel, walk: 0, water: 0, sleep: 0 };
    }
    byDate[dateLabel][row.type] = Number(row.total);
  });

  return Object.values(byDate);
}