
// const ApiResponse = require("./commonError");    
const User = require("../schema/userSchema");
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer")
const jwtkey = 'e-comm';
// const Product = require("./DB/Products");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const { sendmail } = require('../helpers/sendMailHelper')
const { decryptData, encryptData } = require('../common/encryptDecrypt')
const { responseMessage } = require('../helpers/response')
const bcrypt = require("bcryptjs")
const userModel = require('../model/user')
const userType = require('../common/enum')
const apiResponse = require('../common/index')
const config = require('config');
// const { componentsToColor } = require("pdf-lib");
const pdfmerge = require('easy-pdf-merge');
const { func } = require("joi");
const multer = require('multer');
const path = require('path');
const { mergePdfs } = require('../../pdfmerge/merge');
// const { mergePdfs } = require('../helpers/merger');

const jwt_token_secret = config.get('jwt_token_secret')


const addUser = async (req, res) => {
    try {
        const body = req.body 
        const bcryptdPassword = await bcrypt.hash(body.password, 10)
        let bodyData = { 
            ...body, 
            password: bcryptdPassword
        }
        console.log('singup bodyData.......................................................', bodyData)
        let isAlready = await userModel.findOne({ email: body.email, isActive: true, isDelete: false })
        let existPhone = (isAlready && isAlready.phoneNumber === body.phoneNumber)
        console.log("isAlready ........", isAlready)
        if (!isAlready && !existPhone) {
            await new userModel(bodyData).save().then(async data => {
                return res.status(200).json(new apiResponse(200, responseMessage.signupSuccess, {}, {}))
            })
        } else if (existPhone) {
            return res.status(409).json(new apiResponse(409, responseMessage.alreadyphone, {}, {}))
        } else {
            return res.status(409).json(new apiResponse(409, responseMessage.alreadyEmail, {}, {}))
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error))
    }
}
 


// const addUser = async (req, res) => {
//     try {
//         console.log('req===========', req.body);

//         let user = new User(req.body);

//         let result = await user.save();
//         result = result.toObject();
//         delete result.password;
//         jwt.sign({ result }, jwtkey, { expiresIn: "6hr" }, (err, token) => {
//             if (err) {
//                 res.send({ result: "something went wrong please try after sometime" });
//             }
//             res.send({ result, auth: token });
//             res.send(jwt);
//         });
//     } catch (error) {
//         console.log('error========================', error);
//     }
// }




const loginuser = async (req, res) => {
    let body = req.body;
    console.log('login   .... .  body', body)
    try {
        let response = await userModel.findOne({ email: body.email, isActive: true, isDelete: false }).select("_id userType name email password isActive isVerified");
        console.log('login   .... .   response', response)
        if (!response) {
            return res.status(404).json(new apiResponse(404, responseMessage.invalidCraditional, null, {}));
        } else {
            if (response.userType === "user" && body.userType === "user") {
                const matchPassword = await bcrypt.compare(body.password, response.password)
                if (matchPassword) {
                    const payLoad = {
                        _id: response._id,
                        type: response.userType,
                        status: "Login",
                        generatedOn: new Date().getTime()
                    }
                    const token = jwt.sign(payLoad, jwt_token_secret)

                    const refresh_token = jwt.sign({
                        _id: response._id,
                        generatedOn: (new Date().getTime())
                    }, jwt_token_secret)

                    const data = { userDetail: response, token, refresh_token };
                   console.log('jwt token', token)
                    
                    return res.status(200).json(new apiResponse(200, responseMessage.loginSuccess, data, {}));
                } else {
                    return res.status(404).json(new apiResponse(404, responseMessage.invalidCraditional, null, {}));
                }
            } else {
                return res.status(404).json(new apiResponse(404, responseMessage.unauthorizedUser, null, {}));
            }
        }
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, null, {}));
    }
}




// const loginuser =  async (req, res) => {
//     if (req.body.password && req.body.email) {
//         let user = await User.findOne(req.body).select("-password");
//         if (user) {
//             jwt.sign({ user }, jwtkey, { expiresIn: "6hr" }, (err, token) => {
//                 if (err) {
//                     res.send({ result: "something went wrong please try after sometime" });
//                 }
//                 res.send({ user, auth: token });
//             });
//         } else {
//             res.send({ result: 'user data not found' });
//         }
//     } else {
//         res.send({ result: 'user data not found' });
//     }
// }


