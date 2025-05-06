const request = require("supertest");
const { app } = require("../../app"); // Import the Express app
const User = require("../../models/user");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

jest.mock("bcryptjs");

// Mock User model methods
jest.mock("../../models/user");

jest.mock("express-rate-limit", () =>
  jest.fn(() => (req, res, next) => next())
);

describe("User Authentication API Tests", () => {
  let mockUser;

  beforeEach(() => {
    mockUser = {
      id: 1,
      mobile: "0771234567",
      password: "Password123",
      is_verified: false,
    };
  });

  describe("POST /register", () => {
    it("should register a user successfully", async () => {
      // Mock user creation and password hashing
      User.findByMobile.mockResolvedValue(null); // No user found
      bcryptjs.hash.mockResolvedValue("hashedPassword");
      User.create.mockResolvedValue(mockUser);

      const response = await request(app).post("/register").send({
        mobile: mockUser.mobile,
        password: mockUser.password,
      });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User registered successfully");
      expect(response.body.token).toBeDefined();
    });

    it("should return error if mobile format is invalid", async () => {
      const response = await request(app).post("/register").send({
        mobile: "invalidMobile",
        password: mockUser.password,
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid mobile number format");
    });

    it("should return error if password is weak", async () => {
      const response = await request(app).post("/register").send({
        mobile: mockUser.mobile,
        password: "weak",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        "Password must be at least 8 characters with uppercase, lowercase, and number"
      );
    });

    it("should return error if mobile is already registered", async () => {
      User.findByMobile.mockResolvedValue(mockUser); // User already exists

      const response = await request(app).post("/register").send({
        mobile: mockUser.mobile,
        password: mockUser.password,
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Mobile number already registered");
    });

    it("should return 500 if an error occurs during registration", async () => {
      User.findByMobile.mockResolvedValue(null); // User already exists
      User.create.mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/register").send({
        mobile: "0781234560",
        password: "Password1!",
      });

      expect(response.statusCode).toBe(500);
      expect(response.body.error).toBe("Server error during registration");
    });
  });

  describe("POST /login", () => {
    it("should login successfully with correct credentials", async () => {
      const hashedPassword = await bcryptjs.hash(mockUser.password, 10);

      // Mock finding user and password comparison
      User.findByMobile.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      bcryptjs.compare.mockResolvedValue(true);

      const response = await request(app).post("/login").send({
        mobile: mockUser.mobile,
        password: mockUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.token).toBeDefined();
    });

    it("should return error if invalid mobile or password", async () => {
      User.findByMobile.mockResolvedValue(null);

      const response = await request(app).post("/login").send({
        mobile: mockUser.mobile,
        password: "wrongPassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid mobile or password");
    });

    it("should return 500 if an error occurs during log", async () => {
      User.findByMobile.mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/login").send({
        mobile: "0781234560",
        password: "Password1!",
      });

      expect(response.statusCode).toBe(500);
      expect(response.body.error).toBe("Server error during login");
    });

    it("should login successfully and return token with expiration for verified user", async () => {
      const hashedPassword = await bcryptjs.hash(mockUser.password, 10);

      // Mock verified user
      User.findByMobile.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
        is_verified: true,
      });
      bcryptjs.compare.mockResolvedValue(true);

      const mockJwtSign = jest
        .spyOn(jwt, "sign")
        .mockImplementation((payload, secret, options) => {
          return "mockedToken"; // Return a mocked token
        });

      const response = await request(app).post("/login").send({
        mobile: mockUser.mobile,
        password: mockUser.password,
      });

      // Check if the token was generated with an expiry of 1 hour
      expect(mockJwtSign).toHaveBeenCalledWith(
        expect.objectContaining({ mobile: mockUser.mobile, is_verified: true }),
        process.env.JWT_SECRET,
        expect.objectContaining({ expiresIn: "1h" }) // Verify expiry for verified user
      );

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.token).toBe("mockedToken");

      mockJwtSign.mockRestore();
    });

    it("should login successfully and return token with expiration for unverified user", async () => {
      const hashedPassword = await bcryptjs.hash(mockUser.password, 10);

      // Mock unverified user
      User.findByMobile.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
        is_verified: false,
      });
      bcryptjs.compare.mockResolvedValue(true);

      const mockJwtSign = jest
        .spyOn(jwt, "sign")
        .mockImplementation((payload, secret, options) => {
          return "mockedToken"; // Return a mocked token
        });

      const response = await request(app).post("/login").send({
        mobile: mockUser.mobile,
        password: mockUser.password,
      });

      // Check if the token was generated with an expiry of 5 minutes
      expect(mockJwtSign).toHaveBeenCalledWith(
        expect.objectContaining({
          mobile: mockUser.mobile,
          is_verified: false,
        }),
        process.env.JWT_SECRET,
        expect.objectContaining({ expiresIn: "5m" }) // Verify expiry for unverified user
      );

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.token).toBe("mockedToken");

      mockJwtSign.mockRestore();
    });

    it("should return error if invalid mobile or password", async () => {
      User.findByMobile.mockResolvedValue(null);

      const response = await request(app).post("/login").send({
        mobile: mockUser.mobile,
        password: "wrongPassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid mobile or password");
    });
  });

  describe("POST /verify-user-code", () => {
    it("should verify user with correct code", async () => {
      const token = jwt.sign(
        { mobile: mockUser.mobile, is_verified: mockUser.is_verified },
        process.env.JWT_SECRET
      );

      const mockVerificationResult = true;
      const hashedPassword = await bcryptjs.hash(mockUser.password, 10);

      // Mock finding user and password comparison
      User.findByMobile.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      User.verifyUser.mockResolvedValue(mockVerificationResult);

      const response = await request(app)
        .post("/verify-user-code")
        .set("authorization", `Bearer ${token}`)
        .send({
          mobile: mockUser.mobile,
          code: "123456",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    it("should return error if verification code is empty or doesn not contain only numbers, 6digits", async () => {
      const token = jwt.sign(
        { mobile: mockUser.mobile, is_verified: mockUser.is_verified },
        process.env.JWT_SECRET
      );

      const response1 = await request(app)
        .post("/verify-user-code")
        .set("authorization", `Bearer ${token}`)
        .send({
          mobile: mockUser.mobile,
          code: "A12345",
        });

      expect(response1.status).toBe(400);
      expect(response1.body.error).toBe("Invalid verification code");

      const response2 = await request(app)
        .post("/verify-user-code")
        .set("authorization", `Bearer ${token}`)
        .send({
          mobile: mockUser.mobile,
          code: "12345",
        });

      expect(response2.status).toBe(400);
      expect(response2.body.error).toBe("Invalid verification code");

      const response3 = await request(app)
        .post("/verify-user-code")
        .set("authorization", `Bearer ${token}`)
        .send({
          mobile: mockUser.mobile,
          code: "",
        });

      expect(response3.status).toBe(400);
      expect(response3.body.error).toBe("Invalid verification code");
    });

    it("should return error for invalid verification code", async () => {
      const token = jwt.sign(
        { mobile: mockUser.mobile, is_verified: mockUser.is_verified },
        process.env.JWT_SECRET
      );
      const hashedPassword = await bcryptjs.hash(mockUser.password, 10);

      // Mock finding user and password comparison
      User.findByMobile.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      User.verifyUser.mockResolvedValue(false);

      const response = await request(app)
        .post("/verify-user-code")
        .set("authorization", `Bearer ${token}`)
        .send({
          mobile: mockUser.mobile,
          code: "123456",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid or expired verification code");
    });

    it("should return error if token is missing", async () => {
      const hashedPassword = await bcryptjs.hash(mockUser.password, 10);

      // Mock finding user and password comparison
      User.findByMobile.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      User.verifyUser.mockResolvedValue(false);

      const response = await request(app).post("/verify-user-code").send({
        mobile: mockUser.mobile,
        code: "123456",
      });

      expect(response.status).toBe(401);
    });

    it("should return error if verification code requester  user not found ", async () => {
      const token = jwt.sign(
        { mobile: mockUser.mobile, is_verified: mockUser.is_verified },
        process.env.JWT_SECRET
      );
      // Mock finding user and password comparison
      User.findByMobile.mockResolvedValue(null);

      const response = await request(app)
        .post("/verify-user-code")
        .set("authorization", `Bearer ${token}`)
        .send({
          mobile: mockUser.mobile,
          code: "123456",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("User does not exist");
    });

    it("should return 500 error if database error ", async () => {
      const token = jwt.sign(
        { mobile: mockUser.mobile, is_verified: mockUser.is_verified },
        process.env.JWT_SECRET
      );
      // Mock finding user and password comparison
      User.findByMobile.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/verify-user-code")
        .set("authorization", `Bearer ${token}`)
        .send({
          mobile: mockUser.mobile,
          code: "123456",
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toMatch(/Database error/);
    });
  });

  describe("POST /send-code", () => {
    it("should send the code if user exists", async () => {
      const hashedPassword = await bcryptjs.hash(mockUser.password, 10);

      // Mock finding user and password comparison
      User.findByMobile.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      User.newCode.mockResolvedValue(undefined);

      const response = await request(app).post("/send-code").send({
        mobile: mockUser.mobile,
        type: "mobile_verification",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeUndefined();
    });

    it("should give 500 if user does not exist", async () => {
      // Mock finding user and password comparison
      User.findByMobile.mockResolvedValue(null);

      const response = await request(app).post("/send-code").send({
        mobile: mockUser.mobile,
        type: "mobile_verification",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/User does not exist/);
    });

    it("should give 500 if database error", async () => {
      User.findByMobile.mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/send-code").send({
        mobile: mockUser.mobile,
        type: "mobile_verification",
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toMatch(/Database error/);
    });
  });

  describe("GET /me", () => {
    it("should return user info if token is valid", async () => {
      const token = jwt.sign(
        { mobile: mockUser.mobile, is_verified: mockUser.is_verified },
        process.env.JWT_SECRET
      );

      const response = await request(app)
        .get("/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.mobile).toBe(mockUser.mobile);
      expect(response.body.is_verified).toBe(mockUser.is_verified);
    });

    it("should return error if no token provided", async () => {
      const response = await request(app).get("/me");

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Authorization header required/);
    });

    it("should return error if token is invalid", async () => {
      const response = await request(app)
        .get("/me")
        .set("Authorization", "Bearer invalidToken");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid or expired token");
    });

    it("should return 500 if jwt.verify throws an error", async () => {
      const token = "fake-jwt-token";

      // Mock jwt.verify to throw an error
      const mockVerifySpy = jest.spyOn(jwt, "verify").mockImplementation(() => {
        throw new Error("JWT verification failed");
      });

      const res = await request(app)
        .get("/me")
        .set("authorization", `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid or expired token");

      mockVerifySpy.mockRestore();
    });
  });

  describe("POST /send-notification", () => {
    it("should return success for sending notification", async () => {
      const response = await request(app)
        .post("/send-notification")
        .set("Authorization", "Bearer dummyToken")
        .send({
          message: "Test notification",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "Notification sent successfully (mocked)"
      );
    });
  });

  describe("POST /reset-password", () => {
    it("should verify user with correct code", async () => {
      const mockVerificationResult = true;
      const hashedPassword = await bcryptjs.hash(mockUser.password, 10);

      // Mock finding user and password comparison
      User.findByMobile.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      User.updatePassword.mockResolvedValue(mockVerificationResult);

      const response = await request(app)
        .post("/reset-password")
        .send({
          mobile: mockUser.mobile,
          code: "123456",
          newPassword: "Test1234",
        });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return error if verification code is empty or doesn not contain only numbers, 6digits", async () => {
      const response1 = await request(app)
        .post("/reset-password")
        .send({
          mobile: mockUser.mobile,
          code: "A12345",
          newPassword: "Test1234",
        });
console.log("rrrrrrrrr", response1.body);
      expect(response1.status).toBe(400);
      expect(response1.body.error).toBe("Invalid verification code");

      const response2 = await request(app)
        .post("/reset-password")
        .send({
          mobile: mockUser.mobile,
          code: "12345",
          newPassword: "Test1234",
        });

      expect(response2.status).toBe(400);
      expect(response2.body.error).toBe("Invalid verification code");

      const response3 = await request(app)
        .post("/reset-password")
        .send({
          mobile: mockUser.mobile,
          code: "",
          newPassword: "Test1234",
        });

      expect(response3.status).toBe(400);
      expect(response3.body.error).toBe("Invalid verification code");
    });

    it("should return error for invalid verification code", async () => {
      const hashedPassword = await bcryptjs.hash(mockUser.password, 10);

      // Mock finding user and password comparison
      User.findByMobile.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      User.updatePassword.mockResolvedValue(false);

      const response = await request(app)
        .post("/reset-password")
        .send({
          mobile: mockUser.mobile,
          code: "123456",
          newPassword: "Test1234",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid or expired verification code");
    });

    it("should return error if verification code requester  user not found ", async () => {
      // Mock finding user and password comparison
      User.findByMobile.mockResolvedValue(null);

      const response = await request(app)
        .post("/reset-password")
        .send({
          mobile: mockUser.mobile,
          code: "123456",
          newPassword: "Test1234",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("User does not exist");
    });

    it("should return 500 error if database error ", async () => {
      // Mock finding user and password comparison
      User.findByMobile.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/reset-password")
        .send({
          mobile: mockUser.mobile,
          code: "123456",
          newPassword: "Test1234",
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toMatch(/Database error/);
    });

    it("should return error if invalid mobile or password", async () => {
      const response = await request(app)
        .post("/reset-password")
        .send({
          mobile: mockUser.mobile,
          code: "123456",
          newPassword: "wrongPassword",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Password must be at least 8 characters with uppercase, lowercase, and number");
    });
  });  

  // // Good to be last test because it unmocks the rate limiter which needs to be mocked for above describes
  // describe('Rate Limiter Tests', () => {
  //   const mobile = '0771234567';
  //   const password = 'Password123';

  //   let mockUser;

  //   beforeEach(() => {
  //     mockUser = {
  //       mobile,
  //       password,
  //       is_verified: false,
  //     };
  //   });

  //   beforeEach(() => {
  //     jest.unmock('express-rate-limit'); // Explicitly unmock the User model
  //   });

  //   it('should block requests that exceed the rate limit', async () => {
  //     User.findByMobile.mockResolvedValue(null); // No user found
  //     bcryptjs.hash.mockResolvedValue('hashedPassword');
  //     User.create.mockResolvedValue(mockUser);

  //     for (let i = 0; i < 5; i++) {
  //       const response = await request(app)
  //         .post('/register')
  //         .send({
  //           mobile: mockUser.mobile,
  //           password: mockUser.password,
  //         });
  //       expect(response.status).toBe(200); // Should be OK within the limit
  //     }

  //     // Send one more request, which should be blocked by rate limiting
  //     const response6 = await request(app)
  //       .post('/register')
  //       .send({
  //         mobile: mockUser.mobile,
  //         password: mockUser.password,
  //       });

  //       // Expect to get the rate limit error after 5 requests
  //     expect(response6.status).toBe(429); // Too Many Requests
  //     expect(response6.text).toBe('Too many requests, please try again later.');
  //   });
  // });
});
