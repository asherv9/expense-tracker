import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Receipt, Tags, ChartNoAxesCombined, Settings, Wallet,
  Plus, Trash2, Pencil, Download, Search, X, Menu, TrendingUp, CalendarDays,
  IndianRupee, CircleHelp, Check, AlertTriangle, UserRound, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import "./App.css";

const DEFAULT_CATEGORIES = [
  { id: "food", name: "Food", color: "#F59E0B" },
  { id: "transport", name: "Transport", color: "#3B82F6" },
  { id: "bills", name: "Bills", color: "#8B5CF6" },
  { id: "shopping", name: "Shopping", color: "#EC4899" },
  { id: "entertainment", name: "Entertainment", color: "#14B8A6" },
  { id: "other", name: "Other", color: "#64748B" },
];
const money = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(n || 0));
const today = () => new Date().toISOString().slice(0, 10);
const monthKey = (date) => date.slice(0, 7);
const monthLabel = (key) => new Date(`${key}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch { return initialValue; }
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      try { localStorage.setItem(key, JSON.stringify(value)); }
      catch (error) { console.error("Could not save", key, error); }
    }, 250);
    return () => clearTimeout(timer);
  }, [key, value]);
  return [value, setValue];
}

function App() {
  const [page, setPage] = useState("Dashboard");
  const [expenses, setExpenses] = useStoredState("spendly-expenses", []);
  const [categories, setCategories] = useStoredState("spendly-categories", DEFAULT_CATEGORIES);
  const [budget, setBudget] = useStoredState("spendly-budget", 20000);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState("");

  const sortedExpenses = useMemo(() => [...expenses].sort((a, b) => b.date.localeCompare(a.date)), [expenses]);
  const currentMonth = monthKey(today());
  const thisMonthExpenses = expenses.filter(e => monthKey(e.date) === currentMonth);
  const monthlyTotal = thisMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const previousDate = new Date();
  previousDate.setMonth(previousDate.getMonth() - 1);
  const previousMonth = monthKey(previousDate.toISOString().slice(0, 10));
  const previousTotal = expenses.filter(e => monthKey(e.date) === previousMonth).reduce((sum, e) => sum + Number(e.amount), 0);
  const monthChange = previousTotal === 0 ? (monthlyTotal > 0 ? 100 : 0) : ((monthlyTotal - previousTotal) / previousTotal) * 100;
  const remaining = Number(budget) - monthlyTotal;

  const saveExpense = (data) => {
    if (editingExpense) setExpenses(old => old.map(e => e.id === editingExpense.id ? { ...data, id: editingExpense.id } : e));
    else setExpenses(old => [...old, { ...data, id: makeId() }]);
    setShowForm(false); setEditingExpense(null);
  };
  const deleteExpense = (id) => {
    if (window.confirm("Delete this expense? This action cannot be undone.")) {
      setExpenses(old => old.filter(e => e.id !== id));
      setNotice("Expense deleted successfully.");
    }
  };
  const exportCsv = () => {
    const rows = [["id", "amount", "category", "date", "note"], ...sortedExpenses.map(e => [e.id, e.amount, e.category, e.date, e.note || ""])];
    const csv = rows.map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "spendly-expenses.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const nav = [
    ["Dashboard", LayoutDashboard], ["Transactions", Receipt], ["Categories", Tags],
    ["Analytics", ChartNoAxesCombined], ["Settings", Settings]
  ];

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Wallet size={23}/></div><div><b>Spendly</b><small>PERSONAL FINANCE</small></div></div>
      <div className="nav-caption">WORKSPACE</div>
      <nav>{nav.map(([label, Icon]) => <button key={label} className={`nav-link ${page === label ? "selected" : ""}`} onClick={() => { setPage(label); setMobileNav(false); }}><Icon size={18}/><span>{label}</span>{page === label && <span className="nav-dot"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="tip-card"><SparkleIcon/><b>Small steps add up.</b><span>Keep an eye on where your money goes.</span></div><div className="profile"><div className="avatar">A</div><div><b>My Account</b><small>Personal wallet</small></div><ChevronDown size={15}/></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(v => !v)}><Menu/></button><div className="crumb">Workspace <span>/</span> <b>{page}</b></div><div className="topbar-right"><span className="today-pill"><CalendarDays size={15}/>{new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span><div className="avatar small-avatar">A</div></div></header>
      <div className="page-content">
        {notice && <div className="notice"><Check size={16}/>{notice}<button onClick={() => setNotice("")}><X size={15}/></button></div>}
        {page === "Dashboard" && <Dashboard expenses={sortedExpenses} categories={categories} total={monthlyTotal} budget={Number(budget)} remaining={remaining} change={monthChange} onAdd={() => {setEditingExpense(null);setShowForm(true);}} onDelete={deleteExpense} onEdit={e => {setEditingExpense(e);setShowForm(true);}} onNavigate={setPage}/>}
        {page === "Transactions" && <Transactions expenses={sortedExpenses} categories={categories} onAdd={() => {setEditingExpense(null);setShowForm(true);}} onDelete={deleteExpense} onEdit={e => {setEditingExpense(e);setShowForm(true);}} onExport={exportCsv}/>}
        {page === "Categories" && <CategoryManager categories={categories} expenses={expenses} setCategories={setCategories} setNotice={setNotice}/>}
        {page === "Analytics" && <Analytics expenses={expenses} categories={categories}/>}
        {page === "Settings" && <SettingsPage budget={budget} setBudget={setBudget} onExport={exportCsv} expensesCount={expenses.length}/>}
      </div>
    </main>
    <AnimatePresence>{showForm && <ExpenseModal key="expense-modal" categories={categories} initial={editingExpense} onClose={() => {setShowForm(false);setEditingExpense(null);}} onSave={saveExpense}/>}</AnimatePresence>
  </div>;
}

function SparkleIcon() { return <span className="tip-spark">✦</span>; }

function PageTitle({ eyebrow, title, subtitle, action }) {
  return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}

function Dashboard({ expenses, categories, total, budget, remaining, change, onAdd, onDelete, onEdit, onNavigate }) {
  const latest = expenses.slice(0, 5);
  const pct = budget > 0 ? Math.min(100, total / budget * 100) : 0;
  return <>
    <PageTitle eyebrow="YOUR MONEY, IN FOCUS" title="Financial overview" subtitle="A clearer picture of your spending starts here." action={<button className="btn primary" onClick={onAdd}><Plus size={17}/> Add expense</button>}/>
    <section className="stat-grid">
      <StatCard label="Spent this month" value={money(total)} icon={Wallet} tone="violet" detail={`${change > 0 ? "+" : ""}${change.toFixed(1)}% vs last month`} />
      <StatCard label="Monthly budget" value={money(budget)} icon={TrendingUp} tone="blue" detail={`${pct.toFixed(0)}% of budget used`} />
      <StatCard label="Budget remaining" value={money(remaining)} icon={IndianRupee} tone={remaining < 0 ? "rose" : "mint"} detail={remaining < 0 ? "You are over budget" : "Available to spend"} />
    </section>
    <section className="budget-panel"><div className="budget-copy"><div><span className="muted-label">MONTHLY BUDGET TRACKER</span><h3>{money(total)} <small>of {money(budget)}</small></h3></div><span className="budget-percent">{pct.toFixed(0)}%</span></div><div className="progress-track"><div className={`progress-fill ${pct > 100 ? "over" : ""}`} style={{width:`${pct}%`}}/></div><div className="budget-foot"><span>{money(Math.max(0, remaining))} left this month</span><button className="text-button" onClick={() => onNavigate("Settings")}>Adjust budget <span>→</span></button></div></section>
    <section className="content-card"><div className="section-head"><div><h2>Recent transactions</h2><p>Your latest recorded expenses</p></div><button className="text-button" onClick={() => onNavigate("Transactions")}>View all <span>→</span></button></div>
      {latest.length === 0 ? <EmptyState onAdd={onAdd}/> : <div className="transaction-list">{latest.map(e => <TransactionRow key={e.id} expense={e} categories={categories} onDelete={onDelete} onEdit={onEdit}/>)}</div>}
    </section>
  </>;
}
function StatCard({label,value,icon:Icon,tone,detail}) { return <motion.div className="stat-card" whileHover={{y:-4}} transition={{type:"spring",stiffness:240}}><div className={`stat-icon ${tone}`}><Icon size={20}/></div><span>{label}</span><strong>{value}</strong><small>{detail}</small></motion.div>; }
function EmptyState({onAdd}) { return <div className="empty-state"><div className="empty-art"><Receipt size={28}/></div><h3>Your story starts with one expense</h3><p>Add your first transaction and Spendly will organise it for you.</p><button className="btn primary" onClick={onAdd}><Plus size={16}/> Add your first expense</button></div>; }

function TransactionRow({expense,categories,onDelete,onEdit}) {
  const category = categories.find(c => c.id === expense.categoryId) || categories.find(c => c.name === expense.category) || {name:expense.category || "Other",color:"#64748B"};
  return <div className="transaction-row"><div className="category-dot" style={{background:category.color}}/><div className="transaction-main"><b>{expense.note || category.name}</b><span>{category.name} · {new Date(`${expense.date}T00:00:00`).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span></div><strong className="transaction-amount">− {money(expense.amount)}</strong><div className="row-actions"><button aria-label="Edit expense" title="Edit" onClick={() => onEdit(expense)}><Pencil size={15}/></button><button aria-label="Delete expense" title="Delete" onClick={() => onDelete(expense.id)}><Trash2 size={15}/></button></div></div>;
}

function Transactions({expenses,categories,onAdd,onDelete,onEdit,onExport}) {
  const [query,setQuery] = useState("");
  const filtered = expenses.filter(e => `${e.note} ${e.date} ${e.category}`.toLowerCase().includes(query.toLowerCase()));
  return <><PageTitle eyebrow="YOUR ACTIVITY" title="Transactions" subtitle="Review, search, edit or remove your expenses." action={<div className="button-row"><button className="btn secondary" onClick={onExport}><Download size={16}/> Export CSV</button><button className="btn primary" onClick={onAdd}><Plus size={16}/> Add expense</button></div>}/>
    <section className="content-card"><div className="list-toolbar"><div><h2>All expenses <span className="count-badge">{filtered.length}</span></h2><p>Newest transactions appear first.</p></div><div className="search-box"><Search size={16}/><input placeholder="Search transactions..." value={query} onChange={e=>setQuery(e.target.value)}/></div></div>
      {filtered.length ? <div className="transaction-list">{filtered.map(e=><TransactionRow key={e.id} expense={e} categories={categories} onDelete={onDelete} onEdit={onEdit}/>)}</div> : <div className="empty-state compact"><Receipt size={26}/><h3>No matching expenses</h3><p>Try another search or add a new expense.</p></div>}
    </section></>;
}

function ExpenseModal({categories,initial,onClose,onSave}) {
  const [amount,setAmount] = useState(initial?.amount ?? "");
  const [categoryId,setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [date,setDate] = useState(initial?.date ?? today());
  const [note,setNote] = useState(initial?.note ?? "");
  const [error,setError] = useState("");
  const submit = (e) => { e.preventDefault(); if (!amount || !Number.isFinite(Number(amount)) || Number(amount)<=0) return setError("Enter an amount greater than zero."); if (!categoryId) return setError("Please select a category."); if(note.length>120) return setError("Note must be 120 characters or fewer."); onSave({amount:Number(amount),categoryId,date,note:note.trim()}); };
  return <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><motion.div className="modal-card" initial={{y:22,scale:.98}} animate={{y:0,scale:1}} exit={{y:15,opacity:0}}><div className="modal-head"><div><span className="eyebrow">TRANSACTION DETAILS</span><h2>{initial ? "Edit expense" : "Add an expense"}</h2><p>Capture the details so your spending stays organised.</p></div><button className="icon-button" onClick={onClose}><X/></button></div><form onSubmit={submit} className="expense-fields"><label>Amount <span>(INR ₹)</span><input autoFocus type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="e.g. 450" /></label><label>Category<select value={categoryId} onChange={e=>setCategoryId(e.target.value)}><option value="">Choose a category</option>{categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label><label>Date<input type="date" value={date} max="2099-12-31" onChange={e=>setDate(e.target.value)}/></label><label>Note <span>(optional · max 120 characters)</span><textarea rows="3" maxLength="120" value={note} onChange={e=>setNote(e.target.value)} placeholder="What was this expense for?"/></label><div className="field-meta">{note.length}/120 characters</div>{error&&<div className="form-alert"><AlertTriangle size={15}/>{error}</div>}<div className="modal-actions"><button type="button" className="btn secondary" onClick={onClose}>Cancel</button><button className="btn primary" type="submit"><Check size={16}/>{initial ? "Save changes" : "Save expense"}</button></div></form></motion.div></motion.div>;
}

function CategoryManager({categories,expenses,setCategories,setNotice}) {
  const [name,setName] = useState(""); const [color,setColor] = useState("#8B5CF6"); const [editing,setEditing] = useState(null); const [error,setError] = useState("");
  const submit = e => { e.preventDefault(); const clean=name.trim(); if(!clean) return setError("Enter a category name."); if(categories.some(c=>c.name.toLowerCase()===clean.toLowerCase() && c.id!==editing?.id)) return setError("That category already exists."); if(editing) setCategories(old=>old.map(c=>c.id===editing.id?{...c,name:clean,color}:c)); else setCategories(old=>[...old,{id:makeId(),name:clean,color}]); setName("");setColor("#8B5CF6");setEditing(null);setError("");setNotice(editing?"Category updated.":"Category added."); };
  const edit = c => {setEditing(c);setName(c.name);setColor(c.color);setError("");};
  const remove = c => {const inUse=expenses.some(e=>e.categoryId===c.id); if(inUse){setError(`"${c.name}" is used by existing expenses. Reassign those expenses before deleting this category.`);return;} if(categories.length===1){setError("At least one category must remain.");return;} if(window.confirm(`Delete category "${c.name}"?`)){setCategories(old=>old.filter(x=>x.id!==c.id));setNotice("Category deleted.");setError("");}};
  return <><PageTitle eyebrow="MAKE IT YOURS" title="Categories" subtitle="Organise expenses with colours that make sense to you."/><div className="category-layout"><section className="content-card"><div className="section-head"><div><h2>Your categories</h2><p>{categories.length} categories available</p></div></div><div className="category-grid">{categories.map(c=><div className="category-card" key={c.id}><div className="category-color" style={{background:c.color}}/><div className="category-info"><b>{c.name}</b><small>{expenses.filter(e=>e.categoryId===c.id).length} expenses</small></div><button className="icon-button subtle" onClick={()=>edit(c)} title="Edit category"><Pencil size={15}/></button><button className="icon-button subtle danger-hover" onClick={()=>remove(c)} title="Delete category"><Trash2 size={15}/></button></div>)}</div></section><section className="content-card category-form-card"><div className="section-head"><div><h2>{editing?"Edit category":"Create category"}</h2><p>Choose a name and a colour.</p></div></div><form onSubmit={submit} className="expense-fields"><label>Category name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Health"/></label><label>Colour<div className="color-input"><input type="color" value={color} onChange={e=>setColor(e.target.value)}/><span>{color.toUpperCase()}</span></div></label>{error&&<div className="form-alert"><AlertTriangle size={15}/>{error}</div>}<button className="btn primary full" type="submit">{editing?"Save category":"Add category"}</button>{editing&&<button type="button" className="btn secondary full" onClick={()=>{setEditing(null);setName("");setColor("#8B5CF6");setError("");}}>Cancel editing</button>}</form></section></div></>;
}

function Analytics({expenses,categories}) {
  const [selectedMonth,setSelectedMonth] = useState(monthKey(today()));
  const monthExpenses = expenses.filter(e=>monthKey(e.date)===selectedMonth);
  const total=monthExpenses.reduce((s,e)=>s+Number(e.amount),0);
  const pieData=categories.map(c=>({name:c.name,value:monthExpenses.filter(e=>e.categoryId===c.id).reduce((s,e)=>s+Number(e.amount),0),color:c.color})).filter(d=>d.value>0);
  const trend=Array.from({length:6},(_,i)=>{const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-(5-i));const key=monthKey(d.toISOString().slice(0,10));return {month:d.toLocaleDateString("en-IN",{month:"short"}),total:expenses.filter(e=>monthKey(e.date)===key).reduce((s,e)=>s+Number(e.amount),0)};});
  const months=[...new Set([monthKey(today()),...expenses.map(e=>monthKey(e.date))])].sort().reverse();
  return <><PageTitle eyebrow="UNDERSTAND YOUR HABITS" title="Analytics" subtitle="See where your money goes and how your spending changes."/><div className="analytics-filter"><label>Selected month <select value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)}>{months.map(m=><option key={m} value={m}>{monthLabel(m)}</option>)}</select></label><div className="analytics-total"><small>TOTAL SPENT</small><b>{money(total)}</b></div></div><div className="chart-grid"><section className="content-card chart-card"><div className="section-head"><div><h2>Category breakdown</h2><p>Spending by category for {monthLabel(selectedMonth)}</p></div></div>{pieData.length?<ResponsiveContainer width="100%" height={290}><PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="48%" innerRadius={68} outerRadius={104} paddingAngle={3}>{pieData.map(d=><Cell key={d.name} fill={d.color}/>)}</Pie><Tooltip formatter={v=>money(v)}/><Legend verticalAlign="bottom" height={35}/></PieChart></ResponsiveContainer>:<ChartEmpty text="No expenses recorded for this month yet."/>}</section><section className="content-card chart-card"><div className="section-head"><div><h2>Monthly trend</h2><p>Total spending over the last 6 months</p></div></div><ResponsiveContainer width="100%" height={290}><BarChart data={trend} margin={{top:15,right:8,left:0,bottom:0}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF0F5"/><XAxis dataKey="month" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false} width={55} tickFormatter={v=>v>=1000?`${v/1000}k`:v}/><Tooltip formatter={v=>money(v)}/><Bar dataKey="total" fill="#8063E9" radius={[7,7,0,0]} maxBarSize={42}/></BarChart></ResponsiveContainer></section></div></>;
}
function ChartEmpty({text}) {return <div className="chart-empty"><ChartNoAxesCombined size={28}/><p>{text}</p></div>;}
function SettingsPage({budget,setBudget,onExport,expensesCount}) {const [draft,setDraft]=useState(String(budget));const [saved,setSaved]=useState(false);const save=()=>{if(Number(draft)>0&&Number.isFinite(Number(draft))){setBudget(Number(draft));setSaved(true);setTimeout(()=>setSaved(false),2200);}};return <><PageTitle eyebrow="PREFERENCES" title="Settings" subtitle="Set a budget that works for your month."/><section className="content-card settings-card"><div className="settings-icon"><Settings size={22}/></div><div className="settings-copy"><h2>Monthly spending budget</h2><p>Your dashboard uses this amount to calculate your remaining budget.</p><div className="budget-edit"><span>₹</span><input type="number" min="1" value={draft} onChange={e=>setDraft(e.target.value)}/><button className="btn primary" onClick={save}>Save budget</button></div>{saved&&<small className="success-text"><Check size={14}/> Budget updated.</small>}</div></section><section className="content-card settings-card"><div className="settings-icon blue"><Download size={22}/></div><div className="settings-copy"><h2>Export your data</h2><p>Download all {expensesCount} expenses as a CSV file.</p><button className="btn secondary" onClick={onExport}><Download size={16}/> Download CSV</button></div></section><div className="privacy-note"><CircleHelp size={17}/><span>Your data is saved in this browser using localStorage. Clearing browser site data will remove locally stored expenses.</span></div></> ;
}

export default App;
