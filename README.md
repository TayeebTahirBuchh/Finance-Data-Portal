Finance Data Portal

A secure, full-stack finance dashboard with role-based access control (RBAC), transaction management, and real-time financial summaries — built with React, TypeScript, and Express.



---

Features

- 🔐 **Role-Based Access Control** — Three permission levels: `ADMIN`, `ANALYST`, and `VIEWER`
- 📊 **Financial Dashboard** — Live summaries of income, expenses, net balance, and category breakdowns
- 💳 **Transaction Management** — Create, view, filter, and delete financial records
- 👥 **User Management** — Admin panel to manage users and their roles/statuses
- ⚡ **Real-time Data** — Instant UI updates after every change
- 🎨 **Animated UI** — Smooth transitions powered by Framer Motion
- 🤖 **Gemini AI Integration** — Google Gemini AI backend support for intelligent features

---
 Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 19, TypeScript, Tailwind CSS v4, Framer Motion |
| Backend    | Node.js, Express, TypeScript                    |
| Validation | Zod                                             |
| Build Tool | Vite                                            |
| AI         | Google Gemini AI (`@google/genai`)              |
| Icons      | Lucide React                                    |

---

Getting Started
 Prerequisites

- Node.js 18+
- A [Google AI Studio](https://aistudio.google.com/) API key for Gemini

 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/Finance-Data-Portal.git
cd Finance-Data-Portal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

 Running the App

```bash
# Start the development server (frontend + backend)
npm run dev
```

Open your browser at `http://localhost:3000`

 Build for Production

```bash
npm run build
npm run preview
```

---

 Authentication & Roles

The app uses a mock authentication system via the `X-User-ID` header. Three roles are available:

| Role       | Permissions                                                  |
|------------|--------------------------------------------------------------|
| `ADMIN`    | Full access: view/create/delete transactions, manage users   |
| `ANALYST`  | View transactions, view dashboard summary                    |
| `VIEWER`   | View transactions only                                       |

**Default users for testing:**

| User ID | Username  | Role     |
|---------|-----------|----------|
| `1`     | admin     | ADMIN    |
| `2`     | analyst   | ANALYST  |
| `3`     | viewer    | VIEWER   |

---

 API Endpoints

### Users
| Method | Endpoint         | Role Required | Description           |
|--------|-----------------|---------------|-----------------------|
| GET    | `/api/users`    | ADMIN         | List all users        |
| POST   | `/api/users`    | ADMIN         | Create a new user     |
| PATCH  | `/api/users/:id`| ADMIN         | Update a user         |

### Transactions
| Method | Endpoint               | Role Required | Description              |
|--------|------------------------|---------------|--------------------------|
| GET    | `/api/transactions`    | Any           | List/filter transactions |
| POST   | `/api/transactions`    | ADMIN         | Add a transaction        |
| DELETE | `/api/transactions/:id`| ADMIN         | Delete a transaction     |

### Dashboard
| Method | Endpoint       | Role Required       | Description            |
|--------|---------------|---------------------|------------------------|
| GET    | `/api/summary` | ADMIN, ANALYST      | Financial summary      |

 Transaction Filters (query params)
```
GET /api/transactions?type=INCOME&category=Salary&startDate=2024-01-01&endDate=2024-12-31
```

---

 Project Structure

```
Finance-Data-Portal/
├── src/
│   ├── App.tsx          # Main React app (UI, state, API calls)
│   ├── main.tsx         # React entry point
│   └── index.css        # Global styles
├── server.ts            # Express API server + Vite dev middleware
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies and scripts
└── .env.example         # Environment variable template
```

---

 Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key_here
APP_URL=http://localhost:3000
```

---

 Scripts

| Script        | Description                          |
|---------------|--------------------------------------|
| `npm run dev` | Start development server             |
| `npm run build` | Build for production               |
| `npm run preview` | Preview production build         |
| `npm run lint` | TypeScript type checking            |
| `npm run clean` | Remove build artifacts             |

---

  Language Breakdown

```
TypeScript + TSX   ████████████████████████████████  98.3%
HTML               ▌                                   1.6%
CSS                ░                                   0.1%
```

---

  License

This project is private. All rights reserved.

---

> Built with  using React, TypeScript, and Express

