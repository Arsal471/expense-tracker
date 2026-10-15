# 💸 Expense Tracker

A personal expense tracker built with **React**, **Tailwind CSS** and **Firebase Authentication**.
Each user logs in and sees only their own expenses.

## ✨ Features

- 🔐 Sign up / log in with **Email & Password** or **Google**, plus password reset
- ➕ Add, ✏️ edit (modal form) and 🗑️ delete expenses with validation
- 🏷️ Categories (Food, Travel, Bills, Shopping, Health, Education, Other)
- 🔍 Filter by category and month
- 📅 Monthly summary with totals — click a month to filter the list
- 📊 Summary cards: total spent, this month, largest expense
- 🌙 Dark mode (remembered across visits)
- 📱 Responsive layout for mobile and desktop

## 🛠️ Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- Firebase Authentication
- React Router (protected routes)
- Hooks used: `useReducer`, `useMemo`, `useCallback`, `useContext`, `useRef`, `useEffect`, `React.memo`

## 🚀 Run Locally

```bash
git clone https://github.com/Arsal471/expense-tracker.git
cd expense-tracker
npm install
```

Create a `.env` file in the project root (see `.env.example`) and add your Firebase web app config:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

In the Firebase console, enable **Email/Password** and **Google** under *Authentication → Sign-in method*. Then:

```bash
npm run dev
```

## 📌 Notes

Expenses are currently stored in the browser's `localStorage`, separately for each user.
Planned next step: move storage to **Cloud Firestore** so data syncs across devices.

## 👤 Author

**Arsal Mustafa** — [GitHub](https://github.com/Arsal471) · [LinkedIn](https://www.linkedin.com/in/arsal-mustafa-a04903185)
