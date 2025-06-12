const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.product_id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.compare_at_price,
        p.is_featured,
        p.is_active,
        s.name AS subcategory,
        c.name AS category,
        i.image_url
      FROM products p
      LEFT JOIN subcategories s ON p.subcategory_id = s.subcategory_id
      LEFT JOIN categories c ON s.category_id = c.category_id
      LEFT JOIN product_images i ON i.product_id = p.product_id AND i.is_primary = TRUE
      WHERE p.is_active = TRUE
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
});


// Search products by category/subcategory name
router.get('/search/:query', async (req, res) => {
  const query = req.params.query.toLowerCase();
  try {
    const products = await pool.query(
      `
      SELECT 
        p.product_id, p.name, p.slug, p.description, p.price,
        i.image_url,
        s.name AS subcategory,
        c.name AS category
      FROM products p
      LEFT JOIN subcategories s ON p.subcategory_id = s.subcategory_id
      LEFT JOIN categories c ON s.category_id = c.category_id
      LEFT JOIN product_images i ON i.product_id = p.product_id AND i.is_primary = true
      WHERE LOWER(p.name) LIKE $1
         OR LOWER(s.name) LIKE $1
         OR LOWER(c.name) LIKE $1
      `,
      [`%${query}%`]
    );

    res.json(products.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while searching products' });
  }
});

router.post('/manual-payment', (req, res) => {
  const { email, txnId, total, items } = req.body;
  console.log("Received payment confirmation:", req.body);
  // You can store this in a database or send an email

  res.json({ message: 'Order received! We’ll get back to you shortly.' });
});



module.exports = router;