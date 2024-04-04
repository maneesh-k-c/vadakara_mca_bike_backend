const mongoose = require('mongoose');
const workshopSchema = new mongoose.Schema({
  login_id: { type: mongoose.Types.ObjectId, ref: 'login_tb' },
  workshop_name: { type: String, require: true },
  address: { type: String, require: true },
  mobile: { type: String, require: true },
  images: { type: [String], require: true },
});

var workshopData = mongoose.model('workshop_tb', workshopSchema);
module.exports = workshopData;
