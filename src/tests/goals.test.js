const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server"); 
const connectDB = require("../config/db");
const Goal = require("../models/Goals");
const User = require("../models/User");

let userToken;
let goalId;

beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await connectDB();

    // Clear existing users and goals
    await User.deleteMany();
    await Goal.deleteMany();

    // Create a test user
    const userRes = await request(app).post("/api/users/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123"
    });

    expect(userRes.statusCode).toBe(201);

    // Login to get token
    const loginRes = await request(app).post("/api/users/login").send({
        email: "test@example.com",
        password: "password123"
    });

    expect(loginRes.statusCode).toBe(200);
    userToken = loginRes.body.token;
});

describe("Financial Goals API", () => {
    test("Create a new goal", async () => {
        const res = await request(app)
            .post("/api/goals")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                goalName: "Buy a car",
                targetAmount: 10000,
                deadline: "2025-12-31",
                autoAllocate: true
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("goalName", "Buy a car");
        goalId = res.body._id;
    });

    test("Get all goals for the user", async () => {
        const res = await request(app)
            .get("/api/goals")
            .set("Authorization", `Bearer ${userToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test("Get a specific goal", async () => {
        const res = await request(app)
            .get(`/api/goals/${goalId}`)
            .set("Authorization", `Bearer ${userToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("_id", goalId);
    });

    test("Update a goal", async () => {
        const res = await request(app)
            .put(`/api/goals/${goalId}`)
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                goalName: "Buy a bike",
                targetAmount: 5000
            });
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("goalName", "Buy a bike");
    });

    test("Delete a goal", async () => {
        const res = await request(app)
            .delete(`/api/goals/${goalId}`)
            .set("Authorization", `Bearer ${userToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Goal deleted successfully");
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});
