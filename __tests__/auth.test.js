const request = require("supertest");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authRouter = require("../router/auth");
const pool = require("../config/database");

// Create Express app for testing
const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

// Mock the database pool
jest.mock("../config/database", () => ({
  query: jest.fn(),
}));

// Mock bcrypt
jest.mock("bcrypt");

// Mock jsonwebtoken
jest.mock("jsonwebtoken");

// Mock uuid
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-1234"),
}));

describe("Auth Router Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret-key";
  });

  describe("POST /api/auth/register", () => {
    const validRegisterPayload = {
      email: "test@example.com",
      password: "password123",
      fullName: "John Doe",
      role: 1,
      user_details: {
        age: 30,
        gender: "Male",
        height_cm: 175,
        weight_kg: 70,
        phone: "1234567890",
        address: "123 Test Street",
      },
    };

    test("should register a new user successfully", async () => {
      // Mock database responses
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // User doesn't exist
        .mockResolvedValueOnce({ rows: [{ id: "test-uuid-1234" }] }) // Insert user
        .mockResolvedValueOnce({ rows: [{ user_id: "test-uuid-1234" }] }); // Insert patient details

      // Mock bcrypt hash
      bcrypt.hash.mockResolvedValue("hashed-password");

      const response = await request(app)
        .post("/api/auth/register")
        .send(validRegisterPayload);

      expect(response.status).toBe(200);
      expect(response.body.rows).toEqual([{ user_id: "test-uuid-1234" }]);
      expect(pool.query).toHaveBeenCalledTimes(3);
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    });

    test("should return 400 if user already exists", async () => {
      // Mock user exists
      pool.query.mockResolvedValueOnce({ rows: [{ email: "test@example.com" }] });

      const response = await request(app)
        .post("/api/auth/register")
        .send(validRegisterPayload);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: "User already exists",
      });
    });

    test("should return 400 for missing required fields", async () => {
      const invalidPayload = {
        email: "test@example.com",
        // Missing password and other fields
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("POST /api/auth/login", () => {
    const validLoginPayload = {
      email: "test@example.com",
      password: "password123",
    };

    test("should login user successfully", async () => {
      const mockUser = {
        id: "user-id-123",
        email: "test@example.com",
        password: "hashed-password",
        role: 1,
      };

      // Mock database response
      pool.query.mockResolvedValueOnce({ rows: [{ ...mockUser }] });

      // Mock bcrypt compare
      bcrypt.compare.mockResolvedValue(true);

      // Mock jwt sign
      jwt.sign.mockReturnValue("mock-jwt-token");

      const response = await request(app)
        .post("/api/auth/login")
        .send(validLoginPayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.data.token).toBe("mock-jwt-token");
      expect(response.body.data.user.password).toBeUndefined();
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        "test-secret-key",
        { expiresIn: "7d" }
      );
    });

    test("should return 401 for non-existent user", async () => {
      // Mock no user found
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post("/api/auth/login")
        .send(validLoginPayload);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Invalid credentials",
      });
    });

    test("should return 401 for incorrect password", async () => {
      const mockUser = {
        id: "user-id-123",
        email: "test@example.com",
        password: "hashed-password",
        role: 1,
      };

      // Mock database response
      pool.query.mockResolvedValueOnce({ rows: [mockUser] });

      // Mock bcrypt compare (password doesn't match)
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post("/api/auth/login")
        .send(validLoginPayload);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Invalid credentials",
      });
    });

    test("should return 400 for missing email", async () => {
      const invalidPayload = {
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
    });

    test("should return 400 for missing password", async () => {
      const invalidPayload = {
        email: "test@example.com",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
    });

    test("should return 400 for invalid email format", async () => {
      const invalidPayload = {
        email: "invalid-email",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should return 500 on database error", async () => {
      pool.query.mockRejectedValueOnce(new Error("Database connection failed"));

      const response = await request(app)
        .post("/api/auth/login")
        .send(validLoginPayload);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: "Server error during login",
      });
    });
  });
});

