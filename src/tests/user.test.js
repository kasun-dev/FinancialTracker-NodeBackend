const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
require("dotenv").config();

beforeAll(async () => {
    process.env.NODE_ENV = "test";  // Set test environment
    await connectDB(); // Use existing connection logic
});

afterAll(async () => {
    await mongoose.connection.dropDatabase(); // Clean up test data
    await mongoose.connection.close(); // Close connection
});

beforeEach(async () => {
    // Optionally clear collections or set initial test data for each test
});

describe("User Authentication API", () => {
    let userToken, adminToken, userId;

    // ** Normal User Tests **

    test("Register a new user", async () => {
        const res = await request(app)
            .post("/api/users/register")
            .send({
                username: "testuser0001",
                email: "test0001@example.com",
                password: "password123"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "User registered successfully");
    });

    test("Login as a normal user", async () => {
        const res = await request(app)
            .post("/api/users/login")
            .send({
                email: "test0001@example.com",
                password: "password123"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");

        userToken = res.body.token;
        userId = res.body.user.id; // Store user ID for deletion tests
    });

    test("Get user profile (Protected Route)", async () => {
        const res = await request(app)
            .get("/api/users/profile")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("username", "testuser0001");
    });

    test("Login with invalid credentials", async () => {
        const res = await request(app)
            .post("/api/users/login")
            .send({
                email: "nonexistent@example.com",
                password: "wrongpassword"
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("message", "Invalid credentials");
    });

    test("Register with missing fields", async () => {
        const res = await request(app)
            .post("/api/users/register")
            .send({
                username: "testuser"  // Missing email, password, role
            });

        expect(res.statusCode).toBe(500);
    });

    // ** Admin User Tests **

    test("Register an admin user", async () => {
        const res = await request(app)
            .post("/api/users/register")
            .send({
                username: "adminuser",
                email: "admin@example.com",
                password: "adminpass",
                role: "admin"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "User registered successfully");
    });

    test("Login as an admin user", async () => {
        const res = await request(app)
            .post("/api/users/login")
            .send({
                email: "admin@example.com",
                password: "adminpass"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");

        adminToken = res.body.token;
    });

    test("Get all users (Admin Only)", async () => {
        const res = await request(app)
            .get("/api/users")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("Update user role (Admin Only)", async () => {
        const res = await request(app)
            .put(`/api/users/role/${userId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ role: "admin" });

        expect(res.statusCode).toBe(200);
        expect(res.body.user).toHaveProperty("role", "admin");
    });

    test("Delete user (Admin Only)", async () => {
        const res = await request(app)
            .delete(`/api/users/${userId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "User deleted successfully");
    });

    // ** Access Control Tests **

    test("Unauthorized user cannot access admin routes", async () => {
        const res = await request(app)
            .get("/api/users")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
    });
});
