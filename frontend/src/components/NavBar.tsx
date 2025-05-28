import { useNavigate, useLocation } from "react-router-dom";
import { Users, FileText, TrendingUp, Home, Menu, X } from "lucide-react";
import { useState } from "react";
import "../css/NavBar.css";
import Logo1 from "../images/Logo1.png";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/big-board", label: "Big Board", icon: TrendingUp },
    { path: "/prospects", label: "Prospects", icon: Users },
    { path: "/scout-rankings", label: "Scout Rankings", icon: FileText },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo and Team Name */}
          <div className="navbar-logo" onClick={() => handleNavigation("/")}>
            <div className="navbar-logo-avatar">
              <img
                src={Logo1}
                alt="Dallas Mavericks Logo"
                className="navbar-logo-image"
              />
            </div>
            <div className="navbar-team-info">
              <h1>Dallas Mavericks</h1>
              <p>Draft Operations</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="navbar-nav-desktop">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path === "/" && location.pathname === "/home");
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`navbar-nav-button ${isActive ? "active" : ""}`}
                  aria-label={`Navigate to ${item.label}`}
                >
                  <Icon size={20} />
                  <span className="navbar-nav-label">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="navbar-actions">
            <button
              className="navbar-mobile-menu-button"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`navbar-mobile-drawer ${mobileMenuOpen ? "open" : ""}`}>
          <div
            className="navbar-mobile-overlay"
            onClick={toggleMobileMenu}
          ></div>
          <nav className="navbar-mobile-nav">
            <div className="navbar-mobile-header">
              <h3>Navigation</h3>
              <button
                className="navbar-mobile-close"
                onClick={toggleMobileMenu}
                aria-label="Close mobile menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="navbar-mobile-items">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path === "/" && location.pathname === "/home");
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`navbar-mobile-item ${isActive ? "active" : ""}`}
                    aria-label={`Navigate to ${item.label}`}
                  >
                    <Icon size={24} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
