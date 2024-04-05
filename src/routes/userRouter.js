const express = require('express');
const mechanicData = require('../models/mechanicSchema');
const loginData = require('../models/loginSchema');
const reviewData = require('../models/reviewSchema');
const { default: mongoose } = require('mongoose');
const userData = require('../models/userSchema');
const partsData = require('../models/partsSchema');
const cartData = require('../models/cartSchema');
const partsOrderData = require('../models/partsOrderSchema');
const bikeData = require('../models/bikeSchema');
const bikeBookingData = require('../models/bikeBookingSchame');
const userRouter = express.Router();

userRouter.get('/update-user-profile/:id', async (req, res) => {
    try {
        const id = req.params.id
        const oldData = await userData.findOne({ login_id: id });
        let reg = {
            name: req.query.name ? req.query.name : oldData.name,
            mobile: req.query.mobile ? req.query.mobile : oldData.mobile,
            address: req.query.address ? req.query.address : oldData.address,
            qualification: req.query.qualification ? req.query.qualification : oldData.qualification
        };

        console.log(reg);
        const update = await userData.updateOne({ login_id: id }, { $set: reg })
        if (update.modifiedCount == 1) {
            return res.status(200).json({
                Success: true,
                Error: false,
                Message: 'Profile updated',
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Error while updating profile',
            });
        }
    } catch (error) {
        return res.status(400).json({
            Success: false,
            Error: true,
            Message: 'Something went wrong!',
        });
    }
})

userRouter.get('/change-password-user/:id', async (req, res) => {
    try {
        const id = req.params.id
        const oldData = await loginData.findOne({ _id: id });
        let reg = {
            password: req.query.password ? req.query.password : oldData.password,
        };

        console.log(reg);
        const update = await loginData.updateOne({ _id: id }, { $set: reg })
        if (update.modifiedCount == 1) {
            return res.status(200).json({
                Success: true,
                Error: false,
                Message: 'Password updated',
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Error while updating password',
            });
        }
    } catch (error) {
        return res.status(400).json({
            Success: false,
            Error: true,
            Message: 'Something went wrong!',
        });
    }
})

userRouter.post('/add-review', async (req, res, next) => {
    try {


        let details = {
            login_id: req.body.login_id,
            workshop_id: req.body.workshop_id,
            review: req.body.review,
            rating: req.body.rating,
        };


        const result2 = await reviewData(details).save();
        if (result2) {
            return res.status(200).json({
                Success: true,
                Error: false,
                data: result2,
                Message: 'Review added',
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Failed to add review',
            });

        }

    } catch (error) {
        return res.status(400).json({
            Success: false,
            Error: true,
            Message: 'Something went wrong',
        });
    }
});

userRouter.get('/view-review/:id', async (req, res) => {
    try {
        const review = await reviewData.aggregate([
            {
                '$lookup': {
                    'from': 'user_tbs',
                    'localField': 'login_id',
                    'foreignField': 'login_id',
                    'as': 'user'
                }
            }, {
                '$lookup': {
                    'from': 'workshop_tbs',
                    'localField': 'workshop_id',
                    'foreignField': '_id',
                    'as': 'workshop'
                }
            },
            {
                '$unwind': '$user'
            },
            {
                '$unwind': '$workshop'
            },
            {
                '$match': {
                    'workshop_id': new mongoose.Types.ObjectId(req.params.id)
                }
            }
        ])
        if (review[0]) {
            return res.status(200).json({
                Success: true,
                Error: false,
                data: review
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                data: 'No data found'
            });
        }
    } catch (error) {
        return res.status(400).json({
            Success: false,
            Error: true,
            data: 'Something went wrong'
        });
    }

})

userRouter.get('/view-all-parts', async (req, res) => {
    try {
        const parts = await partsData.find()
        if (parts[0]) {
            return res.status(200).json({
                Success: true,
                Error: false,
                data: parts
            });

        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                data: 'No data found'
            });
        }
    } catch (error) {
        return res.status(400).json({
            Success: false,
            Error: true,
            data: 'Something went wrong'
        });
    }

})

