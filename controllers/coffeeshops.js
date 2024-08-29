const CoffeeShop = require('../models/coffeeshops');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');


module.exports.index = async (req, res) => {
    const coffeeshops = await CoffeeShop.find({});
    res.render('coffeeshops/index', { coffeeshops });
}

module.exports.renderNewForm = (req, res) => {
    res.render('coffeeshops/new');
}

module.exports.createCoffeeShop = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.coffeeshop.location,
        limit: 1
    }).send()
    const coffeeshop = new CoffeeShop(req.body.coffeeshop);
    coffeeshop.geometry = geoData.body.features[0].geometry;
    coffeeshop.image = req.files.map(f => ({ url: f.path, filename: f.filename }));
    coffeeshop.author = req.user._id;
    await coffeeshop.save();
    console.log(coffeeshop);
    req.flash('success', 'Successfully created new Coffee Shop!');
    res.redirect(`/coffeeshops/${coffeeshop._id}`);
}

module.exports.showCoffeeShop = async (req, res) => {
    const coffeeshop = await CoffeeShop.findById(req.params.id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author');
    if (!coffeeshop) {
        req.flash('error', 'Can not find Coffee Shop');
        return res.redirect('/coffeeshops');
    }
    res.render('coffeeshops/show', { coffeeshop });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const coffeeshop = await CoffeeShop.findById(id);
    if (!coffeeshop) {
        req.flash('error', 'Can not find Coffee Shop');
        return res.redirect('/coffeeshops');
    }
    res.render('coffeeshops/edit', { coffeeshop });
}

module.exports.updateCoffeeShop = async (req, res) => {
    const { id } = req.params;
    const coffeeshop = await CoffeeShop.findByIdAndUpdate(id, { ...req.body.coffeeshop });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    coffeeshop.image.push(...imgs);
    await coffeeshop.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await coffeeshop.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } });

    }
    req.flash('success', 'Successfully updated Coffee Shop');
    res.redirect(`/coffeeshops/${coffeeshop._id}`);
}

module.exports.deleteCoffeeShop = async (req, res) => {
    const { id } = req.params;
    await CoffeeShop.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Coffee Shop');
    res.redirect('/coffeeshops')
}
