# ✈️ Fly Genie API

A professional, scalable RESTful API built with **Node.js**, **Express**, and **MongoDB** to manage flight schedules and travel operations.

## 🌟 What's New? (Recent Updates)
- **MVC Architecture**: Reorganized the project into Models, Routes, and Controllers for better maintainability.
- **Advanced Search**: Added a flexible search engine to find flights by destination using Regex.
- **Data Validation**: Implemented strict Mongoose schemas with automatic timestamps.

## 🚀 Features
- **Create Flights**: Add new flight details with unique flight numbers.
- **View All Flights**: Fetch a complete list of available flights from the cloud.
- **Smart Search**: Filter flights by destination (case-insensitive).
- **Cloud Integration**: Fully connected with **MongoDB Atlas**.
- **Environment Safety**: Secure credential management using `.env`.

## 🏗️ Project Structure (MVC)
```text
FLIGHTS-API/
├── models/         # Database Schemas (Mongoose)
├── controllers/    # Business Logic & Request Handling
├── routes/         # API Endpoints & Routing
├── config/         # Database Connection Settings
├── .env            # Environment Variables (Private)
└── app.js          # Entry Point
🛠️ Tech Stack
Backend: Node.js, Express.js

Database: MongoDB (Mongoose ODM)

Tools: Git, Postman, dotenv

🚦 API Endpoints
Method,Endpoint,Description
GET,/api/flights,Get all flights
POST,/api/flights/add,Add a new flight
GET,/api/flights/search?destination=X,Search for a flight

📥 Installation & Setup
1. Clone the repository:
git clone [https://github.com/mhlael12/flights-api.git](https://github.com/mhlael12/flights-api.git)
cd flights-api

2. Install dependencies:
npm install

3.Configure Environment Variables:
Create a .env file and add your MongoDB URI:
MONGO_URI=your_mongodb_connection_string
PORT=3000
4.Run the server:
node app.js
