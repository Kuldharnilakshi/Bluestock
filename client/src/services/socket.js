import { io } from "socket.io-client";

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (typeof window !== "undefined") {
    if (window.location.port === "5173") {
      return "http://localhost:5000";
    }
    return window.location.origin;
  }
  return "http://localhost:5000";
};

const SOCKET_URL = getSocketUrl();

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketInstance.on("connect", () => {
      console.log("Connected to HeartSync Socket server:", socketInstance.id);
      // Re-join user room if user is stored
      try {
        const storedUser = localStorage.getItem("heartsync_user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user?.id) {
            socketInstance.emit("join_room", user.id);
          }
        }
      } catch (e) {
        console.error("Error rejoining socket room:", e);
      }
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message);
    });
  }

  return socketInstance;
};

export const joinUserRoom = (userId) => {
  const socket = getSocket();
  if (socket && userId) {
    socket.emit("join_room", userId);
  }
};

export const sendSocketMessage = (senderId, receiverId, message) => {
  const socket = getSocket();
  if (socket) {
    socket.emit("send_message", {
      senderId,
      receiverId,
      message
    });
  }
};

export default getSocket;
