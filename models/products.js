const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: String,
    imageUrl: String,
    price: String,
    weight: String,
    roast: String,
});

module.exports = mongoose.model('Product', productSchema);