const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');

// Simple in-memory cache for stats
let cachedStats = null;
let cachedAt = 0;
// TTL in milliseconds (e.g., 30 seconds)
const STATS_TTL_MS = 30 * 1000;

// Invalidate cache when items.json changes on disk
try {
  fs.watch(DATA_PATH, () => {
    cachedStats = null;
    cachedAt = 0;
  });
} catch (watchError) {
  // If fs.watch fails (e.g., on some environments), we still have TTL as a fallback
}

// GET /api/stats
router.get('/', (req, res, next) => {
  const now = Date.now();

  // If we have fresh cached stats, return them immediately
  if (cachedStats && now - cachedAt < STATS_TTL_MS) {
    return res.json(cachedStats);
  }

  fs.readFile(DATA_PATH, (err, raw) => {
    if (err) return next(err);

    const items = JSON.parse(raw);
    // Intentional heavy CPU calculation
    const stats = {
      total: items.length,
      averagePrice:
        items.length === 0
          ? 0
          : items.reduce((acc, cur) => acc + (cur.price || 0), 0) / items.length,
    };

    // Update cache
    cachedStats = stats;
    cachedAt = now;

    res.json(stats);
  });
});

module.exports = router;