const forgotPassword = async (req, res) => {
    try {
        let body = req.body
        console.log('body.email', body)
        const exist = await User.findOne({ email: body.email })
        console.log('exist', exist)
        if (exist) {
            let OTPCode = Math.floor(100000 + Math.random() * 900000); console.log("otp...........", OTPCode)
            sendmail(body.email, OTPCode, "Forgot password")

            const encryptedCode = await encryptData(OTPCode)
            console.log('encryptedCode', encryptedCode)
            await userModel.findOneAndUpdate({ _id: exist._id }, { forgotOtpCode: encryptedCode })
        }
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error))
    }
}

const changePassword = async (req, res) => {
    try {
        const body = req.body
        const exist = await userModel.findOne({ email: body.email, isActive: true, isDelete: false })
        if (exist) {
            const encryptedData = exist.forgotOtpCode
            const verificationCode = decryptData(encryptedData)
            console.log("verificationCode......", verificationCode)
            if (+verificationCode === body.otp) {
                const bcryptdPassword = await bcrypt.hash(body.password, 10)
                await userModel.findOneAndUpdate({ _id: exist.id }, { password: bcryptdPassword })
                return res.status(200).json(new apiResponse(200, responseMessage.passwordChangeSuccess, {}, {}))
            } else {
                return res.status(409).json(new apiResponse(409, responseMessage.invalidOTP, {}, {}))
            }
        } else {
            return res.status(409).json(new apiResponse(409, responseMessage.alreadyEmail, {}, {}))
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error))
    }
}



const sendOtp = async (req, res) => {
    try {
        let body = req.body
        const otpCode = body.otp

        return res.status(200).json(new apiResponse(200, 'otp sent sucessfully', otpCode, {}))

    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error))
    }
}


const verificationOtp = async (req, res) => {
    let body = req.body
    console.log('body', body)
    try {
        let response = await userModel.findOne({ phoneNumber: body.phoneNumber, isActive: true, isDelete: false }).select("_id userType name phoneNumber isActive isVerified");
        console.log('response.................', response)
        if (!response) {
            const isExist = await userModel.findOne({ phoneNumber: body.phoneNumber, isActive: true, isDelete: false })
            if (!isExist) {
                await new userModel(body).save().select("_id userType name phoneNumber isActive isVerified")
                    .then(async data => {
                        const payLoad = {
                            _id: data._id,
                            type: data.userType,
                            status: "Login",
                            generatedOn: new Date().getTime()
                        }
                        const token = jwt.sign(payLoad, jwt_token_secret)
                        const refresh_token = jwt.sign({ _id: data._id, generatedOn: (new Date().getTime()) }, jwt_token_secret)

                        const userDetial = { data, token, refresh_token };

                        return res.status(200).json(new apiResponse(200, responseMessage.signupSuccess, userDetial, {}))
                    })
            } else {
                return res.status(401).json(new apiResponse(401, "unauthorized user", {}, {}))
            }
        } else {
            const payLoad = {
                _id: response._id,
                type: response.userType,
                status: "Login",
                generatedOn: new Date().getTime()
            }
            const token = jwt.sign(payLoad, jwt_token_secret)

            const refresh_token = jwt.sign({ _id: response._id, generatedOn: (new Date().getTime()) }, jwt_token_secret)

            const userDetail = { response, token, refresh_token };

            return res.status(200).json(new apiResponse(200, responseMessage.loginSuccess, userDetail, {}));
        }

    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error))
    }
}


// const PDFMerge = async (req, res, next) => {
//     try {
//         // console.log("req",req.files)
//         const mergedPdfPath = await mergePdfs(
//             path.join( req.files[0].path),
//             path.join( req.files[1].path) 
//         );
//         res.sendFile(path.join( mergedPdfPath));
         
 
//     } catch (error) { 
//         res.status(500).send({ error: 'An error occurred while merging PDFs.' });
//     }
// };


// const pdfDownload = async (req, res) => {
//     const { filename } = req.params;
//     const filePath = `../../src/controllers/public/${filename}.pdf`;
  
//     res.download(filePath, (err) => {
//       if (err) {
//         console.error('Error while downloading PDF:', err);
//         res.status(500).json({ error: 'Failed to download PDF.' });
//       }
//     });
//   }

module.exports =
{
    addUser, loginuser, forgotPassword,
    changePassword, sendOtp, verificationOtp,

};
