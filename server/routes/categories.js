// routes/categories.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all categories with their subcategories
router.get('/', async (req, res) => {
  try {
    // Get all categories
    const categoriesQuery = await db.query('SELECT * FROM categories ORDER BY name');
    const categories = categoriesQuery.rows;

    // Get subcategories for each category
    for (const category of categories) {
      const subcategoriesQuery = await db.query(
        'SELECT * FROM subcategories WHERE category_id = $1 ORDER BY name',
        [category.category_id]
      );
      category.subcategories = subcategoriesQuery.rows;
    }

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;