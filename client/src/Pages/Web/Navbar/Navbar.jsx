import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const WebsiteNavbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Blog", path: "/blogs" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">CA</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                CREATIVE AGENCY
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Digital Excellence</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium text-lg transition-all duration-200 ${
                  isActive(link.path)
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Register & Login Buttons */}
            {/* <Link
              to="/register"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-2xl font-medium transition"
            >
              Register
            </Link> */}
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-2xl font-medium transition"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2"
          >
            {isMobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-6 py-8 flex flex-col gap-4 text-lg">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileOpen(false)}
                className={`py-2 ${
                  isActive(link.path)
                    ? "text-blue-600 font-medium"
                    : "text-gray-700"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Register & Login for Mobile */}
            <Link
              to="/register"
              onClick={() => setIsMobileOpen(false)}
              className="bg-green-600 text-white text-center py-3 rounded-2xl font-medium mt-4"
            >
              Register
            </Link>
            <Link
              to="/login"
              onClick={() => setIsMobileOpen(false)}
              className="bg-blue-600 text-white text-center py-3 rounded-2xl font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default WebsiteNavbar;
