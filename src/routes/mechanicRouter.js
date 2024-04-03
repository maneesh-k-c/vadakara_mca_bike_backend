const express = require('express');
const mechanicData = require('../models/mechanicSchema');
const loginData = require('../models/loginSchema');
const partsData = require('../models/partsSchema');
const mechanicRouter = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
});
const storageImage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'turf',
    },
});
const uploadImage = multer({ storage: storageImage });

mechanicRouter.get('/update-mechanic-profile/:id', async (req, res) => {
    try {
        const id = req.params.id
        const oldData = await mechanicData.findOne({ login_id: id });
        let reg = {
            name: req.query.name ? req.query.name : oldData.name,
            mobile: req.query.mobile ? req.query.mobile : oldData.mobile,
            address: req.query.address ? req.query.address : oldData.address,
            qualification: req.query.qualification ? req.query.qualification : oldData.qualification
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

mechanicRouter.post('/add-parts', async (req, res, next) => {
    try {
  
  
      let details = {
        login_id: req.body.login_id,
        workshop_id: req.body.workshop_id,
        part_name: req.body.part_name,
        rate: req.body.rate,
        quantity: req.body.quantity,
        description: req.body.description,
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

mechanicRouter.get('/view-all-parts', async (req, res) => {
    try {
        const parts = await partsData.find()
        if (parts[0]) {
            return res.status(200).json({
                Success: true,
                Error: false,
                data: parts
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



module.exports = mechanicRouter