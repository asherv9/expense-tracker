import "./Sidebar.css";
import {
  LayoutDashboard,
  Receipt,
  Tags,
  ChartNoAxesCombined,
  Settings,
  Wallet,
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <div className="logo-icon">
          <Wallet size={25} />
        </div>

        <div>
          <h2>Spendly</h2>
          <span>Expense Manager</span>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-label">MENU</p>

        <nav>
          <a href="#dashboard" className="nav-item active">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </a>

          <a href="#transactions" className="nav-item">
            <Receipt size={19} />
            <span>Transactions</span>
          </a>

          <a href="#categories" className="nav-item">
            <Tags size={19} />
            <span>Categories</span>
          </a>

          <a href="#analytics" className="nav-item">
            <ChartNoAxesCombined size={19} />
            <span>Analytics</span>
          </a>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <a href="#settings" className="nav-item">
          <Settings size={19} />
          <span>Settings</span>
        </a>

        <div className="sidebar-profile">
          <div className="profile-avatar">A</div>
          <div>
            <h4>My Account</h4>
            <span>Personal Wallet</span>
          </div>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;
