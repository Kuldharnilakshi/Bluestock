import "./ProfileCard.css";

function ProfileCard({ profile, onLike, onPass }) {
  return (
    <div className="profile-card">

      {/* Profile Image */}
      <div className="profile-image-section">
        <img
          src={profile.image}
          alt={profile.name}
          className="profile-image"
        />

        {/* Gradient */}
        <div className="profile-gradient"></div>

        {/* Online */}
        {profile.online && (
          <div className="online-badge">
            <span className="online-dot"></span>
            Online
          </div>
        )}

        {/* Profile Information */}
        <div className="profile-info">
          <h2>
            {profile.name}

            {profile.age && (
              <span className="profile-age">
                {profile.age}
              </span>
            )}
          </h2>

          {profile.location && (
            <p className="profile-location">
              📍 {profile.location}
            </p>
          )}

          {profile.bio && (
            <p className="profile-bio">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="profile-actions">

        <button
          onClick={onPass}
          className="pass-button"
          aria-label="Pass"
        >
          ✕
        </button>

        <button
          onClick={onLike}
          className="like-button"
          aria-label="Like"
        >
          ♥
        </button>

      </div>
    </div>
  );
}

export default ProfileCard;