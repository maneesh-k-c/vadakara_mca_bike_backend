const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({
    login_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'login_tb',
        required: true,
      },
      parts_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'parts_tb',
        required: true,
      },
     
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1, required: true },
      subtotal: {
        type: Number,
        default: function () {
          return this.price;
        },
      },
    
      status: { type: String, default: 'pending', require: true },
    });

var cartData = mongoose.model('cart_tb', cartSchema);
module.exports = cartData;
