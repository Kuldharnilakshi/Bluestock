import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Landing.css";

function Landing() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="landing-page">

      {/* Background Effects */}
      <div className="landing-glow glow-one"></div>
      <div className="landing-glow glow-two"></div>
      <div className="landing-grid"></div>

      {/* Navbar */}
      <nav className="landing-nav">
        <Link to="/" className="landing-logo">
          <span className="logo-heart">♥</span>
          <span>
            Heart<span>Sync</span>
          </span>
        </Link>

        <div className="landing-nav-links">
          <a href="#story">Our story</a>
          <a href="#features">Why HeartSync</a>
          {isAuthenticated ? (
            <Link to="/discover" className="nav-register">
              Open App →
            </Link>
          ) : (
            <>
              <Link to="/login" className="nav-login">
                Log in
              </Link>
              <Link to="/register" className="nav-register">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="hero-section">

        <div className="hero-content">

          <div className="hero-badge">
            <span className="badge-dot"></span>
            Meaningful connections, made beautifully
          </div>

          <h1>
            Find someone
            <br />
            who feels like
            <span> home.</span>
          </h1>

          <p className="hero-description">
            HeartSync helps you discover genuine people, meaningful
            conversations, and connections that feel effortless.
          </p>

          <div className="hero-actions">
            <Link to={isAuthenticated ? "/discover" : "/register"} className="primary-cta">
              Start discovering
              <span>→</span>
            </Link>

            <a href="#story" className="secondary-cta">
              <span className="play-icon">▶</span>
              See how it works
            </a>
          </div>

          <div className="hero-trust">
            <div className="mini-avatars">
              <span>R</span>
              <span>A</span>
              <span>M</span>
              <span>S</span>
            </div>

            <div>
              <strong>10,000+</strong>
              <p>people looking for something real</p>
            </div>
          </div>

        </div>

        {/* Hero Visual */}
        <div className="hero-visual">

          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>

          {/* Main Profile Card - Clean, aesthetic showcase without dead buttons */}
          <div className="hero-profile-card">
            <div className="profile-image">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85"
                alt="Emma"
                className="hero-avatar-img"
              />
              <div className="profile-gradient"></div>

              <div className="profile-top">
                <span className="online-pill">
                  <i></i> Online Now
                </span>

                <span className="verified" title="Verified Profile">✓</span>
              </div>

              <div className="profile-info">
                <div className="match-pill-tag">
                  <span>💖 98% Compatibility</span>
                </div>

                <h2>
                  Emma <span>24</span>
                </h2>

                <p className="profile-location-text">📍 Pune · Creative Designer</p>
                <p className="profile-bio-snippet">"Looking for spontaneous sunset drives & deep conversations 🌸"</p>

                <div className="profile-tags">
                  <span>🎨 Design</span>
                  <span>☕ Latte Art</span>
                  <span>🎧 Indie Pop</span>
                  <span>✨ Golden Hour</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Match Card */}
          <div className="floating-match">
            <div className="match-icon">♥</div>

            <div>
              <small>IT'S A MATCH</small>
              <strong>You found a spark ✨</strong>
            </div>
          </div>

          {/* Floating Compatibility */}
          <div className="floating-compatible">
            <div className="compatibility-circle">
              98%
            </div>

            <div>
              <small>Compatibility</small>
              <strong>Almost perfect</strong>
            </div>
          </div>

          {/* Decorative dots */}
          <span className="decor-dot dot-one"></span>
          <span className="decor-dot dot-two"></span>
          <span className="decor-dot dot-three"></span>

        </div>

      </main>

      {/* Story */}
      <section className="story-section" id="story">

        <div className="section-label">
          <span></span>
          CONNECTION, REIMAGINED
        </div>

        <h2>
          Less swiping.
          <br />
          <span>More feeling.</span>
        </h2>

        <p>
          We believe meeting someone should feel exciting, personal,
          and human — not like scrolling through a catalogue.
        </p>

      </section>

      {/* Features */}
      <section className="features-section" id="features">

        <div className="feature-card">
          <span>01</span>
          <h3>Real connections</h3>
          <p>
            Discover people based on personality, interests and
            compatibility.
          </p>
        </div>

        <div className="feature-card">
          <span>02</span>
          <h3>Beautiful conversations</h3>
          <p>
            Turn a match into something meaningful with effortless
            messaging.
          </p>
        </div>

        <div className="feature-card">
          <span>03</span>
          <h3>Your space</h3>
          <p>
            Build a profile that feels like you, not just another
            dating profile.
          </p>
        </div>

      </section>

      {/* Bottom CTA */}
      <section className="final-cta">

        <div>
          <span>READY WHEN YOU ARE</span>

          <h2>
            Your next chapter
            <br />
            <em>could start here.</em>
          </h2>
        </div>

        <Link to={isAuthenticated ? "/discover" : "/register"}>
          {isAuthenticated ? "Continue swiping →" : "Create your profile →"}
        </Link>

      </section>

      <footer>
        <div className="footer-logo">
          <span>♥</span> HeartSync
        </div>

        <p>Made for meaningful connections.</p>

        <span>© 2026 HeartSync</span>
      </footer>

    </div>
  );
}

export default Landing;