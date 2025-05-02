// Import the function to be tested
const { getVerifyCodeExpireTimeout } = require("../utils");
const { getRandomVerifyCode } = require("../utils");

describe("getVerifyCodeExpireTimeout", () => {
  it("should return the default timeout value when VERIFY_CODE_EXPIRE_TIMEOUT is not set", () => {
    delete process.env.VERIFY_CODE_EXPIRE_TIMEOUT;
    const result = getVerifyCodeExpireTimeout();
    expect(result).toBe(120000);
  });

  it("should return the timeout value from VERIFY_CODE_EXPIRE_TIMEOUT when it is set", () => {
    process.env.VERIFY_CODE_EXPIRE_TIMEOUT = "300000";
    const result = getVerifyCodeExpireTimeout();
    expect(result).toBe(300000);
  });

  it("should parse VERIFY_CODE_EXPIRE_TIMEOUT as an integer", () => {
    process.env.VERIFY_CODE_EXPIRE_TIMEOUT = "150000";
    const result = getVerifyCodeExpireTimeout();
    expect(result).toBe(150000);
  });

  it("should handle invalid VERIFY_CODE_EXPIRE_TIMEOUT values gracefully", () => {
    process.env.VERIFY_CODE_EXPIRE_TIMEOUT = "invalid";
    const result = getVerifyCodeExpireTimeout();
    expect(result).toBe(120000);
  });
});
describe("getRandomVerifyCode", () => {
  it("should return a string", () => {
    const result = getRandomVerifyCode();
    expect(typeof result).toBe("string");
  });

  it("should return a 6-digit number as a string", () => {
    const result = getRandomVerifyCode();
    expect(result).toMatch(/^\d{6}$/);
  });

  it("should return a number within the range 100000 to 999999", () => {
    const result = parseInt(getRandomVerifyCode(), 10);
    expect(result).toBeGreaterThanOrEqual(100000);
    expect(result).toBeLessThanOrEqual(999999);
  });

  it("should generate different codes on multiple calls", () => {
    const result1 = getRandomVerifyCode();
    const result2 = getRandomVerifyCode();
    expect(result1).not.toBe(result2);
  });
});
