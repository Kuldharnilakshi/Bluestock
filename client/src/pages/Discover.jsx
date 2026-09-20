import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "./Discover.css";

const defaultAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=85"
];

function Discover() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);
  const [matchedModal, setMatchedModal] = useState(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const data = await api.discover.getUsers();
      const rawUsers = data.users || [];

      // Format users for display
      const formatted = rawUsers.map((u, idx) => {
        let parsedInterests = [];
        if (Array.isArray(u.interests)) {
          parsedInterests = u.interests;
        } else if (typeof u.interests === "string" && u.interests.trim()) {
          parsedInterests = u.interests.split(",").map((s) => s.trim());
        } else {
          parsedInterests = ["Connection", "Coffee", "Music"];
        }

        return {
          id: u.id,
          name: u.name || "Explorer",
          age: u.age || 24,
          location: u.city || "Nearby",
          bio: u.bio || "Looking for genuine connections and interesting conversations.",
          image: u.profile_pic || defaultAvatars[idx % defaultAvatars.length],
          interests: parsedInterests,
          match: 88 + (u.id % 11),
          online: u.id % 2 === 0
        };
      });

      setProfiles(formatted);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Error fetching discover profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const profile = profiles[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!profile) return;
      if (e.key === "ArrowLeft") handleAction("pass");
      if (e.key === "ArrowRight") handleAction("like");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [profile]);

  const handleAction = async (type) => {
    if (!profile) return;
    setAction(type);

    const currentTarget = profile;

    if (type === "like" || type === "superlike") {
      try {
        const res = await api.likes.likeUser(currentTarget.id);
        if (res && res.matched) {
          setMatchedModal(currentTarget);
        }
      } catch (err) {
        console.error("Error liking user:", err);
      }
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setAction("");
    }, 350);
  };

  const handleChatNow = () => {
    if (matchedModal) {
      navigate(`/messages?user=${matchedModal.id}`);
    }
  };

  return (
    <div className="discover-page">
      <Navbar />

      <main className="discover-container">
        {/* HEADER */}
        <div className="discover-header">
          <div>
            <div className="discover-label">DISCOVER</div>
            <h1>
              Find someone <span>special.</span>
            </h1>
            <p>
              Discover people who share your interests, energy and perspective.
            </p>
          </div>

          <div className="profiles-left">
            <strong>{Math.max(profiles.length - currentIndex, 0)}</strong>
            <span>PROFILES LEFT</span>
          </div>
        </div>

        {/* CARD AREA */}
        <div className="discover-content">
          {loading ? (
            <div style={{ color: "#94a3b8", fontSize: "16px", padding: "60px 0" }}>
              Finding matches near you...
            </div>
          ) : profile ? (
            <div className={`profile-wrapper ${action}`}>
              {/* MATCH BADGE */}
              <div className="match-badge">
                <strong>{profile.match}%</strong>
                <span>MATCH</span>
              </div>

              {/* CARD */}
              <div className="discover-card">
                {/* IMAGE */}
                <div className="card-image">
                  <img src={profile.image} alt={profile.name} />
                  <div className="image-overlay"></div>

                  {/* ONLINE */}
                  {profile.online && (
                    <div className="online-badge">
                      <span></span>
                      Online
                    </div>
                  )}

                  {/* INFO ON IMAGE */}
                  <div className="card-info">
                    <h2>
                      {profile.name}
                      <small>{profile.age}</small>
                    </h2>
                    <div className="location">📍 {profile.location}</div>
                    <p>{profile.bio}</p>
                  </div>
                </div>

                {/* INTERESTS */}
                <div className="interests">
                  {profile.interests.map((interest) => (
                    <span key={interest}>{interest}</span>
                  ))}
                </div>

                {/* ACTIONS */}
                <div className="card-actions">
                  <button
                    className="pass-btn"
                    onClick={() => handleAction("pass")}
                    aria-label="Pass"
                    title="Pass (Left Arrow ←)"
                  >
                    ✕
                  </button>

                  <button
                    className="star-sparkle-btn"
                    onClick={() => handleAction("superlike")}
                    aria-label="Super Like"
                    title="Super Spark ✨"
                  >
                    ★
                  </button>

                  <button
                    className="like-btn"
                    onClick={() => handleAction("like")}
                    aria-label="Like"
                    title="Like (Right Arrow →)"
                  >
                    ♥
                  </button>
                </div>

                <div className="swipe-hint-pill">
                  <span>← Swipe Left to Pass</span>
                  <span className="hint-divider">•</span>
                  <span>Swipe Right to Like →</span>
                </div>
              </div>
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="empty-state">
              <div className="empty-heart">♥</div>
              <span className="empty-label">YOU'RE ALL CAUGHT UP</span>
              <h2>No more profiles for now.</h2>
              <p>
                You've seen everyone in your current discovery list.
                Come back later for new connections.
              </p>
              <button className="discover-again" onClick={fetchProfiles}>
                Discover Again
              </button>
            </div>
          )}
        </div>
      </main>

      {/* MATCH CELEBRATION MODAL */}
      {matchedModal && (
        <div className="match-overlay" onClick={() => setMatchedModal(null)}>
          <div className="match-modal" onClick={(e) => e.stopPropagation()}>
            <div className="match-modal-heart">💖</div>
            <h2>It's a Match!</h2>
            <p>
              You and <strong>{matchedModal.name}</strong> liked each other. The spark is real!
            </p>
            <div className="match-modal-actions">
              <button
                className="match-modal-btn-keep"
                onClick={() => setMatchedModal(null)}
              >
                Keep Swiping
              </button>
              <button className="match-modal-btn-chat" onClick={handleChatNow}>
                💬 Chat Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Discover;