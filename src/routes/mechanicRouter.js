const express = require('express');
const mechanicData = require('../models/mechanicSchema');
const mechanicRouter = express.Router();

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




module.exports = mechanicRouter