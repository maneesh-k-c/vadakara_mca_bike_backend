const express = require('express');
const mechanicData = require('../models/mechanicSchema');
const loginData = require('../models/loginSchema');
const partsData = require('../models/partsSchema');
const mechanicRouter = express.Router();
const partsOrderData = require('../models/partsOrderSchema');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
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

mechanicRouter.post('/update-mechanic-profile/:id', async (req, res) => {
    try {
        const id = req.params.id
        const oldData = await mechanicData.findOne({ login_id: id });
        let reg = {
            name: req.body.name ? req.body.name : oldData.name,
            mobile: req.body.mobile ? req.body.mobile : oldData.mobile,
            address: req.body.address ? req.body.address : oldData.address,
            qualification: req.body.qualification ? req.body.qualification : oldData.qualification
        };

        console.log(reg);
        const update = await mechanicData.updateOne({ login_id: id }, { $set: reg })
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

mechanicRouter.get('/change-password-mechanic/:id', async (req, res) => {
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

mechanicRouter.post('/add-parts', uploadImage.array('image', 1), async (req, res, next) => {
    try {


        let details = {
            login_id: req.body.login_id,
            workshop_id: req.body.workshop_id,
            part_name: req.body.part_name,
            rate: req.body.rate,
            quantity: req.body.quantity,
            description: req.body.description,
            parts_image: req.files ? req.files.map((file) => file.path) : null,
        };


        const result2 = await partsData(details).save();
        if (result2) {
            return res.status(200).json({
                Success: true,
                Error: false,
                data: result2,
                Message: 'Parts added',
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Failed to add parts',
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

mechanicRouter.get('/view-all-parts/:id', async (req, res) => {
    try {
        const parts = await partsData.find({ workshop_id: req.params.id })
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

mechanicRouter.post('/update-parts/:id', uploadImage.array('image', 1), async (req, res) => {
    try {
        const id = req.params.id
        const oldData = await partsData.findOne({ _id: id });
        console.log(id,oldData.parts_image);
        let parts = {
            part_name: req.body.part_name ? req.body.part_name : oldData.part_name,
            rate: req.body.rate ? req.body.rate : oldData.rate,
            quantity: req.body.quantity ? req.body.quantity : oldData.quantity,
            description: req.body.description ? req.body.description : oldData.description,
            parts_image: req.files ? req.files.map((file) => file.path) : oldData.parts_image,

        };

        console.log(parts);
        const update = await partsData.updateOne({ _id: id }, { $set: parts })
        if (update.modifiedCount == 1) {
            return res.status(200).json({
                Success: true,
                Error: false,
                Message: 'Parts updated',
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Error while updating parts',
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

mechanicRouter.get('/delete-parts/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const deleteData = await partsData.deleteOne({ _id: id });
        if (deleteData.deletedCount == 1) {
            return res.status(200).json({
                Success: true,
                Error: false,
                Message: 'Bike parts deleted',
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

mechanicRouter.get('/view-orders/:id', async (req, res) => {
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
                    'status': 'placed'
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
                    'workshop_login_id': { '$first': '$workshop.login_id' },
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
            const id = req.params.id
            const filter = order.filter((item) => {
                return item.workshop_login_id == id
            })
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

mechanicRouter.get('/accept-order/:id', async (req, res) => {
    try {
        const id = req.params.id
        const update = await partsOrderData.updateOne({ _id: id }, { $set: { 'status': 'completed' } })
        if (update.modifiedCount == 1) {
            return res.status(200).json({
                Success: true,
                Error: false,
                Message: 'Order status updated',
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Error while updating status',
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

mechanicRouter.get('/reject-order/:id', async (req, res) => {
    try {
        const id = req.params.id
        const update = await partsOrderData.updateOne({ _id: id }, { $set: { 'status': 'rejected' } })
        if (update.modifiedCount == 1) {
            return res.status(200).json({
                Success: true,
                Error: false,
                Message: 'Order status updated',
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'Error while updating status',
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



module.exports = mechanicRouter