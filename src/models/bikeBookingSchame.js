const mongoose = require('mongoose');
const bikeBookingSchema = new mongoose.Schema({
  login_id: { type: mongoose.Types.ObjectId, ref: 'login_tb' },
  bike_id: { type: mongoose.Types.ObjectId, ref: 'parts_tb' },
  pickup_date: { type: String, require: true },
  dropoff_date: { type: String, require: true },
  pickup_time: { type: String, require: true },
  bike_quantity: { type: String, require: true },
  status: { type: String,default: 'pending', },
});

var bikeBookingData = mongoose.model('bike_booking_tb', bikeBookingSchema);
module.exports = bikeBookingData;
