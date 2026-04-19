const express = require('express');
const router = express.Router();
const pool = require('../db');

// summary stats
router.get('/', async (req, res) => {
  try {
    const [[summary]] = await pool.execute(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(blocked) as total_blocked,
        ROUND(AVG(duration_ms)) as avg_duration,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as requests_today
      FROM request_logs
    `);
    res.json({ data: summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
});

// recent logs
router.get('/logs', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT method, path, status_code, duration_ms, ip, blocked, created_at
      FROM request_logs
      ORDER BY created_at DESC
      LIMIT 50
    `);
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
});

// top paths
router.get('/top-paths', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT path, COUNT(*) as count
      FROM request_logs
      GROUP BY path
      ORDER BY count DESC
      LIMIT 10
    `);
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
});

module.exports = router;