const { Pool } = require("pg");

// ✅ Use pg.Pool for better connection management
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ✅ User "model"-like abstraction
const User = {
  create: async (mobile, hashedPassword) => {
    const result = await pool.query(
      "INSERT INTO users (mobile, password) VALUES ($1, $2) RETURNING id, mobile, is_verified",
      [mobile, hashedPassword]
    );
    return result.rows[0];
  },

  findByMobile: async (mobile) => {
    const result = await pool.query("SELECT * FROM users WHERE mobile = $1", [
      mobile,
    ]);
    return result.rows[0];
  },

  newCode: async (userId, code, type, expiresAt) => {
    await pool.query(
      `UPDATE verification_codes
       SET consumed = TRUE
       WHERE user_id = $1 AND type = $2 AND consumed = FALSE`,
      [userId, type]
    );

    await pool.query(
      `INSERT INTO verification_codes (user_id, code, type, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [userId, code, type, expiresAt]
    );
  },

  findValidCode: async (userId, code, type) => {
    const result = await pool.query(
      `SELECT * FROM verification_codes
       WHERE user_id = $1 AND code = $2 AND type = $3
       AND expires_at > NOW() AND consumed = FALSE`,
      [userId, code, type]
    );
      if (!result || result.rows.length === 0) {
        return null;
      }

      return result.rows[0].id;

  },

  verifyUser: async (userId, code, type) => {
    const codeId = await User.findValidCode(userId, code, type);

    if (!codeId) {
      return false; // Code not found or expired
    }

    await pool.query(
      `UPDATE verification_codes SET consumed = TRUE WHERE id = $1`,
      [codeId]
    );

    // If it's a mobile verification, mark the user as verified
    if (type === "mobile_verification") {
      await pool.query(`UPDATE users SET is_verified = TRUE WHERE id = $1`, [
        userId,
      ]);
    }

    return true;
  },
  updatePassword: async (userId, code, hashedPassword, type) => {
    const codeId = await User.findValidCode(userId, code, type);

    if (!codeId) {
      return false; // Code not found or expired
    }

    await pool.query(
      `UPDATE verification_codes SET consumed = TRUE WHERE id = $1`,
      [codeId]
    );

    await pool.query(
      `UPDATE users SET password = $1 WHERE id = $2`,
      [hashedPassword, userId]
    );

    return true
  }
};

module.exports = User;
