import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "♥";

  return (
    <nav className="navbar">
      <Link to="/discover" className="nav-brand">
        <div className="brand-icon">♥</div>
        <span>HeartSync</span>
      </Link>

      <div className="nav-links">
        <NavLink to="/discover">
          <span className="nav-icon">✨</span> Discover
        </NavLink>
        <NavLink to="/matches">
          <span className="nav-icon">💖</span> Matches
        </NavLink>
        <NavLink to="/messages">
          <span className="nav-icon">💬</span> Messages
        </NavLink>
        <NavLink to="/profile">
          <span className="nav-icon">🌸</span> Profile
        </NavLink>
      </div>

      <div className="nav-profile">
        {isAuthenticated ? (
          <>
            <Link to="/profile" className="nav-avatar-link" title="My Profile">
              <div className="nav-avatar">
                {user?.profile_pic ? (
                  <img src={user.profile_pic} alt={user.name || "Profile"} />
                ) : (
                  initial
                )}
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="nav-logout-btn"
              title="Log out"
            >
              Log out
            </button>
          </>
        ) : (
          <Link to="/login" className="nav-logout-btn">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;