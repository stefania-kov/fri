const productService = require('../services/productService');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (err) {
    console.error('Error getting products:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ 
      error: err.message || 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};