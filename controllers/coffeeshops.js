const CoffeeShop = require('../models/coffeeshops');
const Product = require('../models/products');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    let { location, distance, page } = req.query;
    let dbQueries = [];
    const limit = 25; // Number of items per page
    page = parseInt(page) || 1;

    // Location filter
    if (location) {
        let coordinates;
        try {
            // Attempt to parse the location as coordinates (JSON array)
            location = JSON.parse(location);
            coordinates = location; // Use the provided coordinates
        } catch (err) {
            // If not coordinates, geocode the location
            const response = await geocoder.forwardGeocode({
                query: location,
                limit: 1
            }).send();
            coordinates = response.body.features[0].geometry.coordinates;
        }

        // Convert distance to meters (default is 25 miles if not provided)
        let maxDistance = distance || 25;
        maxDistance *= 1609.34; // Miles to meters conversion

        dbQueries.push({
            geometry: {
                $geoWithin: {
                    $centerSphere: [coordinates, maxDistance / 6378137] // Divide by Earth's radius in meters to get radians
                }
            }
        });
    }

    // Fetch the total count of coffee shops for pagination
    const totalShops = await CoffeeShop.countDocuments(dbQueries.length ? { $and: dbQueries } : {});

    // Fetch the coffee shops with pagination
    const coffeeShops = await CoffeeShop.find(dbQueries.length ? { $and: dbQueries } : {})
        .skip((page - 1) * limit)
        .limit(limit);

    const totalPages = Math.ceil(totalShops / limit);

    res.render('coffeeshops/index', {
        coffeeshops: coffeeShops,
        query: req.query,
        totalPages,
        page
    });
}


module.exports.renderNewForm = (req, res) => {
    res.render('coffeeshops/new');
}

module.exports.createCoffeeShop = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.coffeeshop.location,
        limit: 1
    }).send();

    const coffeeshop = new CoffeeShop(req.body.coffeeshop);
    coffeeshop.geometry = geoData.body.features[0].geometry;
    coffeeshop.image = req.files.map(f => ({ url: f.path, filename: f.filename }));
    coffeeshop.author = req.user._id;

    // Create and save products
    const productData = req.body.products;
    const productIds = [];

    for (const product of productData) {
        const newProduct = new Product(product);
        await newProduct.save();
        productIds.push(newProduct._id); // Store the saved product's ID
    }

    coffeeshop.product = productIds; // Associate products with the coffee shop

    await coffeeshop.save();
    console.log(coffeeshop);

    req.flash('success', 'Successfully created new Coffee Shop!');
    res.redirect(`/coffeeshops/${coffeeshop._id}`);
}

module.exports.showCoffeeShop = async (req, res) => {
    const coffeeshop = await CoffeeShop.findById(req.params.id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author').populate('product');
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

module.exports.renderProducts = async (req, res) => {
    const { id, productId } = req.params;
    console.log(id);
    const product = await Product.findById(productId);
    const coffeeshop = await CoffeeShop.findById(id); // Fetch the coffee shop

    if (!product || !coffeeshop) {
        req.flash('error', 'Cannot find that product or coffee shop');
        return res.redirect('/coffeeshops');
    }

    res.render('coffeeshops/product', { product, coffeeshop });
};


module.exports.deleteCoffeeShop = async (req, res) => {
    const { id } = req.params;
    await CoffeeShop.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Coffee Shop');
    res.redirect('/coffeeshops')
}
