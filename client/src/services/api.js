// =========================================================
// HEARTSYNC API SERVICE
// Production Backend: Render
// =========================================================

const getApiBaseUrl = () => {
  // Vercel / production environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Deployed Render backend
  return "https://heartsync-api-9706.onrender.com/api";
};

const API_BASE_URL = getApiBaseUrl();


// =========================================================
// FALLBACK DEMO USERS
// Used only if backend is unreachable
// =========================================================

const FALLBACK_USERS = [
  {
    id: 2,
    name: "Sophia Patel",
    email: "sophia@gmail.com",
    age: 24,
    city: "Mumbai",
    bio: "Book lover, foodie, and romantic soul who believes the best connections start with a warm coffee & good conversation ☕✨",
    interests: ["Books", "Food", "Travel", "Movies"],
    profile_pic:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 3,
    name: "Kabir Mehta",
    email: "kabir@gmail.com",
    age: 26,
    city: "Bangalore",
    bio: "Tech founder with a soft spot for sunsets, golden hour photography and acoustic indie playlists 🌅🎸",
    interests: ["Technology", "Fitness", "Food", "Nature"],
    profile_pic:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 4,
    name: "Ishita Roy",
    email: "ishita@gmail.com",
    age: 23,
    city: "Pune",
    bio: "Creative soul who loves road trips, vinyl records, film cameras, and late night cafe conversations 🌸",
    interests: ["Photography", "Music", "Art", "Adventure"],
    profile_pic:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 5,
    name: "Nilakshi Sen",
    email: "nilakshi@gmail.com",
    age: 24,
    city: "Pune",
    bio: "UI designer who loves slow aesthetic mornings, pottery, and discovering cute hidden cafes ✨",
    interests: ["Design", "Travel", "Coffee", "Art"],
    profile_pic:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 6,
    name: "Rohan Verma",
    email: "rohan@gmail.com",
    age: 27,
    city: "Delhi",
    bio: "Architect with a passion for cycling, modern art galleries and dark espresso ☕🚲",
    interests: ["Design", "Cycling", "Coffee", "Architecture"],
    profile_pic:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=85"
  }
];


// =========================================================
// COMMON REQUEST FUNCTION
// =========================================================

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("heartsync_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(
        data.message || `Request failed with status ${response.status}`
      );

      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data;

  } catch (err) {

    // Server returned an HTTP error
    if (err.status) {
      throw err;
    }

    // Network/backend unavailable
    console.warn(
      `[HeartSync API] Network fallback for ${endpoint}:`,
      err.message
    );

    return handleClientFallback(endpoint, options);
  }
}


// =========================================================
// CLIENT-SIDE FALLBACK
// =========================================================

