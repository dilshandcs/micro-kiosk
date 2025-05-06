// tests/auth.test.js
const request = require("supertest");
const { cleanDB } = require("./setupTestDB");
const jwt = require("jsonwebtoken");
require("./setupTestDB");

const MAX_RATE_LIMIT = 3; // Set the rate limit for testing
process.env.RATE_LIMIT_MAX = MAX_RATE_LIMIT;
const { app } = require("../../app");

describe("Rate Limiting", () => {
    beforeEach(async () => {
        await cleanDB();
      });

  it("should block register requests after limit is exceeded", async () => {
    // Make 3 successful requests
    for (let i = 0; i < MAX_RATE_LIMIT; i++) {
        const res = await request(app)
        .post("/register")
        .send({
            mobile: `072111111${i}`,
            password: "Test1234",
          });
          expect(res.status).toBe(200);
    }

    // The 4th request should be blocked
    const res = await request(app)
      .post("/register")
      .send({
        mobile: `0721111113`,
        password: "Test1234",
      });
      console.log(res.body);
    expect(res.status).toBe(429);
  });

  it("should block login requests after limit is exceeded", async () => {
    const payload = {
      mobile: "0721111111",
      password: "Test1234",
    };
    // Make 3 successful requests
    for (let i = 0; i < MAX_RATE_LIMIT; i++) {
        console.log("Request number:", i);
        const res = await request(app).post("/login").send(payload);
      expect(res.status).toBe(401);
    }

    // The 4th request should be blocked
    const res = await request(app).post("/login").send(payload);;
    expect(res.status).toBe(429);
  });

  it("should block send-code requests after limit is exceeded", async () => {
    const payload = {
        mobile: "0781111111",
        type: "mobile_verification",
      };
    // Make 3 successful requests
    for (let i = 0; i < MAX_RATE_LIMIT; i++) {
      const res = await request(app).post("/send-code").send(payload);
      expect(res.status).toBe(400);
    }

    // The 4th request should be blocked
    const res = await request(app).post("/send-code").send(payload);;
    expect(res.status).toBe(429);
  });

  
  it("should block verify-user-code requests after limit is exceeded", async () => {
    const validToken = jwt.sign({ mobile: "0721111111", is_verified: false }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const payload = {
        mobile: "0721111111",
        code: "123456",
      };
    // Make 3 successful requests
    for (let i = 0; i < MAX_RATE_LIMIT; i++) {
        const res = await request(app).post("/verify-user-code").set("Authorization", `Bearer ${validToken}`).send(payload);
        expect(res.status).toBe(400);
    }

    // The 4th request should be blocked
    const res = await request(app).post("/verify-user-code").set("Authorization", `Bearer ${validToken}`).send(payload);;
    expect(res.status).toBe(429);
  });

  it("should block reset-password requests after limit is exceeded", async () => {
    const payload = {
        mobile: "0721111111",
        code: "999999",
        newPassword: "Test1234",
      };
    // Make 3 successful requests
    for (let i = 0; i < MAX_RATE_LIMIT; i++) {
        const res = await request(app).post("/reset-password").send(payload);
        expect(res.status).toBe(400);
    }

    // The 4th request should be blocked
    const res = await request(app).post("/reset-password").send(payload);;
    expect(res.status).toBe(429);
  });

  it("me request shouldn't have a limit", async () => {
    const validToken = jwt.sign({ mobile: "0721111111", is_verified: false }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
    // Make 3 successful requests
    for (let i = 0; i < MAX_RATE_LIMIT; i++) {
        const res = await request(app).post("/me").set("Authorization", `Bearer ${validToken}`);
        expect(res.status).toBe(405);
    }

    // The 4th request should not be blocked
    const res = await request(app).post("/me").set("Authorization", `Bearer ${validToken}`);
    expect(res.status).toBe(405);
  });
});
