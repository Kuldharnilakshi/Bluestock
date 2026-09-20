import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./Matches.css";

const defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500";

function Matches() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      try {
        const data = await api.matches.getMatches();
        setMatches(data.matches || []);
      } catch (err) {
        console.error("Error loading matches:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  const handleStartChatting = (userId) => {
    navigate(`/messages?user=${userId}`);
  };

  return (
    <>
      <Navbar />
      <main className="matches-page">
        <div className="matches-container">
          <div className="matches-header">
            <span>YOUR CONNECTIONS</span>
            <h1>It's a Match ✨</h1>
            <p>People who feel the same spark.</p>
          </div>

          {loading ? (
            <div style={{ color: "#94a3b8", textAlign: "center", padding: "60px 0", fontSize: "16px" }}>
              Finding your matches...
            </div>
          ) : matches.length > 0 ? (
            <div className="matches-grid">
              {matches.map((match) => (
                <div className="match-profile" key={match.id}>
                  <div className="match-image">
                    <img
                      src={match.profile_pic || defaultAvatar}
                      alt={match.name}
                    />
                    <div className="match-online">
                      <span></span>
                      Online
                    </div>
                  </div>

                  <div className="match-info">
                    <h2>
                      {match.name}, <small>{match.age || 23}</small>
                    </h2>
                    <p>📍 {match.city || "Nearby"} • You both liked each other ❤️</p>
                    <button onClick={() => handleStartChatting(match.id)}>
                      💬 Start chatting
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "rgba(15, 23, 42, 0.6)",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              maxWidth: "500px",
              margin: "40px auto"
            }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>💔</div>
              <h2 style={{ color: "#fff", marginBottom: "8px" }}>No matches yet</h2>
              <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
                Keep swiping on Discover to find someone whose vibe matches yours!
              </p>
              <Link
                to="/discover"
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: "700",
                  fontSize: "14px"
                }}
              >
                Go to Discover →
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default Matches;