userRouter.post('/add-parts-to-cart/:login_id/:parts_id', async (req, res) => {
    try {
        const login_id = req.params.login_id;
        const partId = req.params.parts_id;

        const existingProduct = await cartData.findOne({
            parts_id: partId,
            login_id: login_id,
        });
        if (existingProduct) {
            const quantity = existingProduct.quantity;
            const updatedQuantity = quantity + 1;
            const sub = updatedQuantity * existingProduct.price
            console.log(sub);
            const updatedData = await cartData.updateOne(
                { _id: existingProduct._id },
                { $set: { quantity: updatedQuantity, subtotal: sub } }
            );

            return res.status(200).json({
                success: true,
                error: false,
                data: updatedData,
                message: 'incremented existing product quantity',
            });
        } else {
            const cartDatas = {
                login_id: login_id,
                parts_id: partId,
                price: req.body.price,
            };
            const Data = await cartData(cartDatas).save();
            if (Data) {
                return res.status(200).json({
                    Success: true,
                    Error: false,
                    data: Data,
                    Message: 'Product added to cart successfully',
                });
            } else {
                return res.status(400).json({
                    Success: false,
                    Error: true,
                    Message: 'Product adding failed',
                });
            }
        }
    } catch (error) {
        return res.status(500).json({
            Success: false,
            Error: true,
            Message: 'Internal Server error',
            ErrorMessage: error.message,
        });
    }
});

userRouter.post('/update-cart-quantity/:login_id/:parts_id', async (req, res) => {
    try {
        const login_id = req.params.login_id;
        const part_id = req.params.parts_id;
        const quantity = req.body.quantity;
        const existingProduct = await cartData.findOne({
            parts_id: part_id,
            login_id: login_id,
        });
        const sub = quantity * existingProduct.price
        const updatedData = await cartData.updateOne(
            { parts_id: part_id, login_id: login_id },

            { $set: { quantity: quantity, subtotal: sub } }
        );

        if (updatedData) {
            return res.status(200).json({
                Success: true,
                Error: false,
                data: updatedData,
                Message: 'cart updated successfully',
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Cart update failed',
            });
        }
    } catch (error) {
        return res.status(500).json({
            Success: false,
            Error: true,
            Message: 'Internal Server error',
            ErrorMessage: error.message,
        });
    }
}
);

userRouter.get('/view-cart/:id', async (req, res) => {
    try {
        const parts = await cartData.aggregate([
            {
                '$lookup': {
                    'from': 'parts_tbs',
                    'localField': 'parts_id',
                    'foreignField': '_id',
                    'as': 'parts'
                }
            },
            {
                '$unwind': '$parts'
            },
            {
                '$match': {
                    'login_id': new mongoose.Types.ObjectId(req.params.id)
                }
            },
            {
                '$match': {
                    'status': 'pending'
                }
            },
            {
                '$group': {
                    '_id': '$_id',
                    'parts_image': {
                        '$first': {
                            '$cond': {
                                if: { '$ne': ['$parts.parts_image', null] },
                                then: '$parts.parts_image',
                                else: 'default_image_url',
                            },
                        },
                    },
                    'part_name': { '$first': '$parts.part_name' },
                    'rate': { '$first': '$parts.rate' },
                    'description': { '$first': '$parts.description' },
                    'rate': { '$first': '$parts.rate' },
                    'quantity': { '$first': '$parts.quantity' },
                    'subtotal': { '$first': '$subtotal' },
                    'parts_id': { '$first': '$parts_id' },
                    'status': { '$first': '$status' },
                }
            }
        ])
        console.log(parts);
        if (parts[0]) {
            var total = 0
            parts.forEach((item) => {
              total += item.subtotal;
            });
            return res.status(200).json({
                totalAmount:total,
                Success: true,
                Error: false,
                data: parts,
            });

        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                data: 'No data found'
            });
        }
    } catch (error) {
        return res.status(400).json({
            Success: false,
            Error: true,
            data: 'Something went wrong'
        });
    }

})

userRouter.get('/delete-cart/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const deleteData = await cartData.deleteOne({ _id: id });
        if (deleteData.deletedCount == 1) {
            return res.status(200).json({
                Success: true,
                Error: false,
                Message: 'Data removed from cart',
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Failed to delete',
            });
        }
    } catch (error) {
        return res.json({
            Success: false,
            Error: true,
            Message: 'Something went wrong',
        });
    }
});