function handleClientFallback(endpoint, options = {}) {

  let body = {};

  try {
    body = options.body ? JSON.parse(options.body) : {};
  } catch {
    body = {};
  }


  // =======================================================
  // LOGIN
  // =======================================================

  if (endpoint === "/auth/login") {

    const isSophia =
      body.email && body.email.toLowerCase().includes("sophia");

    const user = isSophia
      ? FALLBACK_USERS[0]
      : {
          id: 1,
          name: "Aarav Sharma",
          email: body.email || "aarav@gmail.com",
          age: 25,
          city: "Mumbai",
          bio: "Software engineer by day, guitarist by night 🎸 Down for road trips and filter coffee.",
          interests: ["Music", "Travel", "Tech", "Coffee"],
          profile_pic:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=85"
        };

    return {
      token: "demo_token_" + Date.now(),
      user
    };
  }


  // =======================================================
  // REGISTER
  // =======================================================

  if (endpoint === "/auth/register") {

    const user = {
      id: Date.now(),
      name: body.name || "Explorer",
      email: body.email || "explorer@heartsync.app",
      age: 24,
      city: "Mumbai",
      bio: "Looking for genuine connections and cute vibes ✨",
      interests: ["Coffee", "Music", "Travel"],
      profile_pic:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85"
    };

    try {
      const savedUsers = JSON.parse(
        localStorage.getItem("heartsync_all_users") || "[]"
      );

      savedUsers.unshift(user);

      localStorage.setItem(
        "heartsync_all_users",
        JSON.stringify(savedUsers)
      );

    } catch {}

    return {
      token: "demo_token_" + Date.now(),
      user
    };
  }


  // =======================================================
  // PROFILE
  // =======================================================

  if (endpoint === "/profile") {

    // UPDATE PROFILE
    if (options.method === "PUT") {

      try {
        const savedUser = JSON.parse(
          localStorage.getItem("heartsync_user") || "{}"
        );

        const updated = {
          ...savedUser,
          ...body
        };

        localStorage.setItem(
          "heartsync_user",
          JSON.stringify(updated)
        );

        return {
          message: "Profile updated successfully",
          user: updated
        };

      } catch {
        return {
          message: "Profile updated successfully",
          user: body
        };
      }
    }


    // GET PROFILE
    const saved = localStorage.getItem("heartsync_user");

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }

    return {
      id: 1,
      name: "Aarav Sharma",
      email: "aarav@gmail.com",
      age: 25,
      city: "Mumbai",
      bio: "Software engineer by day, guitarist by night 🎸 Down for road trips and filter coffee.",
      interests: ["Music", "Travel", "Tech", "Coffee"],
      profile_pic:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=85"
    };
  }


  // =======================================================
  // DISCOVER
  // =======================================================

  if (endpoint === "/discover") {

    const savedUsers = JSON.parse(
      localStorage.getItem("heartsync_all_users") || "[]"
    );

    const combined = [
      ...savedUsers,
      ...FALLBACK_USERS
    ];

    const currentUser = JSON.parse(
      localStorage.getItem("heartsync_user") || "{}"
    );

    const filtered = combined.filter(
      (u) =>
        u.id !== currentUser?.id &&
        u.email !== currentUser?.email
    );

    return {
      users: filtered
    };
  }


  // =======================================================
  // LIKE
  // =======================================================

  if (endpoint === "/likes") {

    const likedId = body.likedUserId;

    const savedUsers = JSON.parse(
      localStorage.getItem("heartsync_all_users") || "[]"
    );

    const allUsers = [
      ...savedUsers,
      ...FALLBACK_USERS
    ];

    const target = allUsers.find(
      (u) => u.id === likedId
    );

    if (target) {

      const currentMatches = JSON.parse(
        localStorage.getItem("heartsync_matches") || "[]"
      );

      if (
        !currentMatches.some(
          (m) => m.id === target.id
        )
      ) {

        currentMatches.unshift(target);

        localStorage.setItem(
          "heartsync_matches",
          JSON.stringify(currentMatches)
        );
      }
    }

    return {
      message: "It's a Match! ❤️",
      matched: true
    };
  }


  // =======================================================
  // MATCHES
  // =======================================================

  if (endpoint === "/matches") {

    const currentMatches = JSON.parse(
      localStorage.getItem("heartsync_matches") || "null"
    );

    return {
      matches:
        currentMatches || [
          FALLBACK_USERS[0],
          FALLBACK_USERS[1],
          FALLBACK_USERS[2]
        ]
    };
  }


  // =======================================================
  // MESSAGE HISTORY
  // =======================================================

  if (endpoint.startsWith("/messages/")) {

    const otherId = endpoint.split("/")[2];

    const match =
      FALLBACK_USERS.find(
        (u) => u.id === parseInt(otherId, 10)
      ) || FALLBACK_USERS[0];

    const localStoreKey =
      `heartsync_msgs_${otherId}`;

    const saved =
      localStorage.getItem(localStoreKey);

    const existing = saved
      ? JSON.parse(saved)
      : [
          {
            id: 101,
            sender_id: match.id,
            receiver_id: 1,
            message:
              "Hey! Loved your profile! What kind of coffee or music are you into? ✨",
            created_at: new Date(
              Date.now() - 3600000
            ).toISOString()
          }
        ];

    return {
      messages: existing
    };
  }


  // =======================================================
  // SEND MESSAGE
  // =======================================================

  if (
    endpoint === "/messages" &&
    options.method === "POST"
  ) {

    const {
      receiverId,
      message
    } = body;

    const localStoreKey =
      `heartsync_msgs_${receiverId}`;

    const saved =
      localStorage.getItem(localStoreKey);

    const msgs = saved
      ? JSON.parse(saved)
      : [];

    const newMsg = {
      id: Date.now(),
      sender_id: 1,
      receiver_id: receiverId,
      message,
      created_at: new Date().toISOString()
    };

    msgs.push(newMsg);

    localStorage.setItem(
      localStoreKey,
      JSON.stringify(msgs)
    );

    return newMsg;
  }


  // =======================================================
  // DEFAULT
  // =======================================================

  return {};
}


// =========================================================
// EXPORTED API
// =========================================================

export const api = {

  // =======================================================
  // AUTH
  // =======================================================

  auth: {

    login: (email, password) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password
        })
      }),

    register: (name, email, password) =>
      request("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password
        })
      })
  },


  // =======================================================
  // PROFILE
  // =======================================================

  profile: {

    get: () =>
      request("/profile"),

    update: (profileData) =>
      request("/profile", {
        method: "PUT",
        body: JSON.stringify(profileData)
      })
  },


  // =======================================================
  // DISCOVER
  // =======================================================

  discover: {

    getUsers: () =>
      request("/discover")
  },


  // =======================================================
  // LIKES
  // =======================================================

  likes: {

    likeUser: (likedUserId) =>
      request("/likes", {
        method: "POST",
        body: JSON.stringify({
          likedUserId
        })
      })
  },


  // =======================================================
  // MATCHES
  // =======================================================

  matches: {

    getMatches: () =>
      request("/matches")
  },


  // =======================================================
  // MESSAGES
  // =======================================================

  messages: {

    getHistory: (otherUserId) =>
      request(`/messages/${otherUserId}`),

    send: (receiverId, message) =>
      request("/messages", {
        method: "POST",
        body: JSON.stringify({
          receiverId,
          message
        })
      })
  }
};


// =========================================================
// DEFAULT EXPORT
// =========================================================

export default api;
