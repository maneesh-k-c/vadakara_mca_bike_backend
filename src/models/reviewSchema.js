const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
  login_id: { type: mongoose.Types.ObjectId, ref: 'login_tb' },
  workshop_id: { type: mongoose.Types.ObjectId, ref: 'workshop_tb' },
  review: { type: String, require: true },
  rating: { type: String },
});

var reviewData = mongoose.model('review_tb', reviewSchema);
module.exports = reviewData;
