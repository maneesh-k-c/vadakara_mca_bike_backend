const express = require('express');
const adminRouter = express.Router();
adminRouter.use(express.static('./public'))
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcryptjs');


adminRouter.post('/login', async (req, res, next) => {
    try {
console.log(req.body.email, req.body.password);
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
            return res.redirect('/admin/')
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






module.exports = adminRouter 