const express = require('express');
const app = express();
const mongoose = require('mongoose');
const registerRouter = require('./src/routes/registerRouter');
const mechanicRouter = require('./src/routes/mechanicRouter');
const LoginRouter = require('./src/routes/loginRouter');
const userRouter = require('./src/routes/userRouter');
const adminRouter = require('./src/routes/adminRouter');
app.use(express.static('./public'))
require('dotenv').config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Database Connected Successfully');
  })
  .catch((error) => {
    console.log('Database Error:', error);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine','ejs')
app.set('views','./src/views')

app.use('/api/register',registerRouter)
app.use('/api/mechanic',mechanicRouter)
app.use('/api/login',LoginRouter)
app.use('/api/user',userRouter)
app.use('/admin',adminRouter)


app.get('/', (req, res) => {
  res.render('login.ejs',{Message: ''})
});






app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});
