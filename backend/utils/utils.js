const validator = require('validator');

const getVerifyCodeExpireTimeout = () => {
  const timeout = parseInt(process.env.VERIFY_CODE_EXPIRE_TIMEOUT, 10);
  return isNaN(timeout) ? 120000 : timeout;
};

const getRandomVerifyCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const isValidPassword = (trimmedPassword) => {
  return validator.isStrongPassword(trimmedPassword, {
    minSymbols: 0,
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
  })
};

module.exports = { getVerifyCodeExpireTimeout, getRandomVerifyCode, isValidPassword };
