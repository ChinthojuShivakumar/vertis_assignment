import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar({ menuOpen, setMenuOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/";
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div
      className={`bg-gradient-to-b from-cyan-400 to-blue-500 
        text-white w-64 p-6 space-y-6 fixed top-0 left-0 bottom-0 
        transform ${menuOpen ? "translate-x-0" : "-translate-x-full"} 
        md:relative md:translate-x-0 transition-transform duration-300 z-40`}
    >
      {/* LOGO */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-wider">CREATIVE AGENCY</h2>
        <p className="text-xs text-white/70 mt-1">Admin Panel</p>
      </div>

      {/* MENU */}
      <nav className="flex flex-col gap-2">
        <Link
          to="/admin"
          onClick={() => setMenuOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive("/admin")
              ? "bg-white text-blue-600 font-medium shadow-sm"
              : "hover:bg-white/20"
          }`}
        >
          Dashboard
        </Link>

        <Link
          to="/admin/services"
          onClick={() => setMenuOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
            isActive("/admin/services")
              ? "bg-white text-blue-600 font-medium shadow-sm"
              : "hover:bg-white/20"
          }`}
        >
          Services
        </Link>

        <Link
          to="/admin/blogs"
          onClick={() => setMenuOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
            isActive("/admin/blogs")
              ? "bg-white text-blue-600 font-medium shadow-sm"
              : "hover:bg-white/20"
          }`}
        >
          Blogs
        </Link>

        <Link
          to="/admin/about"
          onClick={() => setMenuOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
            isActive("/admin/about")
              ? "bg-white text-blue-600 font-medium shadow-sm"
              : "hover:bg-white/20"
          }`}
        >
          About
        </Link>

        <Link
          to="/admin/contact"
          onClick={() => setMenuOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
            isActive("/admin/contact")
              ? "bg-white text-blue-600 font-medium shadow-sm"
              : "hover:bg-white/20"
          }`}
        >
          Contact
        </Link>

        {/* LOGOUT as menu item */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/20 transition-all duration-200 w-full text-left"
        >
          Logout
        </button>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-6 left-6 text-xs text-white/60">
        © 2026 Creative Agency
      </div>
    </div>
  );
}