const mongoose = require('mongoose');
const CoffeeShop = require('../models/coffeeshops');
const locations = require('./locations');

mongoose.connect('mongodb://localhost:27017/sipspot');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
});

const seedDB = async () => {
    await CoffeeShop.deleteMany({}); // Clear out the collection

    for (let i = 0; i < locations.length; i++) {
        const shop = new CoffeeShop({
            author: '66c76f598bac6f7cc1bede68',
            title: locations[i].title,
            location: `${locations[i].address}, ${locations[i].city}`,
            image: locations[i].imageurl.map(url => ({
                url: url,
                filename: '' // Add filename logic if needed
            })),
            description: locations[i].description,
            price: `${locations[i].pricelow}-${locations[i].pricehigh}`,
            geometry: {
                type: 'Point',
                coordinates: [locations[i].longitude, locations[i].latitude] // Add your longitude and latitude here
            }
        });
        await shop.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close(); // Close the connection once seeding is done
});