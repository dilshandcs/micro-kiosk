const jwt = require("jsonwebtoken");
const authMiddleware = require("../../middleware/auth"); // Assuming authMiddleware is exported from app.js

describe("authMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if authorization header is missing", () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Authorization header missing or malformed",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if authorization header is malformed", () => {
    req.headers.authorization = "InvalidToken";

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Authorization header missing or malformed",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token is invalid", () => {
    req.headers.authorization = "Bearer invalidToken";
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("Invalid token");
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next and attach user to req if token is valid", () => {
    const mockPayload = { mobile: "1234567890", is_verified: true };
    req.headers.authorization = "Bearer validToken";
    jest.spyOn(jwt, "verify").mockReturnValue(mockPayload);

    authMiddleware(req, res, next);

    expect(req.user).toEqual(mockPayload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
