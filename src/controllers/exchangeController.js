const express = require("express");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 5000;

// Replace with your API key from ExchangeRate-API or any other provider
const API_KEY = "0cc4d9306aad0d84f58567a3";
const BASE_URL = "https://v6.exchangerate-api.com/v6";

// Helper function to fetch exchange rates
const fetchExchangeRate = async (baseCurrency, targetCurrency) => {
    try {
        const response = await axios.get(`${BASE_URL}/${API_KEY}/latest/LKR`);
        const rates = response.data.conversion_rates;

        if (!rates[targetCurrency]) {
            throw new Error(`Exchange rate not found for ${targetCurrency}`);
        }

        return rates[targetCurrency];
    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        throw new Error("Could not fetch exchange rates");
    }
};

// API endpoint to get exchange rate between two currencies
app.get("/api/exchange-rate", async (req, res) => {
    const { base, target } = req.query;

    if (!base || !target) {
        return res.status(400).json({ error: "Base and target currencies are required" });
    }

    try {
        const rate = await fetchExchangeRate(base, target);
        res.json({ base, target, rate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
