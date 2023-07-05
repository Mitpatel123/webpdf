const validationToken = require('../validation/validationToken');
const usercontrollers = require('../controllers/usercontrollers');
const helpers = require('../helpers/sendMailHelper');
const userValidation = require ('../validation/user')



function alluserrouting(app) {
  app.post('/signup', userValidation.addUser, usercontrollers.addUser);
  app.post('/login',userValidation.login, usercontrollers.loginuser);
  app.post('/forgotPassword',userValidation.forgotPassword,usercontrollers.forgotPassword)
  app.post('/changePassword',userValidation.changePassword,usercontrollers.changePassword)
 

  app.get('/sendOtp',userValidation.sendOtp,usercontrollers.sendOtp)
  app.get('/verificationOtp',userValidation.verificationOtp,usercontrollers.verificationOtp)





  

//   app.get('/sendmail', helpers.sendmail);

}
module.exports = alluserrouting;