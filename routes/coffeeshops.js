const express = require('express');
const router = express.Router();
const multer = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const coffeeshops = require('../controllers/coffeeshops');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCoffeeShop, isAuthor } = require('../middleware');

router.route('/')
    .get(catchAsync(coffeeshops.index))
    .post(isLoggedIn, upload.array('image'), validateCoffeeShop, catchAsync(coffeeshops.createCoffeeShop))


router.get('/new', isLoggedIn, coffeeshops.renderNewForm);

router.route('/:id')
    .get(catchAsync(coffeeshops.showCoffeeShop))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCoffeeShop, catchAsync(coffeeshops.updateCoffeeShop))
    .delete(catchAsync(coffeeshops.deleteCoffeeShop))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(coffeeshops.renderEditForm));


module.exports = router;