
const crypto = require('crypto');

let Crypto = require('crypto'); // add / import crypto mdule
let secret_key = 'fd85b494-aaaa'; // define secret key
let secret_iv = 'smslt'; // define secret IV
let encryptionMethod = 'AES-256-CBC'; // this is our encryption method
let key = Crypto.createHash('sha512').update(secret_key, 'utf-8').digest('hex').substr(0, 32); // create key
let iv = Crypto.createHash('sha512').update(secret_iv, 'utf-8').digest('hex').substr(0, 16); // same create iv


const encryptData = (otp) => {
    const message = otp.toString();
    const cipher = crypto.createCipheriv(encryptionMethod, key, iv);
    let encryptedData = cipher.update(message, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    
    return encryptedData
}

 const decryptData = (encryptedData) => {
    const decipher = crypto.createDecipheriv(encryptionMethod, key, iv);
    let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
    decryptedData += decipher.final("utf8");

    return decryptedData
}

module.exports = {encryptData,decryptData}