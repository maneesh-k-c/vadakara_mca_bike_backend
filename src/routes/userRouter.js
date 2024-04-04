const express = require('express');
const mechanicData = require('../models/mechanicSchema');
const loginData = require('../models/loginSchema');
const reviewData = require('../models/reviewSchema');
const { default: mongoose } = require('mongoose');
const userData = require('../models/userSchema');
const partsData = require('../models/partsSchema');
const cartData = require('../models/cartSchema');
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

userRouter.post('/update-cart-quantity/:login_id/:parts_id',async (req, res) => {
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

                { $set: { quantity: quantity,subtotal: sub } }
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

module.exports = userRouter