const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  const verifyOpts = {
    expiresIn: "5h",
    issuer: "Jagongan",
  };
  const token = jwt.sign(payload, process.env.SECRETE_KEY_JWT, verifyOpts);
  return token;
};

const generateRefreshToken = (payload) => {
  const verifyOpts = {
    expiresIn: "1h",
  };
  const token = jwt.sign(payload, process.env.SECRETE_KEY_JWT, verifyOpts);
  return token;
};

module.exports = {
  generateToken,
  generateRefreshToken,
};
