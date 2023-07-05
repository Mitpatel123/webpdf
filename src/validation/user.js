const joi = require('joi');
const apiResponse = require ('../common/index')
const usercontrollers = require('../controllers/usercontrollers');



const addUser = async (req, res ,next) => {
    const schema = joi.object({
        name: joi.string().required().error(new Error('name is required!')),
        email: joi.string().required().error(new Error('email is required!')),
        password: joi.string().required().error(new Error('password is required!')),
        phoneNumber: joi.number().required().messages({ 'any.required': 'phoneNumber is required', 'number.base': 'phoneNumber must be a number' }),
       userType: joi.string().required().messages({ 'any.required': 'userType is required' }),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}  

const login = async (req ,res, next) => {
    const schema = joi.object({
        email: joi.string().required().error(new Error('email is required!')),
        password: joi.string().required().error(new Error('passwoasdegsdfgrd is required!')),
        userType: joi.string().required().messages({ 'any.required': 'userType is required', 'number.base': 'userType must be a number' }),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}

const forgotPassword = async (req, res, next) => {  
    const schema = joi.object({
        email: joi.string().required().error(new Error('email is required!')),
    })
    schema.validateAsync(req.body).then(result => {  
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}

const changePassword = async (req ,res, next) => {
    const schema = joi.object({
        otp: joi.number().required().messages({ 'any.required': 'otp is required', 'number.base': 'otp must be a number' }),
        password: joi.string().required().error(new Error('password is required!')),
        email: joi.string().required().error(new Error('email is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}


const sendOtp = async (req, res, next) => {
    console.log("res",res)
    const schema = joi.object({
        phoneNumber: joi.string().required().messages({ 'any.required': 'phoneNumber is required', 'number.base': 'phoneNumber must be a number' }),
        otp: joi.number().required().messages({ 'any.required': 'otp is required', 'number.base': 'otp must be a number' })
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}   


const verificationOtp = async (req, res, next) => {
    const schema = joi.object({
        otp: joi.number().required().messages({ 'any.required': 'Otp is required', 'number.base': 'Otp must be a number' }),
        phoneNumber: joi.number().required().messages({ 'any.required': 'phoneNumber is required', 'number.base': 'phoneNumber must be a number' }),
        userType: joi.string().required().messages({ 'any.required': 'userType is required', 'number.base': 'userType must be a number' }),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}


module.exports  = 
 {addUser,login,forgotPassword,changePassword,sendOtp,verificationOtp};
