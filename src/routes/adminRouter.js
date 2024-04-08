const express = require('express');
const adminRouter = express.Router();
adminRouter.use(express.static('./public'))
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcryptjs');
const loginData = require('../models/loginSchema');
const userData = require('../models/userSchema');
const mechanicData = require('../models/mechanicSchema');
const workshopData = require('../models/workshopSchema');
const reviewData = require('../models/reviewSchema');


adminRouter.post('/login', async (req, res, next) => {
    try {
        console.log(req.body.password,req.body.email);
        if (req.body.email && req.body.password) {
            const oldUser = await loginData.findOne({
                email: req.body.email,
            });

            if (!oldUser) {
                return res.render('login.ejs',{Message:'Email Incorrect'});
            }   
            const isPasswordCorrect = await bcrypt.compare(
                req.body.password,
                oldUser.password
                );
                console.log(isPasswordCorrect);
            if (!isPasswordCorrect) {
                return res.render('login.ejs',{Message:'Password Incorrect'});
            }
            return res.redirect('/admin/dashboard')
        } else {
            return res.render('login.ejs',{Message:'All field are required'});           
        }
    } catch (error) {
        return res.render('login.ejs',{Message:'Something went wrong'});
      
    }
});
adminRouter.get('/dashboard', async (req, res) => {
    res.render('dashboard')
})
adminRouter.get('/view-users', async (req, res) => {
    try {
        const users = await userData.aggregate([
            {
              '$lookup': {
                'from': 'login_tbs', 
                'localField': 'login_id', 
                'foreignField': '_id', 
                'as': 'login'
              }
            },
            {
                '$unwind': {
                    'path': '$login'
                }
            },
            {
                '$group': {
                    '_id': '$_id', 
                    'name': {
                        '$first': '$name'
                    }, 
                    'mobile': {
                        '$first': '$mobile'
                    }, 
                    'address': {
                        '$first': '$address'
                    }, 
                    'status': {
                        '$first': '$login.status'
                    }, 
                    'login_id': {
                        '$first': '$login._id'
                    },
                    'email': {
                        '$first': '$login.email'
                    }
                }
            }
          ])
          console.log(users);
          if(users[0]){
            const data = {}
            res.render('all-users',{data,users})
          }else{
            const data = {
                Message: 'No data found',
            }
            const users = []
            return res.render('view-turf', { users, data })
          }
          
    } catch (error) {
        
    }
    
})
adminRouter.get('/update-users/:login_id', async (req, res) => {
    try {
        const id = req.params.login_id
        const update = await loginData.updateOne({ _id: id }, { $set: { status: 1 } })
        if (update.modifiedCount == 1) {
            return res.redirect('/admin/view-users')
        } else {
            return res.redirect('/admin/view-users')
        }
    } catch (error) {
        return res.redirect('/admin/view-users')
    }
})
adminRouter.get('/reject-users/:login_id', async (req, res) => {
    try {
        const id = req.params.login_id
        const deletedata = await userData.deleteOne({ login_id: id })
        if (deletedata.deletedCount == 1) {
            const deletedata = await loginData.deleteOne({_id: id })
            return res.redirect('/admin/view-users')
        } else {
            return res.redirect('/admin/view-users')
        }
    } catch (error) {
        return res.redirect('/admin/view-users')
    }
})
adminRouter.get('/view-staffs', async (req, res) => {
    try {
        const mechanic = await mechanicData.aggregate([
            {
              '$lookup': {
                'from': 'login_tbs', 
                'localField': 'login_id', 
                'foreignField': '_id', 
                'as': 'login'
              }
            },
            {
                '$unwind': {
                    'path': '$login'
                }
            },
            {
                '$group': {
                    '_id': '$_id', 
                    'name': {
                        '$first': '$name'
                    }, 
                    'mobile': {
                        '$first': '$mobile'
                    }, 
                    'address': {
                        '$first': '$address'
                    }, 
                    'status': {
                        '$first': '$login.status'
                    }, 
                    'login_id': {
                        '$first': '$login._id'
                    },
                    'email': {
                        '$first': '$login.email'
                    }
                }
            }
          ])
          console.log(mechanic);
          if(mechanic[0]){
            const data = {}
            res.render('all-staffs',{data,mechanic})
          }else{
            const data = {
                Message: 'No data found',
            }
            const mechanic = []
            return res.render('all-staffs', { mechanic, data })
          }
          
    } catch (error) {
        
    }
    
})
adminRouter.get('/update-mechanic/:login_id', async (req, res) => {
    try {
        const id = req.params.login_id
        const update = await loginData.updateOne({ _id: id }, { $set: { status: 1 } })
        if (update.modifiedCount == 1) {
            return res.redirect('/admin/view-staffs')
        } else {
            return res.redirect('/admin/view-staffs')
        }
    } catch (error) {
        return res.redirect('/admin/view-staffs')
    }
})
adminRouter.get('/reject-mechanic/:login_id', async (req, res) => {
    try {
        const id = req.params.login_id
        const deletedata = await mechanicData.deleteOne({ login_id: id })
        if (deletedata.deletedCount == 1) {
            const deletedata = await loginData.deleteOne({_id: id })
            return res.redirect('/admin/view-staffs')
        } else {
            return res.redirect('/admin/view-staffs')
        }
    } catch (error) {
        return res.redirect('/admin/view-staffs')
    }
})
adminRouter.get('/view-workshops', async (req, res) => {
    try {
        const workshop = await workshopData.aggregate([
            {
              '$lookup': {
                'from': 'login_tbs', 
                'localField': 'login_id', 
                'foreignField': '_id', 
                'as': 'login'
              }
            },
            {
                '$unwind': {
                    'path': '$login'
                }
            },
            {
                '$group': {
                    '_id': '$_id', 
                    'name': {
                        '$first': '$workshop_name'
                    }, 
                    'mobile': {
                        '$first': '$mobile'
                    }, 
                    'address': {
                        '$first': '$address'
                    }, 
                    'status': {
                        '$first': '$login.status'
                    }, 
                    'login_id': {
                        '$first': '$login._id'
                    },
                    'email': {
                        '$first': '$login.email'
                    },
                    'images': {
                        '$first': '$images'
                    }
                }
            }
          ])
          console.log(workshop);
          if(workshop[0]){
            const data = {}
            res.render('all-workshops',{data,workshop})
          }else{
            const data = {
                Message: 'No data found',
            }
            const workshop = []
            return res.render('all-workshops', { workshop, data })
          }
          
    } catch (error) {
        
    }
    
})
adminRouter.get('/update-workshop/:login_id', async (req, res) => {
    try {
        const id = req.params.login_id
        const update = await loginData.updateOne({ _id: id }, { $set: { status: 1 } })
        if (update.modifiedCount == 1) {
            return res.redirect('/admin/view-workshops')
        } else {
            return res.redirect('/admin/view-workshops')
        }
    } catch (error) {
        return res.redirect('/admin/view-workshops')
    }
})
adminRouter.get('/reject-workshop/:login_id', async (req, res) => {
    try {
        const id = req.params.login_id
        const deletedata = await workshopData.deleteOne({ login_id: id })
        if (deletedata.deletedCount == 1) {
            const deletedata = await loginData.deleteOne({_id: id })
            return res.redirect('/admin/view-workshops')
        } else {
            return res.redirect('/admin/view-workshops')
        }
    } catch (error) {
        return res.redirect('/admin/view-workshops')
    }
})
adminRouter.get('/view-reviews', async (req, res) => {
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
                '$unwind': {
                    'path': '$user'
                }
            },
            {
                '$unwind': {
                    'path': '$workshop'
                }
            },
            {
                '$group': {
                    '_id': '$_id', 
                    'user_name': {
                        '$first': '$user.name'
                    }, 
                    'mobile': {
                        '$first': '$user.mobile'
                    }, 
                    'workshop_name': {
                        '$first': '$workshop.workshop_name'
                    }, 
                    'workshop_mobile': {
                        '$first': '$workshop.mobile'
                    }, 
                    'review': {
                        '$first': '$review'
                    }, 
                    
                }
            }
          ])
          console.log(review);
          if(review[0]){
            const data = {}
            res.render('view-reviews',{data,review})
          }else{
            const data = {
                Message: 'No data found',
            }
            const review = []
            return res.render('view-reviews', { review, data })
          }
          
    } catch (error) {
        
    }
    
})

adminRouter.get('/logout', async (req, res) => {
    res.redirect('/')
})







module.exports = adminRouter 