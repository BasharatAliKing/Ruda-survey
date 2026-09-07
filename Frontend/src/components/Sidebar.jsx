import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    name: "Users",
    path: "/dashboard/users",
    icon: Users,
    end: true,
  },
  {
    name: "Surveys",
    path: "/dashboard/surveys",
    icon: ClipboardList,
    end: true,
  },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="brand-block">
        <div className="brand-mark">R</div>

        <div>
          <h1>RUDA</h1>
          <p>Survey command center</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div>
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button
          className="sidebar-link"
          onClick={() => {
            localStorage.removeItem("ruda_token");
            localStorage.removeItem("ruda_user");
            window.location.href = "/login";
          }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;