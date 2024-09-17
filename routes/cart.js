const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const cart = require('../controllers/cart');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Product = require('../models/products');

// Add item to cart
router.post('/add', isLoggedIn, catchAsync(cart.addToCart));

// View cart
router.get('/', isLoggedIn, catchAsync(cart.viewCart));

// Clear cart (optional)
router.post('/clear', isLoggedIn, cart.clearCart);

module.exports = router;