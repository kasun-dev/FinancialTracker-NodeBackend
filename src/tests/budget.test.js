const budgetController = require("../controllers/budgetController");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const User = require("../models/User"); // Assuming the User model exists.

jest.mock("../models/Budget");
jest.mock("../models/Transaction");
jest.mock("../models/User");

describe("Budget Controller Unit Tests", () => {
    let req, res;

    beforeEach(() => {
        // Mocking the request and response objects
        req = { 
            user: { id: "user123" },  // Mock the user id
            body: {},
            params: {},
            query: {}
        };
        res = { 
            status: jest.fn().mockReturnThis(), 
            json: jest.fn() 
        };

        // Mock the User.findOne method to return a mocked user
        User.findOne.mockResolvedValue({ id: "user123", username: "testuser" });
    });

    test("createBudget should create a new budget", async () => {
        req.body = { userId: "user123", category: "Food", limit: 500, month: 3, year: 2025 };

        // Mock the Budget.findOne method to simulate no existing budget
        Budget.findOne.mockResolvedValue(null);

        // Mock the save method for Budget
        Budget.prototype.save = jest.fn().mockResolvedValue(req.body);

        await budgetController.createBudget(req, res);

        // Ensure that findOne is called with correct parameters
        expect(Budget.findOne).toHaveBeenCalledWith({
            userId: "user123",  // Ensure the correct userId is passed
            category: "Food",
            month: 3,
            year: 2025
        });

        // Ensure the response status is 201
        expect(res.status).toHaveBeenCalledWith(201);

        // Ensure the response body matches the body passed for the new budget
        expect(res.json).toHaveBeenCalledWith(req.body);
    });

    test("createBudget should return error if budget exists", async () => {
        req.body = { category: "Food", limit: 500, month: 3, year: 2025 };

        // Mock the Budget.findOne method to simulate that the budget already exists
        Budget.findOne.mockResolvedValue(req.body);

        await budgetController.createBudget(req, res);

        // Ensure the response is 400 when the budget already exists
        expect(res.status).toHaveBeenCalledWith(400);

        // Ensure the error message is correct
        expect(res.json).toHaveBeenCalledWith({ message: "Budget for this category already exists for this month." });
    });

    test("getBudgets should return all budgets for user", async () => {
        const budgets = [{ category: "Food", limit: 500 }];
        Budget.find.mockResolvedValue(budgets);

        await budgetController.getBudgets(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(budgets);
    });

    test("getBudgetById should return a budget if found", async () => {
        const budget = { category: "Food", limit: 500 };
        req.params.id = "budget123";
        Budget.findOne.mockResolvedValue(budget);

        await budgetController.getBudgetById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(budget);
    });

    test("updateBudget should update and return budget", async () => {
        const updatedBudget = { category: "Food", limit: 600 };
        req.params.id = "budget123";
        req.body = updatedBudget;
        Budget.findOneAndUpdate.mockResolvedValue(updatedBudget);

        await budgetController.updateBudget(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedBudget);
    });

    test("deleteBudget should delete and return success message", async () => {
        req.params.id = "budget123";
        Budget.findOneAndDelete.mockResolvedValue({});

        await budgetController.deleteBudget(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Budget deleted successfully." });
    });
});
