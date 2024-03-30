const mongoose = require('mongoose');
const mechanicSchema = new mongoose.Schema({
  login_id: { type: mongoose.Types.ObjectId, ref: 'login_tb' },
  workshop_id: { type: mongoose.Types.ObjectId, ref: 'workshop_tb' },
  name: { type: String, require: true },
  address: { type: String, require: true },
  mobile: { type: String, require: true },
  qualification: { type: String, require: true },
});

var mechanicData = mongoose.model('mechanic_tb', mechanicSchema);
module.exports = mechanicData;
