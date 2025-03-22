const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Report = require("../models/Report");
const Transaction = require("../models/Transaction"); 

// Import the generateReport function from the correct controller
const { generateReport } = require("../controllers/reportController"); 

// Mocking the Report and Transaction models
jest.mock("../models/Report");
jest.mock("../models/Transaction");

let userToken;

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

describe("Report Generation Logic Tests", () => {

    test("should calculate totalIncome, totalExpense, and categoryBreakdown correctly", async () => {
        const reportData = {
            type: "monthly",
            startDate: "2025-03-01",
            endDate: "2025-03-31",
            categories: ["Food", "Transport"]
        };

        const transactions = [
            { amount: 500, type: "income", category: "Food" },
            { amount: 300, type: "expense", category: "Transport" },
            { amount: 200, type: "income", category: "Food" },
            { amount: 150, type: "expense", category: "Food" },
        ];

        // Mock the transaction data
        Transaction.find.mockResolvedValue(transactions);

        // Mock the Report creation
        Report.create.mockResolvedValue({
            userId: "user123",
            type: "monthly",
            startDate: "2025-03-01",
            endDate: "2025-03-31",
            categories: ["Food", "Transport"],
            data: {
                totalIncome: 700,  // (500 + 200)
                totalExpense: 450, // (300 + 150)
                netBalance: 250,   // 700 - 450
                categoryBreakdown: { Food: 850, Transport: 300 } // Adjusted for correct breakdown
            }
        });

        // Mocking req and res
        const req = {
            body: reportData,
            user: { id: "user123" },
        };

        const res = {
            status: jest.fn().mockReturnThis(),  // Mocking status function
            json: jest.fn()  // Mocking json function
        };

        // Call the function
        await generateReport(req, res);

        // Calculate the expected values based on the transactions
        const totalIncome = transactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

        const categoryBreakdown = transactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});

        // Verify the calculations
        expect(totalIncome).toBe(700);
        expect(totalExpense).toBe(450);
        expect(categoryBreakdown).toEqual({ Food: 850, Transport: 300 });

        // Check the mock response's status and body
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            userId: "user123",
            type: "monthly",
            startDate: "2025-03-01",
            endDate: "2025-03-31",
            categories: ["Food", "Transport"],
            data: {
                totalIncome: 700,
                totalExpense: 450,
                netBalance: 250,
                categoryBreakdown: { Food: 850, Transport: 300 },
            }
        });
    });

});
