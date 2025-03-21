const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
require("dotenv").config();

let userToken, transactionId;

beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await connectDB();

    // Register and login a test user
    await request(app).post("/api/users/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "user"
    });

    const loginRes = await request(app).post("/api/users/login").send({
        email: "test@example.com",
        password: "password123"
    });

    userToken = loginRes.body.token;
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe("Transaction API", () => {
    test("Create a new transaction", async () => {
        const res = await request(app)
            .post("/api/transactions")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                amount: 500,
                type: "income",
                category: "Salary",
                date: "2025-03-11T00:00:00Z",
                notes: "March Salary"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("_id");
        expect(res.body).toHaveProperty("amount", 500);
        expect(res.body).toHaveProperty("type", "income");
        transactionId = res.body._id;
    });

    test("Get all transactions", async () => {
        const res = await request(app)
            .get("/api/transactions")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0); // Ensure there's at least one transaction
    });

    test("Get a specific transaction by ID", async () => {
        const res = await request(app)
            .get(`/api/transactions/${transactionId}`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("_id", transactionId);
        expect(res.body).toHaveProperty("amount", 500); // Check the previous value
    });

    test("Update a transaction", async () => {
        const res = await request(app)
            .put(`/api/transactions/${transactionId}`)
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                amount: 600,
                type: "income",
                category: "Bonus",
                date: "2025-03-12T00:00:00Z",
                notes: "Annual Bonus"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("amount", 600);
        expect(res.body).toHaveProperty("category", "Bonus");
    });

    test("Delete a transaction", async () => {
        const res = await request(app)
            .delete(`/api/transactions/${transactionId}`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Transaction deleted successfully");

        // Ensure the transaction is deleted by attempting to retrieve it
        const fetchRes = await request(app)
            .get(`/api/transactions/${transactionId}`)
            .set("Authorization", `Bearer ${userToken}`);
        
        expect(fetchRes.statusCode).toBe(404); // Transaction should not be found
    });

    test("Create transaction without authorization", async () => {
        const res = await request(app)
            .post("/api/transactions")
            .send({
                amount: 500,
                type: "income",
                category: "Salary",
                date: "2025-03-11T00:00:00Z",
                notes: "March Salary"
            });

        expect(res.statusCode).toBe(401); // Unauthorized response
        expect(res.body).toHaveProperty("message", "No token, authorization denied");
    });

    test("Create transaction with missing required fields", async () => {
        const res = await request(app)
            .post("/api/transactions")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                amount: 500, // Missing type, category, and date
            });

        expect(res.statusCode).toBe(400); // Bad request
        expect(res.body).toHaveProperty("message", "All required fields must be filled");
    });
});
