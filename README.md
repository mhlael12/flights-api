✈️ Fly Genie API
A professional, secure, and scalable RESTful API built with Node.js, Express, and MongoDB to manage flight schedules and user authentication.

🌟 What's New? (Recent Updates)
Advanced Authentication: Implemented JWT (JSON Web Tokens) for secure user login and session management.

Role-Based Access Control (RBAC): Distinct permissions for Admin (manage flights) and User (browse and search).

Security Features: Password hashing using Bcrypt and protected routes via custom Middleware.

Global Error Handling: Centralized error management for cleaner code and better debugging.

🚀 Key Features
User Management: Sign up and Login with secure password encryption.

Admin Dashboard: Full CRUD operations (Create, Read, Update, Delete) for authorized admins only.

Public Access: Any user can search and view flight details without needing an account.

Robust Validation: Schema-level validation and custom middleware for data integrity.


🚦 API Endpoints🔐
Method,Endpoint,Description
POST,/api/auth/register,Register a new user
POST,/api/auth/login,Login & get JWT Token
✈️ Flights
Method,Endpoint,Access,Description
GET,/api/flights,Public,Get all flights
GET,/api/flights/:id,Public,Get flight details
POST,/api/flights,Admin,Add a new flight
PUT,/api/flights/:id,Admin,Update flight info
DELETE,/api/flights/:id,Admin,Remove a flight
🛠️ Tech Stack
Backend: Node.js, Express.js

Security: JWT, Bcrypt.js

Database: MongoDB (Mongoose ODM)

Testing: Postman

📥 Installation & Setup
1.Clone the repository:

Bash
git clone https://github.com/mhlael12/flights-api.git
cd flights-api

2.Install dependencies:

Bash
npm install

3.Configure Environment Variables:
Create a .env file:

Code snippet
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
PORT=3000


4.Run the server:
Bash
npm start

🏗️ Project Structure (MVC)
FLIGHTS-API/
├── models/         # Database Schemas (User & Flight)
├── controllers/    # Business Logic & Auth Handling
├── routes/         # API Endpoints (Auth & Flights)
├── middleware/     # Auth (Protect/Authorize) & Error Handlers
├── utils/          # Helper classes (ErrorResponse)
├── config/         # Database Connection Settings
├── .env            # Environment Variables (Private)
└── app.js          # Entry Point