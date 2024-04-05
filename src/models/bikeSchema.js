const mongoose = require('mongoose');
const bikeSchema = new mongoose.Schema({
  workshop_id: { type: mongoose.Types.ObjectId, ref: 'workshop_tb' },
  bike_name: { type: String, require: true },
  bike_image: { type: [String], require: true },
  rate_per_day: { type: String },
  milage: { type: String },
  quantity:{ type: String},
  description: { type: String },
});

var bikeData = mongoose.model('bike_tb', bikeSchema);
module.exports = bikeData;