userRouter.post('/order-parts/:login_id', async (req, res) => {
    try {
        const login_id = req.params.login_id;

        const existingProduct = await cartData.find({
            status: 'pending',
            login_id: login_id,
        });
        const datas = [];
        for (let i = 0; i < existingProduct.length; i++) {
            const oderData = new partsOrderData({
                parts_id: existingProduct[i].parts_id,
                login_id: login_id,
                subtotal: existingProduct[i].subtotal,
                quantity: existingProduct[i].quantity,
            });
            const old_id = existingProduct[i]._id
            const update = await cartData.updateOne({ _id: old_id }, { status: "pending" })
            datas.push(await oderData.save());
        }

        if (datas[0]) {
            return res.status(200).json({
                Success: true,
                Error: false,
                Message: 'Order placed',
            });
        }
        else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Failed to order',

            });
        }



    } catch (error) {
        return res.status(500).json({
            Success: false,
            Error: true,
            Message: 'Internal Server error',
            ErrorMessage: error.message,
        });
    }
});

userRouter.get('/view-orders/:id', async (req, res) => {
    try {
        const order = await partsOrderData.aggregate([
            {
                '$lookup': {
                  'from': 'parts_tbs', 
                  'localField': 'parts_id', 
                  'foreignField': '_id', 
                  'as': 'parts'
                }
              }, {
                '$lookup': {
                  'from': 'workshop_tbs', 
                  'localField': 'parts.workshop_id', 
                  'foreignField': '_id', 
                  'as': 'workshop'
                }
              },
            {
                '$unwind': '$parts'
            },
            {
                '$unwind': '$workshop'
            },
            {
                '$match': {
                    'login_id': new mongoose.Types.ObjectId(req.params.id)
                }
            },
            {
                '$group': {
                    '_id': '$_id',
                    'parts_image': {
                        '$first': {
                            '$cond': {
                                if: { '$ne': ['$parts.parts_image', null] },
                                then: '$parts.parts_image',
                                else: 'default_image_url',
                            },
                        },
                    },
                    'part_name': { '$first': '$parts.part_name' },
                    'workshop_name': { '$first': '$workshop.workshop_name' },
                    'rate': { '$first': '$parts.rate' },
                    'description': { '$first': '$parts.description' },
                    'rate': { '$first': '$parts.rate' },
                    'quantity': { '$first': '$quantity' },
                    'subtotal': { '$first': '$subtotal' },
                    'status': { '$first': '$status' },
                }
            }
        ])
        if (order[0]) {
            return res.status(200).json({
                Success: true,
                Error: false,
                data: order
            });

        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                data: 'No data found'
            });
        }
    } catch (error) {
        return res.status(400).json({
            Success: false,
            Error: true,
            data: 'Something went wrong'
        });
    }

})

userRouter.get('/view-all-bikes', async (req, res) => {
    try {
        const bike = await bikeData.find()
        if (bike[0]) {
            return res.status(200).json({
                Success: true,
                Error: false,
                data: bike
            });
            
        }else{
            return res.status(400).json({
                Success: false,
                Error: true,
                data: 'No data found'
            });
        }
    } catch (error) {
        return res.status(400).json({
            Success: false,
            Error: true,
            data: 'Something went wrong'
        });
    }
    
})

userRouter.post('/book-bike/:login_id', async (req, res) => {
    try {
        const login_id = req.params.login_id;

        const existingBooking = await bikeBookingData.find({
            status: 'pending',
            login_id: login_id,
        });
        if(existingBooking[0]){
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Already booked waiting for confirmation',

            });
        }
        
            const bookingData = {
                bike_id: req.body.bike_id,
                login_id: login_id,
                pickup_date: req.body.pickup_date,
                dropoff_date: req.body.dropoff_date,
                pickup_time: req.body.pickup_time,
                bike_quantity: req.body.bike_quantity,
            }
            console.log(bookingData);
            const booking = await bikeBookingData(bookingData).save()
            if(booking){
                const bikeDetails = await bikeData.findOne({_id:bookingData.bike_id})
                const avalable = Number(bikeDetails.quantity)-Number(bookingData.bike_quantity)
                const update = await bikeData.updateOne({ _id: bookingData.bike_id }, { bike_quantity: avalable })
            
                return res.status(200).json({
                    Success: true,
                    Error: false,
                    Message: 'Booking under process',
                });            
            } else {
                return res.status(400).json({
                    Success: false,
                    Error: true,
                    Message: 'Failed to order',
    
                });
            }
              

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            Success: false,
            Error: true, 
            Message: 'Internal Server error',
            ErrorMessage: error.message,
        });
    }
});

module.exports = userRouter