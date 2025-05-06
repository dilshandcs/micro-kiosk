const request = require("supertest");
const { app } = require("../../app");
const { cleanDB, insertRow, verifyTokenValidity } = require("./setupTestDB");
const jwt = require("jsonwebtoken");
require("./setupTestDB");
const { getRandomVerifyCode } = require("../../utils/utils"); // Adjust the path as necessary

jest.mock("../../utils/utils", () => {
  const originalModule = jest.requireActual("../../utils/utils");
  return {
    ...originalModule,
    getRandomVerifyCode: jest.fn(),
  };
});

describe("Auth Integration Tests", () => {
  describe("Register endpoint", () => {
    let testMobile1 = "0781234560";
    let testMobile2 = "0781234561";
    let testPassword1 = "Password1!";
    let validMobiles = [
      "0709999999",
      "0719999999",
      "0729999999",
      "0749999999",
      "0759999999",
      "0769999999",
      "0779999999",
      "0789999999",
    ];
    let invalidMobiles = [
      "0739999999",
      "719999999",
      "0123456789",
      "071999999",
      "07199999990",
    ];
    let invalidPasswords = [
      "Test123",
      "test1234",
      "TEST1234",
      "TESTtest",
      "TESTTEST",
      "testtest",
      "12345678",
    ];

    beforeAll(async () => {
      await cleanDB();
    });
    validMobiles.forEach((mobile) => {
      it(`should register user with mobile: ${mobile}`, async () => {
        const res = await request(app).post("/register").send({
          mobile,
          password: testPassword1,
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/registered successfully/);
        expect(res.body.is_verified).toBe(false);
        expect(res.body.mobile).toBe(mobile);
        expect(res.body.token).toBeDefined();
      });
    });

    it(`should register return a short lived token and /me`, async () => {
      const res = await request(app).post("/register").send({
        mobile: testMobile2,
        password: testPassword1,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.mobile).toBe(testMobile2);

      verifyTokenValidity(res.body.token, 300); // 5 mins

      const res2 = await request(app)
        .get("/me")
        .set("Authorization", `Bearer ${res.body.token}`);
      expect(res2.statusCode).toBe(200);
      expect(res2.body).toHaveProperty("mobile");
      expect(res2.body).toHaveProperty("is_verified");
    });

    it("should not allow duplicate registration", async () => {
      const res1 = await request(app).post("/register").send({
        mobile: testMobile1,
        password: testPassword1,
      });
      expect(res1.statusCode).toBe(200);

      const res2 = await request(app).post("/register").send({
        mobile: testMobile1,
        password: testPassword1,
      });

      expect(res2.statusCode).toBe(400);
      expect(res2.body.error).toMatch(/already registered/);
    });

    invalidMobiles.forEach((mobile) => {
      it(`should give 400 error if mobile not valid: ${mobile}`, async () => {
        const res = await request(app).post("/register").send({
          mobile,
          password: testPassword1,
        });
        expect([400, 401]).toContain(res.statusCode);
        expect(res.body.error).toMatch(/Invalid mobile/);
      });
    });

    invalidPasswords.forEach((pass) => {
      it(`should give 400 error if mobile not valid: ${pass}`, async () => {
        const res = await request(app).post("/register").send({
          mobile: testMobile1,
          password: pass,
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(
          /Password must be at least 8 characters/
        );
      });
    });
  });

  describe("Login endpoint", () => {
    let testMobile1 = "0781234560";
    let testMobile2 = "0781234561";
    let testPassword1 = "Password1!";

    beforeAll(async () => {
      await cleanDB();
      await insertRow(testMobile1, testPassword1, false);
      await insertRow(testMobile2, testPassword1, true);
    });

    it("should login unverified user", async () => {
      const res = await request(app).post("/login").send({
        mobile: testMobile1,
        password: testPassword1,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/Login successful/);
      expect(res.body.is_verified).toBe(false);
      expect(res.body).toHaveProperty("token");
      verifyTokenValidity(res.body.token, 300); // 5 mins
    });

    it("should login verified user", async () => {
      const res = await request(app).post("/login").send({
        mobile: testMobile2,
        password: testPassword1,
      });
      expect(res.statusCode).toBe(200);
      verifyTokenValidity(res.body.token, 3600); // 1 hour
    });

    it("should fail login with wrong password", async () => {
      const res = await request(app).post("/login").send({
        mobile: testMobile1,
        password: "wrongpass123",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatch(/Invalid mobile or password/);
    });

    it("should return user info with /me when login token", async () => {
      const res1 = await request(app).post("/login").send({
        mobile: testMobile1,
        password: testPassword1,
      });

      expect(res1.statusCode).toBe(200);

      const res2 = await request(app)
        .get("/me")
        .set("Authorization", `Bearer ${res1.body.token}`);
      expect(res2.statusCode).toBe(200);
      expect(res2.body).toHaveProperty("mobile");
      expect(res2.body).toHaveProperty("is_verified");
    });
  });

  describe("VerifyUserCode and SendCode endpoint", () => {
    let testMobile1 = "0781234560";
    let testPassword1 = "Password1!";

    beforeAll(async () => {
      await cleanDB();
      await insertRow(testMobile1, testPassword1, false);
    });

    it("should return 200 on valid verification code and same user cannot be verified twice", async () => {
      const res1 = await request(app).post("/login").send({
        mobile: testMobile1,
        password: testPassword1,
      });
      expect(res1.statusCode).toBe(200);
      expect(res1.body.is_verified).toBe(false);

      // user doesn't exist
      const res2 = await request(app)
        .post("/verify-user-code")
        .set("authorization", `Bearer ${res1.body.token}`)
        .send({
          mobile: "0781111111",
          code: "123456",
        });

      expect(res2.statusCode).toBe(400);
      expect(res2.body.error).toMatch(/User does not exist/);

      // invalid code
      const res3 = await request(app)
        .post("/verify-user-code")
        .set("authorization", `Bearer ${res1.body.token}`)
        .send({
          mobile: testMobile1,
          code: "999999",
        });

      expect(res3.statusCode).toBe(400);
      expect(res3.body.error).toMatch(/Invalid or expired verification code/);

      getRandomVerifyCode.mockReturnValue("123456");

      // try to send code but user doesn't exist
      const res4 = await request(app).post("/send-code").send({
        mobile: "0781111111",
        type: "mobile_verification",
      });
      expect(res4.statusCode).toBe(400);
      expect(res4.body.error).toMatch(/User does not exist/);

      // send code code
      const res5 = await request(app).post("/send-code").send({
        mobile: testMobile1,
        type: "mobile_verification",
      });
      expect(res5.statusCode).toBe(200);
      // verify user
      const res6 = await request(app)
        .post("/verify-user-code")
        .set("authorization", `Bearer ${res1.body.token}`)
        .send({
          mobile: testMobile1,
          code: "123456",
        });
      expect(res6.statusCode).toBe(200);
      expect(res6.body.token).toBeDefined();

      verifyTokenValidity(res6.body.token, 3600); // 1 hour

      // user's is_verified should have been changed to true
      const res7 = await request(app).post("/login").send({
        mobile: testMobile1,
        password: testPassword1,
      });
      expect(res7.statusCode).toBe(200);
      expect(res7.body.is_verified).toBe(true);
    });
  });

  describe("Me endpoint", () => {
    const payload = { mobile: "0781234567", is_verified: false };

    beforeAll(async () => {
      await cleanDB();
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app).get("/me");
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/Authorization header required/);
    });

    it("should return 401 if the token is invalid", async () => {
      const res = await request(app)
        .get("/me")
        .set("Authorization", `Bearer invalidToken123`);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatch(/Invalid or expired token/);
    });

    it("should return 200 with user data if token is valid", async () => {
      const validToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      const res = await request(app)
        .get("/me")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.mobile).toBe(payload.mobile);
      expect(res.body.is_verified).toBe(payload.is_verified);
    });

    it("should return 401 for expired token", async () => {
      const expiredToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "-1s",
      });

      const res = await request(app)
        .get("/me")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatch("Invalid or expired token");
    });
  });

  describe("reset password and SendCode endpoint", () => {
    let testMobile1 = "0781234560";
    let testPassword1 = "Password1!";

    beforeAll(async () => {
      await cleanDB();
      await insertRow(testMobile1, testPassword1, false);
    });

    it("should return 200 on valid verification code and same user cannot be verified twice", async () => {
      const res1 = await request(app).post("/login").send({
        mobile: testMobile1,
        password: testPassword1,
      });
      expect(res1.statusCode).toBe(200);

      // user doesn't exist
      const res2 = await request(app)
        .post("/reset-password")
        .send({
          mobile: "0781111111",
          code: "123456",
          newPassword: "Test1234",
        });

      expect(res2.statusCode).toBe(400);
      expect(res2.body.error).toMatch(/User does not exist/);

      // invalid code
      const res3 = await request(app)
        .post("/reset-password")
        .send({
          mobile: testMobile1,
          code: "999999",
          newPassword: "Test1234",
        });

      expect(res3.statusCode).toBe(400);
      expect(res3.body.error).toMatch(/Invalid or expired verification code/);

      getRandomVerifyCode.mockReturnValue("123456");

      // send code code
      const res5 = await request(app).post("/send-code").send({
        mobile: testMobile1,
        type: "password_reset",
      });
      expect(res5.statusCode).toBe(200);

      const res6 = await request(app)
        .post("/reset-password")
        .send({
          mobile: testMobile1,
          code: "123456",
          newPassword: "Test1234",
        });
      expect(res6.statusCode).toBe(200);

      // previous password should not work
      const res7 = await request(app).post("/login").send({
        mobile: testMobile1,
        password: testPassword1,
      });
      expect(res7.statusCode).toBe(401);

      // new password should not work
      const res8 = await request(app).post("/login").send({
        mobile: testMobile1,
        password: "Test1234",
      });
      expect(res8.statusCode).toBe(200);
    });
  });
});
