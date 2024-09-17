const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CoffeeShop = require('../models/coffeeshops');
const imageList = require('./image');  // Import the image list

dotenv.config();

mongoose.connect(process.env.DB_URL || 'mongodb://localhost:27017/sipspot', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const fetchCoffeeShops = async () => {
    try {
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:60];area[name="Florida"]->.searchArea;node["cuisine"="donut;coffee_shop"](area.searchArea)["addr:city"]["addr:housenumber"]["addr:street"]["name"];out body;>;out skel qt;`;
        const response = await axios.get(overpassUrl); //"cuisine"="donut;coffee_shop" for dunkin donuts 
        const coffeeShops = response.data.elements;

        for (let shop of coffeeShops) {
            // Find the matching images for the shop
            const matchedImages = imageList.find(image => image.name.toLowerCase() === shop.tags.name.toLowerCase());

            // Use default image if no match is found
            const imagesToUse = matchedImages ? matchedImages.images : imageList.find(image => image.name === "Default").images;
            const productsToUse = matchedImages ? matchedImages.product : imageList.find(image => image.name === "Default").product;

            // Generate random numbers for price range
            const lowNumber = matchedImages ? matchedImages.pricelow : randomIntFromInterval(4, 10);
            const highNumber = matchedImages ? matchedImages.pricehigh : randomIntFromInterval(10, 20);

            const newShop = new CoffeeShop({
                title: shop.tags.name,
                geometry: {
                    type: "Point",
                    coordinates: [shop.lon, shop.lat]
                },
                location: `${shop.tags['addr:housenumber']} ${shop.tags['addr:street']}, ${shop.tags['addr:city']}`,
                description: matchedImages ? matchedImages.description : `Welcome to ${shop.tags.name}, where every cup tells a story. Nestled in the heart of ${shop.tags['addr:street']}, ${shop.tags['addr:city']}, our cozy café offers a perfect blend of artisanal coffee, delectable pastries, and a warm, inviting atmosphere. Whether you’re catching up with friends or enjoying a quiet moment alone, Brew Haven is your go-to spot for a delightful coffee experience.`,
                price: `$${lowNumber} - $${highNumber}`,
                author: "66e4b8a554a9f3ad31635651",
                image: imagesToUse,
                product: productsToUse
            });

            await newShop.save();
        }
        console.log('Coffee shops have been added to the database');
    } catch (error) {
        console.error('Error fetching or saving data:', error);
    } finally {
        mongoose.connection.close();
    }
};

fetchCoffeeShops();
