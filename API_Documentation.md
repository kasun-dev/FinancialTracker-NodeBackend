# Personal Finance Tracker System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Register User
**Endpoint:** `POST /users/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
```json
{
  "name": "Johny Doe",
  "email": "johny@example.com",
  "password": "password123",
    "role": "admin"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here"
}
```

### Login User
**Endpoint:** `POST /users/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here"
}
```

## User Profile

### Get User Profile (Protected)
**Endpoint:** `GET /users/profile`

**Headers:**
```json
{
  "Authorization": "Bearer jwt_token_here"
}
```

**Response:**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com"
}
```

## Transactions

### Create Transaction
**Endpoint:** `POST /transactions`

**Headers:**
```json
{
  "Authorization": "Bearer jwt_token_here"
}
```

**Request Body:**
```json
{
  "type": "expense",
  "amount": 50.00,
  "category": "Food",
  "date": "2025-03-11"
}
```

**Response:**
```json
{
  "message": "Transaction added successfully",
  "transaction": { "id": "txn_id", "type": "expense", "amount": 50.00 }
}
```

### Get Transactions
**Endpoint:** `GET /transactions`

**Headers:**
```json
{
  "Authorization": "Bearer jwt_token_here"
}
```

**Response:**
```json
[
  {
    "id": "txn_id",
    "type": "expense",
    "amount": 50.00,
    "category": "Food",
    "date": "2025-03-11"
  }
]
```

### Update Transaction
**Endpoint:** `PUT /transactions/:id`

**Request Body:**
```json
{
  "amount": 60.00
}
```

**Response:**
```json
{
  "message": "Transaction updated successfully"
}
```

### Delete Transaction
**Endpoint:** `DELETE /transactions/:id`

**Response:**
```json
{
  "message": "Transaction deleted successfully"
}
```

## Budget Management

### Set Monthly Budget
**Endpoint:** `POST /budget`

**Request Body:**
```json
{
  "month": "March",
  "year": 2025,
  "amount": 1000.00
}
```

**Response:**
```json
{
  "message": "Budget set successfully"
}
```

### Get Monthly Budget
**Endpoint:** `GET /budget/:month/:year`

**Response:**
```json
{
  "month": "March",
  "year": 2025,
  "amount": 1000.00
}
```

## Reports

### Get Expense Report
**Endpoint:** `GET /reports/expenses`

**Response:**
```json
{
  "total_expense": 500.00,
  "categories": {
    "Food": 200.00,
    "Transport": 100.00,
    "Entertainment": 200.00
  }
}
```

## Notifications

### Get Notifications
**Endpoint:** `GET /notify`

**Response:**
```json
[
  {
    "id": "notif_id",
    "message": "You have a new transaction",
    "date": "2025-03-11"
  }
]
```

## Goals

### Create Financial Goal
**Endpoint:** `POST /goals`

**Request Body:**
```json
{
  "goal": "Save for a vacation",
  "target_amount": 5000.00,
  "deadline": "2025-12-31"
}
```

**Response:**
```json
{
  "message": "Goal created successfully",
  "goal": { "id": "goal_id", "goal": "Save for a vacation", "target_amount": 5000.00 }
}
```

### Get Financial Goals
**Endpoint:** `GET /goals`

**Response:**
```json
[
  {
    "id": "goal_id",
    "goal": "Save for a vacation",
    "target_amount": 5000.00,
    "deadline": "2025-12-31"
  }
]
```

---
This documentation provides details on all available APIs in the **Personal Finance Tracker System**.

