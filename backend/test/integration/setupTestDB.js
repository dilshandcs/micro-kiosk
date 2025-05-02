const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const insertRow = async (mobile, password, is_verified) => {
  try {
    const hashed = await bcrypt.hash(password, saltRounds);

    // SQL query to insert a row with the given mobile and password
    await pool.query(
      `
      INSERT INTO users (mobile, password, is_verified) 
      VALUES ($1, $2, $3);
    `,
      [mobile, hashed, is_verified]
    );
  } catch (err) {
    console.error("Error inserting test data:", err);
  }
};

const verifyTokenValidity = (token, expectedValityInSecs) => {
  const decodedToken = jwt.decode(token);
  expect(decodedToken).toHaveProperty("exp");

  const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
  const tokenExpiration = decodedToken.exp; // The 'exp' claim in the token

  // Check that the token's expiration is within the expected time window (e.g., 1 hour)
  const expectedExpirationTime = currentTimestamp + expectedValityInSecs; // 1 hour from now (in seconds)

  // Ensure the expiration time is close to the expected expiration time (allowing a small margin)
  expect(tokenExpiration).toBeGreaterThanOrEqual(expectedExpirationTime - 10); // Allow for a 5-second difference
  expect(tokenExpiration).toBeLessThanOrEqual(expectedExpirationTime + 10); // Allow for a 5-second difference
};

const cleanDB = async () => {
  try {
    await pool.query("DELETE FROM users"); // Replace with your table names
  } catch (err) {
    console.error("Error cleaning the database:", err);
  }
};

afterAll(async () => {
  await pool.end();
});

module.exports = { cleanDB, insertRow, verifyTokenValidity };
