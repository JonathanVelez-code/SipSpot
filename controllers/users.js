const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registerUser = await User.register(user, password);
        req.login(registerUser, err => {
            if (err) return next(err);
            req.flash('success', "Register Success");
            res.redirect('/coffeeshops');
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'Successfully logged in');

    // Store redirect URL or fallback to '/coffeeshops'
    const redirectUrl = req.session.returnTo || '/coffeeshops';

    // Clear returnTo after using it to avoid future issues
    delete req.session.returnTo;

    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/coffeeshops'); // Redirect if there's an error
        }
        req.flash('success', "Successfully logged out");
        res.redirect('/coffeeshops'); // Redirect after successful logout
    });
}