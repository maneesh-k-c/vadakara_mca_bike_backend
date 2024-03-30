const express = require('express');
const registerRouter = express.Router();
const bcrypt = require('bcryptjs');
const workshopData = require('../models/workshopSchema');
const loginData = require('../models/loginSchema');
const mechanicData = require('../models/mechanicSchema');



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

registerRouter.get('/view-all-workshops', async (req, res) => {
  try {
      const workshop = await workshopData.find()
      if (workshop[0]) {
          return res.status(200).json({
              Success: true,
              Error: false,
              data: workshop
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

registerRouter.get('/view-single-workshop/:id', async (req, res) => {
  try {
      const workshop = await workshopData.findOne({login_id:req.params.id})
      if (workshop) {
          return res.status(200).json({
              Success: true,
              Error: false,
              data: workshop
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

// =====================mechanic registration==================================
registerRouter.post('/mechanic', async (req, res, next) => {
  try {
    const oldEmail = await loginData.findOne({ email: req.body.email });
    if (oldEmail) {
      return res.status(400).json({
        Success: false,
        Error: true,
        Message: 'Email already exist, Please Log In',
      });
    }
    const oldPhone = await mechanicData.findOne({ mobile: req.body.mobile });
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
      role: 2,
      status:0
    };
    const result = await loginData(log).save();

    let reg = {
      login_id: result._id,
      workshop_id: req.body.workshop_id,
      name: req.body.name,
      mobile: req.body.mobile,
      address: req.body.address,
      qualification: req.body.qualification
    };

    const result2 = await mechanicData(reg).save();

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

registerRouter.get('/workshop-view-all-registered-mechanics/:id', async (req, res) => {
  try {
      const mechanic = await mechanicData.find({workshop_id:req.params.id})
      if (mechanic[0]) {
          return res.status(200).json({
              Success: true,
              Error: false,
              data: mechanic
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

registerRouter.get('/view-single-mechanic/:id', async (req, res) => {
  try {
      const mechanic = await mechanicData.findOne({login_id:req.params.id})
      if (mechanic) {
          return res.status(200).json({
              Success: true,
              Error: false,
              data: mechanic
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

registerRouter.get('/approve-mechanic/:_id', async (req, res) => {
  try {
      const id = req.params._id
      const update = await loginData.updateOne({ _id: id }, { $set: { status: 1 } })
      if (update.modifiedCount == 1) {
        return res.status(200).json({
          Success: true,
          Error: false,
          Message: 'Status updated',
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

registerRouter.get('/reject-mechanic/:_id', async (req, res) => {
  try {
      const id = req.params._id
      const update = await loginData.updateOne({ _id: id }, { $set: { status: 2 } })
      if (update.modifiedCount == 1) {
        return res.status(200).json({
          Success: true,
          Error: false,
          Message: 'Status updated',
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






module.exports = registerRouter


