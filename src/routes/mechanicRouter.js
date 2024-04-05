const express = require('express');
const mechanicData = require('../models/mechanicSchema');
const loginData = require('../models/loginSchema');
const partsData = require('../models/partsSchema');
const mechanicRouter = express.Router();
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

mechanicRouter.post('/add-parts',uploadImage.array('image', 1), async (req, res, next) => {
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
    const parts = await partsData.find({workshop_id:req.params.id})
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

mechanicRouter.post('/update-parts/:id',uploadImage.array('image', 1), async (req, res) => {
    try {
        const id = req.params.id
        const oldData = await partsData.findOne({ _id: id });
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
    const id= req.params.id
    const deleteData = await partsData.deleteOne({ _id: id });
    if (deleteData.deletedCount==1) {
    return res.status(200).json({
        Success: true,
        Error: false,
        Message: 'Bike parts deleted',
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



module.exports = mechanicRouter