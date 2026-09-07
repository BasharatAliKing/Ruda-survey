import { Bell, UserCircle } from "lucide-react";

function Header() {
  return (
    <header className="topbar">
      <div>
        <h2>Operations overview</h2>

        <p>
          Manage your users and surveys
        </p>
      </div>

      <div className="topbar-user">
        <button className="notification-button">
          <Bell size={22} />

          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            3
          </span>
        </button>

        <div className="user-summary">
          <UserCircle size={35} className="text-slate-500" />

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Admin
            </p>

            <p className="text-xs text-slate-500">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;