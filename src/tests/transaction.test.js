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
    // Create user and admin for testing purposes
    const userResponse = await request(app)
        .post("/api/auth/register")  // Assuming a registration route exists
        .send({
            email: "user@test.com",
            password: "userpassword"
        });
    userToken = userResponse.body.token; // Capture user token for use in tests

    const adminResponse = await request(app)
        .post("/api/auth/register")
        .send({
            email: "admin@test.com",
            password: "adminpassword"
        });
    adminToken = adminResponse.body.token; // Capture admin token for admin tests
});

describe("Transaction API", () => {
    let userToken, adminToken, transactionId;

    // ** Normal User Transaction Tests **

    test("Create a new transaction", async () => {
        const res = await request(app)
            .post("/api/transactions")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                userId: "userIdPlaceholder",  // Assuming this is the ID of a registered user
                amount: 500,
                type: "income",
                category: "salary",
                currency: "LKR",
                tags: ["work", "salary"],
                recurrence: "monthly",
                date: new Date().toISOString(),
                notes: "Monthly salary"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "Transaction created successfully");
        expect(res.body.transaction).toHaveProperty("amount", 500);
        expect(res.body.transaction).toHaveProperty("type", "income");
        expect(res.body.transaction).toHaveProperty("category", "salary");
        expect(res.body.transaction).toHaveProperty("currency", "LKR");
        expect(res.body.transaction).toHaveProperty("tags");
        expect(res.body.transaction).toHaveProperty("recurrence", "monthly");
        expect(res.body.transaction).toHaveProperty("notes", "Monthly salary");
        transactionId = res.body.transaction._id; // Store the transaction ID for subsequent tests
    });

    test("Get a transaction by ID", async () => {
        const res = await request(app)
            .get(`/api/transactions/${transactionId}`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("amount", 500);
        expect(res.body).toHaveProperty("type", "income");
        expect(res.body).toHaveProperty("category", "salary");
        expect(res.body).toHaveProperty("currency", "LKR");
        expect(res.body).toHaveProperty("tags");
        expect(res.body).toHaveProperty("recurrence", "monthly");
        expect(res.body).toHaveProperty("notes", "Monthly salary");
    });

    test("Update a transaction", async () => {
        const res = await request(app)
            .put(`/api/transactions/${transactionId}`)
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                amount: 800,
                type: "expense",
                category: "food",
                currency: "LKR",
                tags: ["groceries", "food"],
                recurrence: "weekly",
                date: new Date().toISOString(),
                notes: "Weekly grocery shopping"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.transaction).toHaveProperty("amount", 800);
        expect(res.body.transaction).toHaveProperty("type", "expense");
        expect(res.body.transaction).toHaveProperty("category", "food");
        expect(res.body.transaction).toHaveProperty("currency", "LKR");
        expect(res.body.transaction).toHaveProperty("tags");
        expect(res.body.transaction).toHaveProperty("recurrence", "weekly");
        expect(res.body.transaction).toHaveProperty("notes", "Weekly grocery shopping");
    });

    test("Delete a transaction", async () => {
        const res = await request(app)
            .delete(`/api/transactions/${transactionId}`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Transaction deleted successfully");
    });

    // ** Invalid Transaction Tests **

    test("Create a transaction with missing required fields", async () => {
        const res = await request(app)
            .post("/api/transactions")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                userId: "userIdPlaceholder",  // Missing amount, type, category
            });

        expect(res.statusCode).toBe(400);  // Assuming validation returns 400
        expect(res.body).toHaveProperty("message", "Amount, type, and category are required");
    });

    test("Get a transaction that doesn't exist", async () => {
        const res = await request(app)
            .get("/api/transactions/invalidID")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty("message", "Transaction not found");
    });

    test("Update a transaction that doesn't belong to the user", async () => {
        const res = await request(app)
            .put("/api/transactions/12345") // Assuming transaction ID is '12345'
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                amount: 800,
                type: "expense",
                category: "food",
                currency: "LKR",
                tags: ["groceries", "food"],
                recurrence: "weekly",
                date: new Date().toISOString(),
                notes: "Weekly grocery shopping"
            });

        expect(res.statusCode).toBe(401);  // Forbidden if user doesn't own the transaction
        expect(res.body).toHaveProperty("message", "Invalid Token");
    });

    test("Delete a transaction that doesn't belong to the user", async () => {
        const res = await request(app)
            .delete("/api/transactions/12345") // Assuming transaction ID is '12345'
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(401);  // Forbidden if user doesn't own the transaction
        expect(res.body).toHaveProperty("message", "Invalid Token");
    });

    // ** Admin User Transaction Tests **

    test("Create a transaction as admin", async () => {
        const res = await request(app)
            .post("/api/transactions")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                userId: "userIdPlaceholder",  // Assuming this is the ID of a registered user
                amount: 1000,
                type: "income",
                category: "salary",
                currency: "LKR",
                tags: ["work", "salary"],
                recurrence: "monthly",
                date: new Date().toISOString(),
                notes: "Admin created transaction"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "Transaction created successfully");
    });

    test("Get all transactions (Admin Only)", async () => {
        const res = await request(app)
            .get("/api/transactions")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // ** Access Control Tests **

    test("Unauthorized user cannot create a transaction", async () => {
        const res = await request(app)
            .post("/api/transactions")
            .send({
                amount: 500,
                type: "income",
                category: "salary",
                currency: "LKR",
                tags: ["work", "salary"],
                recurrence: "monthly",
                date: new Date().toISOString(),
                notes: "Unauthorized Transaction"
            });

        expect(res.statusCode).toBe(401);  // Forbidden for unauthorized users
    });

    test("Unauthorized user cannot access transaction routes", async () => {
        const res = await request(app)
            .get("/api/transactions")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(401);  // Forbidden for unauthorized users
    });
});
