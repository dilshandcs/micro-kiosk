// server.test.js

jest.mock("../../app", () => ({
  app: {
    listen: jest.fn((port, callback) => callback()), // mock listen to immediately invoke the callback
  },
}));

describe("Server bootstrap", () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv };
    jest.clearAllMocks();
    jest.resetModules(); // critical: clears the module cache
  });

  afterEach(() => {
    process.env = originalEnv; // restore after each test
  });

  it("should listen on port from process.env.PORT", () => {
    process.env.PORT = "4000";
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    require("../../server"); // Import after mocking and setting env
    const { app } = require("../../app");

    expect(app.listen).toHaveBeenCalledWith("4000", expect.any(Function));
    expect(consoleSpy).toHaveBeenCalledWith(
      "🚀 Server listening on http://localhost:4000"
    );
    consoleSpy.mockRestore();
  });

  it("should listen on default port 3000 if process.env.PORT is not set", () => {
    delete process.env.PORT;
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    require("../../server");
    const { app } = require("../../app");

    expect(app.listen).toHaveBeenCalledWith(3000, expect.any(Function));
    expect(consoleSpy).toHaveBeenCalledWith(
      "🚀 Server listening on http://localhost:3000"
    );
    consoleSpy.mockRestore();
  });
});
