const CoffeeShop = require('../models/coffeeshops');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const coffeeshop = await CoffeeShop.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    coffeeshop.reviews.push(review);
    await review.save();
    await coffeeshop.save();
    req.flash('success', 'Review was created successfully');
    res.redirect(`/coffeeshops/${coffeeshop._id}`);
}


module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await CoffeeShop.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/coffeeshops/${id}`);
}