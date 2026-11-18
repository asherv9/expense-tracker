
// Generate a unique ID for each expense
export const generateId = () => {
  return crypto.randomUUID();
};

// Create a new expense
export const createExpense = ({
  amount,
  category,
  date,
  note = "",
}) => {
  return {
    id: generateId(),
    amount: Number(amount),
    category,
    date,
    note: note.trim(),
  };
};

// Validate expense details
export const validateExpense = ({
  amount,
  category,
  note,
}) => {
  if (!amount || Number(amount) <= 0) {
    return "Amount must be greater than zero.";
  }

  if (!category) {
    return "Please select a category.";
  }

  if (note && note.length > 120) {
    return "Note cannot exceed 120 characters.";
  }

  return null;
};
