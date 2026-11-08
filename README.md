Finance Data Portal

A full-stack personal and business finance management application built with React, TypeScript, Node.js, Express, and MongoDB. It helps users organize financial accounts, track income and expenses, manage budgets and savings goals, and review financial performance through dashboard summaries and reports.

Overview

Finance Data Portal is designed around workspaces, allowing users to keep financial information organized in separate personal or business environments.

The application uses a React frontend and a REST API powered by Express and MongoDB. Financial records are associated with their respective workspaces.

Features

Dashboard Summary

* View total income and expenses.
* Review net cash flow.
* View account balances.
* Understand financial activity by currency.

Accounts and Transactions

* Create and manage financial accounts.
* Record income and expense transactions manually.
* Organize transactions using categories.
* Keep financial records associated with the selected workspace.

Budgets and Savings Goals

* Create and manage budgets.
* Track savings goals and contributions.
* Monitor savings progress.
* Archive budgets and completed or inactive goals.

Charts and Financial Reports

* Review financial summaries for selected date ranges.
* Compare monthly income and expenses.
* View expense breakdowns by category.
* Filter reports by currency.

Multi-Currency Support

* Configure a workspace base currency.
* Store financial records in their original currency.
* Display reports separately for each currency.

Note: Currency conversion is not currently implemented. Amounts in different currencies are not combined into a single total.

Authentication and Workspaces

* User registration and login.
* Password hashing.
* Server-managed sessions stored in MongoDB.
* HTTP-only session cookies.
* Workspace-based access control.
* Support for personal and business workspace types.

Technology Stack

Layer	Technologies
Frontend	React 19, TypeScript
Styling	Tailwind CSS v4
Build Tool	Vite
Backend	Node.js, Express
Database	MongoDB, Mongoose
Validation	Zod
Authentication	bcrypt, express-session, connect-mongo
Security	Helmet, CORS, express-rate-limit
Icons and UI	Lucide React, Motion

Project Structure

Finance-Data-Portal/
├── src/
│   ├── components/
│   │   ├── AuthForm.tsx
│   │   ├── DashboardSummary.tsx
│   │   ├── BudgetManager.tsx
│   │   ├── SavingsGoalManager.tsx
│   │   └── FinancialReports.tsx
│   ├── lib/
│   │   ├── account-api.ts
│   │   ├── auth-api.ts
│   │   ├── budget-api.ts
│   │   ├── category-api.ts
│   │   ├── financial-report-api.ts
│   │   ├── savings-goal-api.ts
│   │   ├── transaction-api.ts
│   │   └── workspace-api.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── package.json
├── vite.config.ts
└── README.md

Getting Started

Prerequisites

* Node.js and npm
* MongoDB database (local installation or MongoDB Atlas)
* Git

1. Clone the repository

git clone https://github.com/TayeebTahirBuchh/Finance-Data-Portal.git
cd Finance-Data-Portal

2. Install frontend dependencies

npm install

3. Configure the backend

cd server
npm install

Create a .env file inside the server directory using .env.example as a reference.

Configure the following variables:

PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_long_random_secret_at_least_32_characters

Use your own MongoDB connection string and a secure session secret. Never commit your actual .env file or credentials.

4. Start the backend

From the server directory:

npm run dev

The API runs on:

http://localhost:4000

Health check:

http://localhost:4000/api/health

5. Start the frontend

Open a second terminal in the project root:

npx vite --host 0.0.0.0

The Vite development server normally runs at:

http://localhost:5173

Configure the frontend API URL according to the API base URL used by the frontend configuration.

Backend Scripts

Run these commands from the server directory.

Command	Description
npm run dev	Start the backend in development mode
npm run build	Compile the backend TypeScript
npm run typecheck	Run backend type checking
npm start	Start the compiled backend

API Overview

The backend exposes REST API routes under /api.

Route	Purpose
/api/health	API health check
/api/auth	Registration, login, logout and session
/api/workspaces	Workspace-related operations
/api/workspaces/:workspaceId/financial-reports	Workspace financial reports

Additional workspace routes handle accounts, transactions, categories, budgets, and savings goals.

Data Models

The backend uses MongoDB collections managed through Mongoose models, including:

* User
* Workspace
* Membership
* Account
* Transaction
* Category
* Budget
* SavingsGoal

Important Notes

* Transactions are entered manually.
* Different currencies are reported separately.
* Automatic bank synchronization and currency conversion are not included.
* A MongoDB connection and valid backend environment variables are required to run the API.

Author

Tayeeb Tahir Buchh

GitHub Profile



If you find this project useful, feel free to explore the repository and its implementation.
