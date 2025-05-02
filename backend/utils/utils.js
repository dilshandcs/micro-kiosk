const getVerifyCodeExpireTimeout = () => {
  const timeout = parseInt(process.env.VERIFY_CODE_EXPIRE_TIMEOUT, 10);
  return isNaN(timeout) ? 120000 : timeout;
};

const getRandomVerifyCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

module.exports = { getVerifyCodeExpireTimeout, getRandomVerifyCode };
