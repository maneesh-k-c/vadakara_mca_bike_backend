const mongoose = require('mongoose');
const partsSchema = new mongoose.Schema({
  login_id: { type: mongoose.Types.ObjectId, ref: 'login_tb' },
  workshop_id: { type: mongoose.Types.ObjectId, ref: 'workshop_tb' },
  part_name: { type: String, require: true },
  rate: { type: String },
  quantity: { type: String },
  description: { type: String },
});

var partsData = mongoose.model('parts_tb', partsSchema);
module.exports = partsData;
