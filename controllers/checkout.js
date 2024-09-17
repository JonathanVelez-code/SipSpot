const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports.createCheckoutSession = async (req, res) => {
    const cart = req.session.cart || [];

    if (cart.length === 0) {
        req.flash('error', 'Your cart is empty');
        return res.redirect('/cart');
    }

    // Create line items for Stripe
    const lineItems = cart.map(item => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: item.name,
                images: [item.imageUrl],
            },
            unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
    }));

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/cart`,
    });

    res.redirect(303, session.url);
};

module.exports.checkoutSuccess = (req, res) => {
    // Clear the cart after successful payment
    req.session.cart = [];
    res.render('checkout_success');
};
