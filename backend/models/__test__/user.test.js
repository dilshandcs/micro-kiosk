const User = require("../user"); // Assuming your User model file is named "user.js"
const { Pool } = require("pg");

// Mock the Pool class
jest.mock("pg", () => {
  const mPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe("User Model", () => {
  let pool;

  beforeEach(() => {
    pool = new Pool();
  });

  afterEach(() => {
    jest.clearAllMocks(); // Reset mock state after each test
  });

  describe("create", () => {
    afterEach(() => {
      jest.clearAllMocks(); // Reset mock state after each test
    });

    it("should create a new user and return user data", async () => {
      const mockResult = {
        rows: [{ id: 1, mobile: "1234567890", is_verified: false }],
      };

      pool.query.mockResolvedValue(mockResult);

      const mobile = "1234567890";
      const hashedPassword = "hashedPassword123";
      const user = await User.create(mobile, hashedPassword);

      expect(user).toEqual(mockResult.rows[0]);
      expect(pool.query).toHaveBeenCalledWith(
        "INSERT INTO users (mobile, password) VALUES ($1, $2) RETURNING id, mobile, is_verified",
        [mobile, hashedPassword]
      );
    });
  });

  describe("findByMobile", () => {
    afterEach(() => {
      jest.clearAllMocks(); // Reset mock state after each test
    });

    it("should return a user if found", async () => {
      const mockResult = {
        rows: [{ id: 1, mobile: "1234567890", is_verified: false }],
      };

      pool.query.mockResolvedValue(mockResult);

      const user = await User.findByMobile("1234567890");
      expect(user).toEqual(mockResult.rows[0]);
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE mobile = $1",
        ["1234567890"]
      );
    });

    it("should return undefined if no user is found", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const user = await User.findByMobile("nonexistentmobile");
      expect(user).toBeUndefined();
    });
  });

  // describe('verifyUser', () => {
  //   it('should verify the user if the code matches', async () => {
  //     const mockUser = { id: 1, mobile: '1234567890', verification_code: '123456' };
  //     const mockResult = { rows: [mockUser] };

  //     pool.query.mockResolvedValueOnce(mockResult); // First query for user lookup
  //     pool.query.mockResolvedValueOnce({}); // Second query for update

  //     const result = await User.verifyUser('1234567890', '123456');
  //     expect(result).toBe(true);
  //     expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE mobile = $1', ['1234567890']);
  //     expect(pool.query).toHaveBeenCalledWith(
  //       'UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE mobile = $1',
  //       ['1234567890']
  //     );
  //   });

  //   it('should not verify the user if the code does not match', async () => {
  //     const mockUser = { id: 1, mobile: '1234567890', verification_code: '123456' };
  //     const mockResult = { rows: [mockUser] };

  //     pool.query.mockResolvedValueOnce(mockResult); // First query for user lookup

  //     const result = await User.verifyUser('1234567890', 'wrongcode');
  //     expect(result).toBe(false);
  //     expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE mobile = $1', ['1234567890']);
  //     expect(pool.query).not.toHaveBeenCalledWith(
  //       'UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE mobile = $1',
  //       ['1234567890']
  //     );
  //   });
  // });
  describe("newCode", () => {
    afterEach(() => {
      jest.clearAllMocks(); // Reset mock state after each test
    });

    it("should insert a new verification code and return the inserted row", async () => {
      const mockResult = {
        rows: [
          {
            id: 1,
            user_id: 1,
            code: "123456",
            type: "mobile_verification",
            expires_at: "2023-12-31T23:59:59Z",
          },
        ],
      };

      pool.query
        .mockResolvedValueOnce({}) // First query to mark existing codes as consumed
        .mockResolvedValueOnce(mockResult); // Second query to insert the new code

      const userId = 1;
      const code = "123456";
      const type = "mobile_verification";
      const expiresAt = "2023-12-31T23:59:59Z";

      await User.newCode(userId, code, type, expiresAt);

      expect(pool.query).toHaveBeenCalledWith(
        `UPDATE verification_codes
       SET consumed = TRUE
       WHERE user_id = $1 AND type = $2 AND consumed = FALSE`,
        [userId, type]
      );
      expect(pool.query).toHaveBeenCalledWith(
        `INSERT INTO verification_codes (user_id, code, type, expires_at)
       VALUES ($1, $2, $3, $4)`,
        [userId, code, type, expiresAt]
      );
    });
  });

  describe("verifyUser", () => {
    afterEach(() => {
      jest.clearAllMocks(); // Reset mock state after each test
    });

    it("should verify the user and mark the code as consumed - mobile_verification", async () => {
      const mockCodeResult = {
        rows: [
          { id: 1, user_id: 1, code: "123456", type: "mobile_verification" },
        ],
      };

      pool.query
        .mockResolvedValueOnce(mockCodeResult) // First query to find the verification code
        .mockResolvedValueOnce({}) // Second query to mark the code as consumed
        .mockResolvedValueOnce({}); // Third query to mark the user as verified

      const userId = 1;
      const code = "123456";
      const type = "mobile_verification";

      const result = await User.verifyUser(userId, code, type);

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        `SELECT * FROM verification_codes
       WHERE user_id = $1 AND code = $2 AND type = $3
       AND expires_at > NOW() AND consumed = FALSE`,
        [userId, code, type]
      );
      expect(pool.query).toHaveBeenCalledWith(
        `UPDATE verification_codes SET consumed = TRUE WHERE id = $1`,
        [mockCodeResult.rows[0].id]
      );
      expect(pool.query).toHaveBeenCalledWith(
        `UPDATE users SET is_verified = TRUE WHERE id = $1`,
        [userId]
      );
    });

    it("should verify the user and mark the code as consumed - password_reset", async () => {
      const mockCodeResult = {
        rows: [{ id: 1, user_id: 1, code: "123456", type: "password_reset" }],
      };

      pool.query
        .mockResolvedValueOnce(mockCodeResult) // First query to find the verification code
        .mockResolvedValueOnce({}); // Second query to mark the code as consumed

      const userId = 1;
      const code = "123456";
      const type = "password_reset";

      const result = await User.verifyUser(userId, code, type);

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        `SELECT * FROM verification_codes
       WHERE user_id = $1 AND code = $2 AND type = $3
       AND expires_at > NOW() AND consumed = FALSE`,
        [userId, code, type]
      );
      expect(pool.query).toHaveBeenCalledWith(
        `UPDATE verification_codes SET consumed = TRUE WHERE id = $1`,
        [mockCodeResult.rows[0].id]
      );
      expect(pool.query).not.toHaveBeenCalledWith(
        `UPDATE users SET is_verified = TRUE WHERE id = $1`,
        [userId]
      );
    });

    it("should return false if the verification code is not found or expired", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }); // No matching verification code found

      const userId = 1;
      const code = "wrongcode";
      const type = "mobile_verification";

      const result = await User.verifyUser(userId, code, type);

      expect(result).toBe(false);
      expect(pool.query).toHaveBeenCalledWith(
        `SELECT * FROM verification_codes
       WHERE user_id = $1 AND code = $2 AND type = $3
       AND expires_at > NOW() AND consumed = FALSE`,
        [userId, code, type]
      );
      expect(pool.query).not.toHaveBeenCalledWith(
        `UPDATE verification_codes SET consumed = TRUE WHERE id = $1`,
        expect.anything()
      );
    });
  });
});
