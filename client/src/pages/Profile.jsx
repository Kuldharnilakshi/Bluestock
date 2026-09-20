import { useState, useEffect } from "react";
import "./Profile.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const defaultAvatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=700";

function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    age: "",
    city: "",
    bio: "",
    profilePic: "",
    interests: []
  });

  const [editedProfile, setEditedProfile] = useState({
    name: "",
    age: "",
    city: "",
    bio: "",
    profilePic: "",
    interests: ""
  });

  // Sync profile when user changes
  useEffect(() => {
    async function fetchFreshProfile() {
      try {
        const data = await api.profile.get();
        populateProfile(data);
      } catch (err) {
        if (user) {
          populateProfile(user);
        }
      }
    }
    fetchFreshProfile();
  }, [user]);

  const populateProfile = (data) => {
    let parsedInterests = [];
    if (Array.isArray(data.interests)) {
      parsedInterests = data.interests;
    } else if (typeof data.interests === "string" && data.interests.trim()) {
      parsedInterests = data.interests.split(",").map((s) => s.trim());
    }

    const formatted = {
      name: data.name || "",
      age: data.age || "",
      city: data.city || "",
      bio: data.bio || "",
      profilePic: data.profile_pic || data.profilePic || defaultAvatar,
      interests: parsedInterests
    };

    setProfile(formatted);
    setEditedProfile({
      ...formatted,
      interests: parsedInterests.join(", ")
    });
  };

  const handleEdit = () => {
    setEditedProfile({
      ...profile,
      interests: profile.interests.join(", ")
    });
    setIsEditing(true);
    setFeedback("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setFeedback("");

    try {
      const interestsArray = editedProfile.interests
        ? editedProfile.interests.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        name: editedProfile.name,
        age: parseInt(editedProfile.age, 10) || null,
        city: editedProfile.city,
        bio: editedProfile.bio,
        profilePic: editedProfile.profilePic,
        interests: interestsArray
      };

      await updateProfile(payload);

      setProfile({
        ...payload,
        interests: interestsArray
      });

      setIsEditing(false);
      setFeedback("Profile updated successfully! ✨");
      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      console.error("Save profile error:", err);
      setFeedback("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile({
      ...profile,
      interests: profile.interests.join(", ")
    });
    setIsEditing(false);
  };

  return (
    <>
      <Navbar />

      <main className="profile-page">
        <div className="profile-container">
          <div className="profile-top">
            <span>YOUR PROFILE</span>
            <h1>About you ✨</h1>
            <p>Let your personality shine.</p>
          </div>

          {feedback && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 18px",
                borderRadius: "12px",
                background: feedback.includes("Failed")
                  ? "rgba(239, 68, 68, 0.15)"
                  : "rgba(34, 197, 94, 0.15)",
                border: feedback.includes("Failed")
                  ? "1px solid rgba(239, 68, 68, 0.3)"
                  : "1px solid rgba(34, 197, 94, 0.3)",
                color: feedback.includes("Failed") ? "#fca5a5" : "#86efac",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              {feedback}
            </div>
          )}

          <section className="profile-card-main">
            {/* PROFILE PHOTO */}
            <div className="profile-photo">
              <img
                src={
                  isEditing
                    ? editedProfile.profilePic || defaultAvatar
                    : profile.profilePic || defaultAvatar
                }
                alt={profile.name || "Profile"}
              />

              <div className="profile-online">
                <span></span>
                Active Now
              </div>
            </div>

            {/* PROFILE DETAILS */}
            <div className="profile-details">
              {isEditing ? (
                /* EDIT MODE */
                <div className="profile-edit-form">
                  <div className="edit-header">
                    <div>
                      <h2>Edit Profile</h2>
                      <p>Update your information</p>
                    </div>
                  </div>

                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editedProfile.name}
                    onChange={handleChange}
                  />

                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    value={editedProfile.age}
                    onChange={handleChange}
                  />

                  <label>Location / City</label>
                  <input
                    type="text"
                    name="city"
                    value={editedProfile.city}
                    onChange={handleChange}
                  />

                  <label>Profile Picture URL</label>
                  <input
                    type="text"
                    name="profilePic"
                    value={editedProfile.profilePic}
                    onChange={handleChange}
                    placeholder="https://..."
                  />

                  <label>Interests (comma separated)</label>
                  <input
                    type="text"
                    name="interests"
                    value={editedProfile.interests}
                    onChange={handleChange}
                    placeholder="Travel, Design, Photography, Coffee"
                  />

                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={editedProfile.bio}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Tell everyone what makes you unique..."
                  />

                  <div className="edit-buttons">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="save-btn"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                /* VIEW MODE */
                <>
                  <div className="profile-name">
                    <div>
                      <h2>{profile.name || "Anonymous"}</h2>
                      <p>{profile.age ? `${profile.age} years old` : "Age not specified"}</p>
                    </div>

                    <button onClick={handleEdit}>✎ Edit</button>
                  </div>

                  <div className="profile-location">
                    📍 {profile.city || "Location not set"}
                  </div>

                  <p className="profile-bio">
                    {profile.bio || "No bio added yet. Click edit to tell others about yourself!"}
                  </p>

                  <h3>Interests</h3>

                  <div className="profile-interests">
                    {profile.interests.length > 0 ? (
                      profile.interests.map((interest, index) => (
                        <span key={index}>{interest}</span>
                      ))
                    ) : (
                      <span style={{ opacity: 0.6 }}>No interests listed</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default Profile;