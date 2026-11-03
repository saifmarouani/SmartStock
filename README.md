SmartStock

This repository contains the complete source code for the Project: Java and Web Development (DLBCSPJWD01) portfolio course at IU International University of Applied Sciences.

📋 Description
SmartStock is a full-stack web application designed to replace error-prone manual spreadsheets with real-time, multi-warehouse inventory tracking. This final submission demonstrates a responsive client-server architecture featuring dynamic JavaScript interactions, a RESTful Node.js/Express backend API, stateless authentication, and persistent cloud storage via MongoDB Atlas.

Key Features
User Authentication: Secure company account registration and login using bcrypt password hashing and JSON Web Tokens (JWT).

Multi-Warehouse Management: Create and manage multiple distinct warehouse locations (e.g., Berlin) with isolated stock tables.

Dynamic Product CRUD: Add, view, update, and delete inventory items asynchronously via the fetch() API without full page reloads.

Automated Calculations & Analytics: Automatically calculates total item values (Quantity × Unit Price), aggregates Global Inventory Value, and flags inactive items via the Dead Stock Detector (> 30 days of inactivity).

Responsive Design: Adapts across desktop and mobile viewports; on mobile screens, the desktop left sidebar automatically converts into a fixed bottom navigation bar.

🛠 Technology Stack
Frontend: HTML5, CSS3 (Flexbox, CSS Grid, Media Queries), Vanilla JavaScript (ES6+)

Backend: Node.js, Express.js

Database: MongoDB Atlas (via Mongoose ODM)

Security & Configuration: bcrypt / bcryptjs (Password Hashing), jsonwebtoken (JWT), dotenv

📂 Project Structure
config/db.js — MongoDB Atlas database connection setup

middleware/auth.js — JWT authentication and route protection middleware

models/ — Mongoose schemas for user.js, warehouse.js, and items.js

routes/ — Express REST API route handlers (auth.js and api.js)

public/ — Frontend assets (login.html, register.html, dashboard.html, style.css, and app.js)

servers.js — Main Express application entry point

⚙️ Installation Instructions
To set up and run the project locally, ensure you have Node.js (v18+ recommended) and npm installed, then follow these steps:

1. Clone the Repository
Open your terminal and run:
git clone https://github.com/saifmarouani/SmartStock.git

2. Navigate to the Project Directory
cd SmartStock

3. Install Dependencies
Install all required libraries defined in package.json:
npm install

4. Configure Environment Variables
Create a file named .env in the root directory of the project (or use the provided .env file in the submitted .zip archive) and add the following variables:
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret_key

(Note for Evaluation: Working database credentials are provided in the PebblePad submission text field / included .env file so the application can be executed immediately without registering for any third-party service).

🚀 How to Run
1. Start the Server
Run the start script:
npm start

(Alternatively, run node servers.js directly).

2. Access the Application
Open your web browser and navigate to:
http://localhost:3000/register.html
or
http://localhost:3000/login.html
