const express = require('express');
const registerRouter = express.Router();
const bcrypt = require('bcryptjs');
const workshopData = require('../models/workshopSchema');
const loginData = require('../models/loginSchema');



// =====================workshop registration==================================
registerRouter.post('/workshop', async (req, res, next) => {
  try {
    
    const oldEmail = await loginData.findOne({ email: req.body.email });
    if (oldEmail) {
      return res.status(400).json({
        Success: false,
        Error: true,
        Message: 'Email already exist, Please Log In',
      });
    }
    const oldPhone = await workshopData.findOne({ mobile: req.body.mobile });
    if (oldPhone) {
      return res.status(400).json({
        Success: false,
        Error: true,
        Message: 'Mobile number already exist',
      });
    }
    const oldName = await workshopData.findOne({ mobile: req.body.mobile });
    if (oldPhone) {
      return res.status(400).json({
        Success: false,
        Error: true,
        Message: 'Mobile number already exist',
      });
    }
    
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    let log = {
      email: req.body.email,
      password: hashedPassword,
      role: 1,
      status:0
    };
    const result = await loginData(log).save();
    console.log(result);
    let reg = {
      login_id: result._id,
      workshop_name: req.body.workshop_name,
      mobile: req.body.mobile,
      address: req.body.address,
    };
    const result2 = await workshopData(reg).save();

    if (result2) {
      return res.json({
        Success: true,
        Error: false,
        data: result2,
        Message: 'Registration Successful',
      });
    } else {
      return res.json({
        Success: false,
        Error: true,
        Message: 'Registration Failed',
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

// =====================user registration==================================
// registerRouter.post('/user', async (req, res, next) => {
//   try {
//     const oldEmail = await loginData.findOne({ email: req.body.email });
//     if (oldEmail) {
//       return res.status(400).json({
//         Success: false,
//         Error: true,
//         Message: 'Email already exist, Please Log In',
//       });
//     }
//     const oldPhone = await userData.findOne({ mobile: req.body.mobile });
//     if (oldPhone) {
//       return res.status(400).json({
//         Success: false,
//         Error: true,
//         Message: 'Mobile number already exist',
//       });
//     }
    
//     const hashedPassword = await bcrypt.hash(req.body.password, 12);
//     let log = {
//       email: req.body.email,
//       password: hashedPassword,
//       role: 2,
//       status:0
//     };
//     const result = await loginData(log).save();
//     console.log(result);
//     let reg = {
//       login_id: result._id,
//       name: req.body.name,
//       mobile: req.body.mobile,
//       age: req.body.age
//     };
//     const result2 = await userData(reg).save();

//     if (result2) {
//       return res.json({
//         Success: true,
//         Error: false,
//         data: result2,
//         Message: 'Registration Successful',
//       });
//     } else {
//       return res.json({
//         Success: false,
//         Error: true,
//         Message: 'Registration Failed',
//       });
//     }
//   } catch (error) {
//     return res.json({
//         Success: false,
//         Error: true,
//         Message: 'Something went wrong',
//       });
//   }
// });


// =====================user registration==================================
// registerRouter.post('/player', async (req, res, next) => {
//   try {
//     const oldEmail = await loginData.findOne({ email: req.body.email });
//     if (oldEmail) {
//       return res.status(400).json({
//         Success: false,
//         Error: true,
//         Message: 'Email already exist, Please Log In',
//       });
//     }
//     const oldPhone = await playerData.findOne({ mobile: req.body.mobile });
//     if (oldPhone) {
//       return res.status(400).json({
//         Success: false,
//         Error: true,
//         Message: 'Mobile number already exist',
//       });
//     }
    
//     const hashedPassword = await bcrypt.hash(req.body.password, 12);
//     let log = {
//       email: req.body.email,
//       password: hashedPassword,
//       role: 3,
//       status:0
//     };
//     const result = await loginData(log).save();
//     console.log(result);
//     let reg = {
//       login_id: result._id,
//       name: req.body.name,
//       mobile: req.body.mobile,
//       age: req.body.age,
//       position: req.body.position
//     };
//     const result2 = await playerData(reg).save();

//     if (result2) {
//       return res.json({
//         Success: true,
//         Error: false,
//         data: result2,
//         Message: 'Registration Successful',
//       });
//     } else {
//       return res.json({
//         Success: false,
//         Error: true,
//         Message: 'Registration Failed',
//       });
//     }
//   } catch (error) {
//     return res.json({
//         Success: false,
//         Error: true,
//         Message: 'Something went wrong',
//       });
//   }
// });



module.exports = registerRouter


