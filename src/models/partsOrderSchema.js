const mongoose = require('mongoose');
const partsOrderSchema = new mongoose.Schema({
  login_id: { type: mongoose.Types.ObjectId, ref: 'login_tb' },
  parts_id: { type: mongoose.Types.ObjectId, ref: 'parts_tb' },
  subtotal: { type: String, require: true },
  quantity: { type: String },
  status: { type: String,default: 'placed', },
});

var partsOrderData = mongoose.model('parts_order_tb', partsOrderSchema);
module.exports = partsOrderData;
