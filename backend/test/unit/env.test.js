const request = require("supertest");
const { app } = require("../../app");

describe("CORS Origin Tests", () => {
  it("should allow requests from the default origin", async () => {
    const response = await request(app)
      .get("/me")
      .set("Origin", "http://localhost:8081"); // Default origin

    expect(response.status).toBe(401); // Unauthorized since no token is provided
    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:8081"
    );
  });

  it("should allow requests from a custom origin set in environment variables", async () => {
    jest.resetModules(); // Reset module registry to ensure fresh imports
    process.env.CORS_ORIGIN = "http://custom-origin.com";
    await jest.isolateModules(async () => {
      const { app } = require("../../app"); // Re-import app after setting environment variable

      const response = await request(app)
        .get("/me")
        .set("Origin", "http://custom-origin.com");

      expect(response.status).toBe(401); // Unauthorized since no token is provided
      expect(response.headers["access-control-allow-origin"]).toBe(
        process.env.CORS_ORIGIN
      );
    });
  });

  it("should not allow requests from an unauthorized origin", async () => {
    jest.resetModules(); // Reset module registry to ensure fresh imports
    process.env.CORS_ORIGIN = "http://custom-origin.com"; // Set a specific CORS origin
    await jest.isolateModules(async () => {
      const { app } = require("../../app"); // Re-import app after setting environment variable

      const response = await request(app)
        .get("/me")
        .set("Origin", "http://unauthorized-origin.com");

      expect(response.status).toBe(401); // Unauthorized since no token is provided
      expect(response.headers["access-control-allow-origin"]).not.toBe(
        "http://unauthorized-origin.com"
      );
    });
  });
});
