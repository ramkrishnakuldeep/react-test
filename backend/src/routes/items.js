const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data (now async and non-blocking)
async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('Data file not found');
    }
    throw error;
  }
}

// Utility to write data (async and non-blocking)
async function writeData(data) {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    throw new Error('Failed to write data file');
  }
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {    
    const data = await readData();
    const { 
      limit, 
      q, 
      page = 1, 
      pageSize = 10 
    } = req.query;
        
    let results = data;
    const totalItems = data.length;

    // Apply search filter first
    if (q) {
      // Enhanced search: search in name, category, and description if available
      const searchTerm = q.toLowerCase().trim();
      results = results.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        (item.category && item.category.toLowerCase().includes(searchTerm)) ||
        (item.description && item.description.toLowerCase().includes(searchTerm))
      );
    }

    const totalFilteredItems = results.length;

    // Apply pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSizeNum = Math.max(1, Math.min(100, parseInt(pageSize, 10))); // Max 100 items per page
    const startIndex = (pageNum - 1) * pageSizeNum;
    const endIndex = startIndex + pageSizeNum;

    const paginatedResults = results.slice(startIndex, endIndex);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalFilteredItems / pageSizeNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    // Legacy limit support (for backward compatibility)
    if (limit && !req.query.page && !req.query.pageSize) {
      results = results.slice(0, parseInt(limit));
      return res.json(results);
    }
    // Return paginated response with metadata
    const response = {
      items: paginatedResults,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        totalItems: totalFilteredItems,
        totalPages,
        hasNext,
        hasPrev,
        totalItemsBeforeFilter: totalItems
      },
      search: q || null
    };
    
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission)
    const item = req.body;
    const data = await readData();
    item.id = Date.now();
    data.push(item);
    await writeData(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;