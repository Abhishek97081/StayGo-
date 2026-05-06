// models/itinerary.js
const mongoose = require('mongoose');

const itineraryItemSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  },
  title: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: ''
  },
  day: {
    type: Number,
    default: 1
  },
  nights: {
    type: Number,
    default: 2
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('ItineraryItem', itineraryItemSchema);