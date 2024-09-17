const CoffeeShop = require('../models/coffeeshops');
const Product = require('../models/products');

module.exports.addToCart = async (req, res) => {
    const { productId } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
        req.flash('error', 'Product not found');
        return res.redirect('back');
    }

    // Initialize cart if it doesn't exist
    if (!req.session.cart) {
        req.session.cart = [];
    }

    // Add product to cart
    req.session.cart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: 1 // You can add functionality to choose quantity
    });

    req.flash('success', `${product.name} added to cart`);
    res.redirect('/cart');
}

module.exports.viewCart = async (req, res) => {
    const cart = req.session.cart || [];
    res.render('cart', { cart });
};

module.exports.clearCart = (req, res) => {
    req.session.cart = [];
    req.flash('success', 'Cart cleared');
    res.redirect('/cart');
};
