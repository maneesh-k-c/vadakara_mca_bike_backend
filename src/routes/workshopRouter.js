const express = require('express');
const workshopRouter = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const bikeData = require('../models/bikeSchema');
const reviewData = require('../models/reviewSchema');
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

workshopRouter.post('/add-bike',uploadImage.array('image', 1), async (req, res, next) => {
    try {
        const oldBike = await bikeData.findOne({ bike_name: req.body.bike_name,workshop_id:req.body.workshop_id });
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
    const bike = await bikeData.find({workshop_id:req.params.id})
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

workshopRouter.post('/update-bike/:id',uploadImage.array('image', 1), async (req, res) => {
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
    const id= req.params.id
    const deleteData = await bikeData.deleteOne({ _id: id });
    if (deleteData.deletedCount==1) {
    return res.status(200).json({
        Success: true,
        Error: false,
        Message: 'Bike deleted',
    });
    }else{
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










module.exports = workshopRouter