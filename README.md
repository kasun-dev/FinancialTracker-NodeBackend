# Personal Finance Tracker System - API Documentation

## Overview
The financial tracker product is a **Personal Finance Tracker System** designed to help users manage their financial records efficiently. It provides features such as expense and income tracking, budget management, financial reporting, and goal setting. Users can categorize transactions, set budgets, receive alerts for unusual spending, and track savings goals.

The system includes **role-based access**, where admins oversee all users and transactions, while regular users manage their personal finances. Built as a **secure RESTful API** using Express.js (Node.js) with MongoDB, it emphasizes **data security, authentication (JWT), and scalability**. Additional features include multi-currency management, recurring transactions, and financial notifications, making it a comprehensive solution for personal financial management.

## Base URL
```
http://localhost:5000/api
```

## Prerequisites
Make sure you have the following installed:
- Node.js (v14 or above)
- npm
- Any other dependencies required (e.g., database, message brokers, etc.)

## Installation
### Clone the repository:
```sh
git clone https://github.com/SE1020-IT2070-OOP-DSA-25/project-IT22347558.git
```

### Navigate to the project folder:
```sh
cd project-IT22347558/src
```

### Install the required dependencies:
```sh
npm install
```

### Set up environment variables:
Create a `.env` file in the root directory and add the following variables:
```sh
MONGO_URI=****
MONGO_URI_TEST=****
JWT_SECRET=****
PORT=****
```

### Start the application:
```sh
npm run dev
```
(This starts the application with automatic updates and restarts.)

## Running Tests
### Unit Tests & Integration Tests
Run the unit tests:
```sh
npm test
```
Test results will be displayed in the terminal.
Ensure any required services (e.g., database, message queue) are running, then run:


### Performance Tests
To run performance tests (e.g., load testing), use **Artillery**.

#### Install Artillery:
```sh
npm install -g artillery
```

#### Run performance tests:
```sh
artillery run performance-config.yml
```
Test results are stored in:
```
/project-IT22347558/src/tests/artillery.test.result.md
```

---

This documentation provides details on all available APIs in the **Personal Finance Tracker System**.

