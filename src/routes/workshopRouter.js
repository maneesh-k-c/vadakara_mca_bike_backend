const express = require('express');
const workshopRouter = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const bikeData = require('../models/bikeSchema');
const reviewData = require('../models/reviewSchema');
const bikeBookingData = require('../models/bikeBookingSchame');
const workshopData = require('../models/workshopSchema');
const { default: mongoose } = require('mongoose');
require('dotenv').config();
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
});
const storageImage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'bike',
    },
});
const uploadImage = multer({ storage: storageImage });

workshopRouter.post('/add-bike', uploadImage.array('image', 1), async (req, res, next) => {
    try {
        const oldBike = await bikeData.findOne({ bike_name: req.body.bike_name, workshop_id: req.body.workshop_id });
        if (oldBike) {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Bike already existc',
            });
        }

        let details = {
            workshop_id: req.body.workshop_id,
            bike_name: req.body.bike_name,
            rate_per_day: req.body.rate_per_day,
            milage: req.body.milage,
            quantity: req.body.quantity,
            description: req.body.description,
            bike_image: req.files ? req.files.map((file) => file.path) : null,
        };


        const result2 = await bikeData(details).save();
        if (result2) {
            return res.status(200).json({
                Success: true,
                Error: false,
                data: result2,
                Message: 'Bike added',
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Failed to add bike',
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

workshopRouter.get('/view-all-bike/:id', async (req, res) => {
    try {
        const bike = await bikeData.find({ workshop_id: req.params.id })
        if (bike[0]) {
            return res.status(200).json({
                Success: true,
                Error: false,
                data: bike
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

workshopRouter.post('/update-bike/:id', uploadImage.array('image', 1), async (req, res) => {
    try {
        const id = req.params.id
        const oldData = await bikeData({ _id: id });
        let updateData = {
            bike_name: req.body.bike_name ? req.body.bike_name : oldData.bike_name,
            rate_per_day: req.body.rate_per_day ? req.body.rate_per_day : oldData.rate_per_day,
            milage: req.body.milage ? req.body.milage : oldData.milage,
            quantity: req.body.quantity ? req.body.quantity : oldData.quantity,
            description: req.body.description ? req.body.description : oldData.description,
            bike_image: req.files ? req.files.map((file) => file.path) : oldData.bike_image,

        };

        console.log(updateData);
        const update = await bikeData.updateOne({ _id: id }, { $set: updateData })
        if (update.modifiedCount == 1) {
            return res.status(200).json({
                Success: true,
                Error: false,
                Message: 'Bike Data updated',
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Error while updating bike',
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

workshopRouter.get('/delete-bike/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const deleteData = await bikeData.deleteOne({ _id: id });
        if (deleteData.deletedCount == 1) {
            return res.status(200).json({
                Success: true,
                Error: false,
                Message: 'Bike deleted',
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


workshopRouter.get('/view-review/:id', async (req, res) => {
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

workshopRouter.get('/view-all-bike-booking/:workshopId', async (req, res) => {
    try {
        const id = req.params.workshopId
        const bike = await bikeBookingData.aggregate([
            {
                '$lookup': {
                    'from': 'bike_tbs',
                    'localField': 'bike_id',
                    'foreignField': '_id',
                    'as': 'bike'
                }
            }, {
                '$lookup': {
                    'from': 'workshop_tbs',
                    'localField': 'bike.workshop_id',
                    'foreignField': '_id',
                    'as': 'workshop'
                }
            },
            {
                '$unwind': '$bike'
            },
            {
                '$unwind': '$workshop'
            },
            {
                '$match': {
                    'workshop._id': new mongoose.Types.ObjectId(id)
                }
            },
            {
                '$group': {
                    '_id': '$_id',
                    'login_id': { '$first': '$login_id' },
                    'bike_id': { '$first': '$bike_id' },
                    'pickup_date': { '$first': '$pickup_date' },
                    'dropoff_date': { '$first': '$dropoff_date' },
                    'pickup_time': { '$first': '$pickup_time' },
                    'bike_quantity': { '$first': '$bike_quantity' },
                    'status': { '$first': '$status' },
                    'bike_name': { '$first': '$bike.bike_name' },
                    'bike_image': { '$first': '$bike.bike_image' },
                }
            }
        ])
        console.log(bike);
        if (bike[0]) {
            return res.status(200).json({
                Success: true,
                Error: false,
                data: bike
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


workshopRouter.post('/update-workshop-profile/:id', async (req, res) => {
    try {
        const id = req.params.id
        const oldData = await workshopData.findOne({ login_id: id });
        let reg = {
            workshop_name: req.body.workshop_name ? req.body.workshop_name : oldData.workshop_name,
            mobile: req.body.mobile ? req.body.mobile : oldData.mobile,
            address: req.body.address ? req.body.address : oldData.address,
        };

        console.log(reg);
        const update = await workshopData.updateOne({ login_id: id }, { $set: reg })
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

workshopRouter.get('/accept-bike-booking/:id', async (req, res) => {
    try {
        const id = req.params.id
      
        const update = await bikeBookingData.updateOne({ _id: id }, { $set: {status: 'confirmed'} })
        if (update.modifiedCount == 1) {
            return res.status(200).json({
                Success: true,
                Error: false,
                Message: 'Booking confirmed',
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Error while updating',
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

workshopRouter.get('/reject-bike-booking/:id', async (req, res) => {
    try {
        const id = req.params.id
      
        const update = await bikeBookingData.updateOne({ _id: id }, { $set: {status: 'rejected'} })
        if (update.modifiedCount == 1) {
            return res.status(200).json({
                Success: true,
                Error: false,
                Message: 'Booking confirmed',
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Error while updating',
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




module.exports = workshopRouter
