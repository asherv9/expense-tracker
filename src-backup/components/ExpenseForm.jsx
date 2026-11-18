import "./ExpenseForm.css";
import { useState } from "react";
import { X } from "lucide-react";
import {
  createExpense,
  validateExpense,
} from "../utils/expenseUtils";

function ExpenseForm({ categories, onAdd, onClose }) {
  const today = new Date().toLocaleDateString("en-CA");

  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    date: today,
    note: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationError = validateExpense(formData);

    if (validationError) {
      setError(validationError);
      return;
    }

    const newExpense = createExpense(formData);

    onAdd(newExpense);
    onClose();
  };

  return (
    <div className="form-overlay">
      <div className="expense-form">
        <div className="form-header">
          <div>
            <h2>Add Expense</h2>
            <p>Enter your spending details below.</p>
          </div>

          <button
            type="button"
            className="close-button"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Amount (₹)</label>
          <input
            type="number"
            name="amount"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            step="0.01"
          />

          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select category</option>

            {categories.map((category) => (
              <option key={category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />

          <label>Note (Optional)</label>
          <textarea
            name="note"
            placeholder="What was this expense for?"
            value={formData.note}
            onChange={handleChange}
            maxLength={120}
            rows={3}
          />

          <div className="character-count">
            {formData.note.length}/120 characters
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="submit-expense-button">
            Save Expense
          </button>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm;
