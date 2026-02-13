# SmartStock 

This repository contains the source code for the "Project Java and Web Development" course (DLBCSPJWD01).

📋 Description
SmartStock is a web application designed to manage inventory and user authentication. This submission demonstrates the functional implementation of the backend API, database connection, and frontend integration.

🛠 Technology Stack
* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (via Mongoose)
* **Security:** Bcrypt (Password Hashing) & JSON Web Tokens (JWT)

⚙️ Installation Instructions

To set up the project locally, follow these steps:

1. Clone the Repository
Open your terminal and run:
```bash
git clone [https://github.com/saifmarouani/SmartStock.git](https://github.com/saifmarouani/SmartStock.git)
2. Navigate to the Project Directory
cd SmartStock
3. Install Dependencies
Install all necessary libraries (Express, Mongoose, etc.) defined in package.json:
npm install
4. Configure Environment Variables
Create a file named .env in the root directory of the project. Add the following configuration:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret_key
🚀 How to Run
1. Start the Server:
npm start
2. Access the Application:
Open your web browser and navigate to:
http://localhost:5000
