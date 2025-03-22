const request = require("supertest");
const app = require("../server"); 
const mongoose = require("mongoose");
const connectDB = require("../config/db");
require("dotenv").config();

beforeAll(async () => {
    process.env.NODE_ENV = "test";  // Set test environment
    await connectDB(); // Use the DB connection
});

afterAll(async () => {s
    await mongoose.connection.dropDatabase(); // Clean up test data
    await mongoose.connection.close(); // Close DB connection
});

beforeEach(async () => {
    // Optionally clear collections or set initial test data for each test
});

describe("Goal API", () => {
    let userToken, goalId;

    // ** Normal User Goal Tests **

    test("Create a new goal", async () => {
        const res = await request(app)
            .post("/api/goals")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                goalName: "Buy a Laptop",
                targetAmount: 100000,
                deadline: new Date().toISOString(),
                autoAllocate: true
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("goalName", "Buy a Laptop");
        expect(res.body).toHaveProperty("targetAmount", 100000);
        expect(res.body).toHaveProperty("autoAllocate", true);
        expect(res.body).toHaveProperty("userId");
        goalId = res.body._id; // Store the goal ID for further tests
    });

    test("Get all goals for the user", async () => {
        const res = await request(app)
            .get("/api/goals")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("Get a specific goal by ID", async () => {
        const res = await request(app)
            .get(`/api/goals/${goalId}`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("goalName", "Buy a Laptop");
        expect(res.body).toHaveProperty("targetAmount", 100000);
        expect(res.body).toHaveProperty("autoAllocate", true);
    });

    test("Update a goal", async () => {
        const res = await request(app)
            .put(`/api/goals/${goalId}`)
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                goalName: "Buy a Laptop - Updated",
                targetAmount: 120000,
                allocatedAmount: 50000,
                currentSavings: 20000,
                deadline: new Date().toISOString(),
                autoAllocate: false
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("goalName", "Buy a Laptop - Updated");
        expect(res.body).toHaveProperty("targetAmount", 120000);
        expect(res.body).toHaveProperty("allocatedAmount", 50000);
        expect(res.body).toHaveProperty("autoAllocate", false);
    });

    test("Delete a goal", async () => {
        const res = await request(app)
            .delete(`/api/goals/${goalId}`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Goal deleted successfully");
    });

    // ** Invalid Goal Tests **

    test("Create goal with missing required fields", async () => {
        const res = await request(app)
            .post("/api/goals")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                goalName: "Buy a Car",
                // Missing targetAmount, deadline, autoAllocate
            });

        expect(res.statusCode).toBe(401); // Assuming validation returns 400 for missing fields
        expect(res.body).toHaveProperty("message", "Invalid Token");
    });

    test("Get a goal that does not exist", async () => {
        const res = await request(app)
            .get("/api/goals/invalidGoalId")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("message", "Invalid Token");
    });

    test("Update goal that does not exist", async () => {
        const res = await request(app)
            .put("/api/goals/invalidGoalId")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                goalName: "Buy a Car",
                targetAmount: 500000,
                allocatedAmount: 200000,
                currentSavings: 100000,
                deadline: new Date().toISOString(),
                autoAllocate: false
            });

        expect(res.statusCode).toBe(401); // Goal not found
        expect(res.body).toHaveProperty("message", "Invalid Token");
    });

    test("Delete a goal that does not exist", async () => {
        const res = await request(app)
            .delete("/api/goals/invalidGoalId")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(401); // Goal not found
        expect(res.body).toHaveProperty("message", "Invalid Token");
    });

    // ** Access Control Tests **

    test("Unauthorized user cannot access goal routes", async () => {
        const res = await request(app)
            .get("/api/goals")
            .set("Authorization", "Bearer invalidToken");

        expect(res.statusCode).toBe(401); // Unauthorized
        expect(res.body).toHaveProperty("message", "Invalid Token");
    });

    test("Non-owner cannot update or delete goal", async () => {
        const res = await request(app)
            .put(`/api/goals/${goalId}`)
            .set("Authorization", `Bearer invalidUserToken`)
            .send({
                goalName: "Updated Goal Name",
                targetAmount: 150000,
                allocatedAmount: 70000,
                currentSavings: 40000,
                deadline: new Date().toISOString(),
                autoAllocate: true
            });

        expect(res.statusCode).toBe(401); // Forbidden
        expect(res.body).toHaveProperty("message", "Invalid Token");
    });
});
