
import { useState } from "react";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Plus,
  CalendarDays,
  Sparkles,
} from "lucide-react";

import { motion } from "framer-motion";
import ExpenseForm from "../components/ExpenseForm";
import "./Dashboard.css";

function Dashboard() {
  const [showForm, setShowForm] = useState(false);
  const [expenses, setExpenses] = useState([]);

  const [categories] = useState([
    { name: "Food" },
    { name: "Transport" },
    { name: "Bills" },
    { name: "Shopping" },
    { name: "Entertainment" },
    { name: "Other" },
  ]);

  const handleAddExpense = (newExpense) => {
    setExpenses((previous) => [...previous, newExpense]);
  };

  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="welcome-text">WELCOME BACK 👋</p>
          <h1>Your Financial Overview</h1>
          <p className="header-subtitle">
            Track your spending and stay in control.
          </p>
        </div>

        <button className="date-button">
          <CalendarDays size={18} />
          November 2026
        </button>
      </header>

      <section className="summary-section">
        <motion.div
          className="summary-card main-card"
          whileHover={{ y: -8, rotateX: 3, rotateY: -3 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="card-top">
            <div>
              <span>Total Expenses</span>
              <h2>₹ {totalExpenses.toLocaleString("en-IN")}</h2>
            </div>
            <div className="card-icon">
              <Wallet size={23} />
            </div>
          </div>

          <div className="card-bottom">
            <span className="trend-positive">
              <TrendingDown size={15} />
              Updated
            </span>
            <span>All recorded expenses</span>
          </div>
        </motion.div>

        <motion.div className="summary-card" whileHover={{ y: -8 }}>
          <div className="card-top">
            <div>
              <span>Monthly Budget</span>
              <h2>₹ 20,000</h2>
            </div>
            <div className="card-icon purple">
              <TrendingUp size={23} />
            </div>
          </div>

          <div className="card-bottom">
            <span className="trend-positive">20,000</span>
            <span>Budget limit</span>
          </div>
        </motion.div>

        <motion.div className="summary-card" whileHover={{ y: -8 }}>
          <div className="card-top">
            <div>
              <span>Remaining Budget</span>
              <h2>
                ₹ {Math.max(0, 20000 - totalExpenses).toLocaleString("en-IN")}
              </h2>
            </div>
            <div className="card-icon green">
              <Sparkles size={23} />
            </div>
          </div>

          <div className="card-bottom">
            <span className="trend-positive">
              <ArrowUpRight size={15} />
              Available
            </span>
            <span>Out of ₹20,000</span>
          </div>
        </motion.div>
      </section>

      <section className="transactions-section">
        <div className="section-heading">
          <div>
            <h2>Recent Transactions</h2>
            <p>Your latest spending activity</p>
          </div>

          <button
            className="add-expense-button"
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>

        {sortedExpenses.length === 0 ? (
          <div className="empty-transactions">
            <div className="empty-icon">
              <Wallet size={30} />
            </div>
            <h3>No expenses yet</h3>
            <p>
              Your transactions will appear here once you
              start adding expenses.
            </p>
          </div>
        ) : (
          <div className="expense-list">
            {sortedExpenses.map((expense) => (
              <div className="expense-row" key={expense.id}>
                <div>
                  <h3>{expense.category}</h3>
                  <p>{expense.note || "No description"} · {expense.date}</p>
                </div>
                <strong>
                  ₹ {expense.amount.toLocaleString("en-IN")}
                </strong>
              </div>
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <ExpenseForm
          categories={categories}
          onAdd={handleAddExpense}
          onClose={() => setShowForm(false)}
        />
      )}
    </main>
  );
}

export default Dashboard;
