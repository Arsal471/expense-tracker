# 💸 Budget Tracker

A personal budget tracker built with **React**, **Tailwind CSS** and **Firebase Authentication**.
Track money coming in and going out — each user logs in and sees only their own data.

## ✨ Features

- 🔐 Sign up / log in with **Email & Password** or **Google**, plus password reset
- 📧 **Email verification** — new email accounts must verify before using the app
- ➕➖ Track **income**, **expenses** and **savings** (add, edit in a modal, delete) with validation
- 🏦 **Savings** — move money into savings pots (General, Emergency Fund, Goal or your own) and withdraw it back
- 🤝 **Loans** — record money you borrowed or lent and every repayment; see who owes whom per person and filter the list by person
- 🏷️ Categories for expenses (Food, Travel, Bills…) and income sources (Salary, Freelance, Business…), plus **custom categories** under "Other"
- 📊 Summary cards: **total balance** (current + savings), **current balance**, **savings**, this month's income & expenses, and spending this week
- 🔍 Filter by type, category / person and month
- 📅 Monthly summary with income vs expense bars and net total — click a month to filter
- 📄 **PDF report** of the filtered entries — totals, breakdown by category / source / savings pot, loan balances per person and full table
- 🌙 Dark mode (remembered across visits)
- 📱 Responsive layout for mobile and desktop
- 📲 **Installable PWA** — add it to your phone's home screen; opens full-screen and works offline

## 🛠️ Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- Firebase Authentication
- React Router (protected routes)
- jsPDF + jspdf-autotable (PDF reports, loaded on demand)
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

Entries are currently stored in the browser's `localStorage`, separately for each user.
Planned next step: move storage to **Cloud Firestore** so data syncs across devices.

## 👤 Author

**Arsal Mustafa** — [GitHub](https://github.com/Arsal471) · [LinkedIn](https://www.linkedin.com/in/arsal-mustafa-a04903185)
