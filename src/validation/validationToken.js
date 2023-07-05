const config = require('config');

const jwt_token_secret = config.get('jwt_token_secret')
const jwt = require('jsonwebtoken');



function verifyToken(req, resp, next) {
  let token = req.headers['authorization'];
  const Host = req.headers['host']
// console.log('req.headers', req.headers)
  if (token) {
    token = token.split(' ');
    // console.log('token[1]', token[1])
    jwt.verify(token[1], jwt_token_secret, (err, valid) => {
    
        // console.log('valid', valid)
      if (err) {
        resp.status(401).send({ result: "please provide a valid token" });
      } else {
    
        next();
        // return valid;
      }
    });
  } else {
    resp.status(403).send({ result: "please add a token with the header" });
  }
} 

module.exports = verifyToken;
  