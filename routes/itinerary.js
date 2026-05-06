// routes/itinerary.js
const express = require('express');
const router = express.Router();
const ItineraryItem = require('../models/itinerary');
const { isLoggedIn } = require('../middleware');

// GET /itinerary — show user's itinerary
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const itineraryItems = await ItineraryItem.find({ owner: req.user._id })
      .sort({ day: 1, createdAt: 1 });
    res.render('itinerary/index', { itineraryItems });
  } catch (err) {
    req.flash('error', 'Could not load itinerary.');
    res.redirect('/listings');
  }
});

// POST /itinerary/add — add a listing to itinerary
router.post('/add', isLoggedIn, async (req, res) => {
  try {
    const { listingId, listingTitle, listingLocation, listingPrice, listingImage } = req.body;

    // Prevent duplicates
    const existing = await ItineraryItem.findOne({
      owner: req.user._id,
      listing: listingId
    });
    if (existing) {
      req.flash('error', 'This stay is already in your itinerary!');
      return res.redirect(`/listings/${listingId}`);
    }

    const item = new ItineraryItem({
      owner: req.user._id,
      listing: listingId,
      title: listingTitle,
      location: listingLocation,
      price: parseInt(listingPrice) || 0,
      image: listingImage,
      day: 1,
      nights: 2
    });

    await item.save();
    req.flash('success', `"${listingTitle}" added to your itinerary!`);
    res.redirect('/itinerary');
  } catch (err) {
    req.flash('error', 'Could not add to itinerary.');
    res.redirect('/listings');
  }
});

// DELETE /itinerary/:id — remove item
router.delete('/:id', isLoggedIn, async (req, res) => {
  try {
    const item = await ItineraryItem.findById(req.params.id);
    if (!item || !item.owner.equals(req.user._id)) {
      req.flash('error', 'Not authorised.');
      return res.redirect('/itinerary');
    }
    await ItineraryItem.findByIdAndDelete(req.params.id);
    req.flash('success', 'Stay removed from itinerary.');
    res.redirect('/itinerary');
  } catch (err) {
    req.flash('error', 'Could not remove item.');
    res.redirect('/itinerary');
  }
});

module.exports = router;