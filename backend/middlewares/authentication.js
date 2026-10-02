const User = require("../models/User");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { createError } = require("./errors.js");

const verifyToken = (req, res, next) => {
  const bearerToken =  req.headers.authorization?.split(' ')[1];
  const token = bearerToken || req.cookies.token; 

  if (!token) {
    return next(createError(401, "You are not authenticated!"));
  }

  jwt.verify(token, process.env.TOKEN_KEY, (err, decodedToken) => {
    if (err) return next(createError(403, "Token is not valid!"));
    req.user = decodedToken;
    next();
  });
};

const verifyLogin = (req, res, next) => {
  const bearerToken =  req.headers.authorization?.split(' ')[1];
  const token = bearerToken || req.cookies?.token;

  // #region agent log
  fetch('http://127.0.0.1:7618/ingest/57d90a2e-7703-4985-a0ce-0917a8f0cfd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a4cb0d'},body:JSON.stringify({sessionId:'a4cb0d',location:'authentication.js:verifyLogin',message:'token presence check',data:{hasBearer:!!bearerToken,hasCookie:!!req.cookies?.token,path:req.path},timestamp:Date.now(),hypothesisId:'D',runId:'post-fix'})}).catch(()=>{});
  // #endregion

  if (token) {
    jwt.verify(token, process.env.TOKEN_KEY, (err, decodedToken) => {
      if (err) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      req.user = decodedToken;
      next();
    });
  } else {
    res.status(403).json({ message: "You're not logged in" });
  }
};

const verifyUser = (req, res, next) => {
  if (!req.user) {
    return next(createError(401, "You are not authenticated!"));
  }

  // #region agent log
  fetch('http://127.0.0.1:7618/ingest/57d90a2e-7703-4985-a0ce-0917a8f0cfd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a4cb0d'},body:JSON.stringify({sessionId:'a4cb0d',location:'authentication.js:verifyUser',message:'auth user id check',data:{tokenUserId:String(req.user.id),paramUserId:String(req.params.userId),match:String(req.user.id)===String(req.params.userId)},timestamp:Date.now(),hypothesisId:'C',runId:'post-fix'})}).catch(()=>{});
  // #endregion

  if (String(req.user.id) === String(req.params.userId)) {
    next();
  } else {
    return next(createError(403, "You are not authorized! User"));
  }
};

module.exports = {
  verifyToken,
  verifyLogin,
  verifyUser
}