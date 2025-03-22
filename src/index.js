const app = require("./server");  
const dotenv = require("dotenv"); 

// Define a route handler for the root path
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));