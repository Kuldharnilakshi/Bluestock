// =========================================================
// HEARTSYNC SOCKET.IO SERVICE
// Production Backend: Render
// =========================================================

import { io } from "socket.io-client";


// =========================================================
// SOCKET URL
// =========================================================

const getSocketUrl = () => {
  // Use environment variable if available
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  // Deployed Render backend
  return "https://heartsync-api-9706.onrender.com";
};

const SOCKET_URL = getSocketUrl();


// =========================================================
// SOCKET INSTANCE
// =========================================================

let socketInstance = null;


// =========================================================
// GET SOCKET
// =========================================================

export const getSocket = () => {

  if (!socketInstance) {

    socketInstance = io(SOCKET_URL, {
      autoConnect: true,

      reconnection: true,

      reconnectionAttempts: 5,

      reconnectionDelay: 1000,

      transports: ["websocket", "polling"]
    });


    // =====================================================
    // CONNECT
    // =====================================================

    socketInstance.on("connect", () => {

      console.log(
        "Connected to HeartSync Socket server:",
        socketInstance.id
      );


      // Rejoin user's room
      try {

        const storedUser =
          localStorage.getItem("heartsync_user");

        if (storedUser) {

          const user = JSON.parse(storedUser);

          if (user?.id) {

            socketInstance.emit(
              "join_room",
              user.id
            );

            console.log(
              "Joined HeartSync room:",
              `user_${user.id}`
            );
          }
        }

      } catch (error) {

        console.error(
          "Error rejoining socket room:",
          error
        );
      }
    });


    // =====================================================
    // DISCONNECT
    // =====================================================

    socketInstance.on("disconnect", (reason) => {

      console.log(
        "HeartSync Socket disconnected:",
        reason
      );
    });


    // =====================================================
    // CONNECTION ERROR
    // =====================================================

    socketInstance.on("connect_error", (error) => {

      console.warn(
        "HeartSync Socket connection error:",
        error.message
      );
    });


    // =====================================================
    // RECONNECTING
    // =====================================================

    socketInstance.io.on("reconnect_attempt", (attempt) => {

      console.log(
        `HeartSync Socket reconnect attempt: ${attempt}`
      );
    });


    // =====================================================
    // RECONNECTED
    // =====================================================

    socketInstance.io.on("reconnect", (attempt) => {

      console.log(
        `HeartSync Socket reconnected after ${attempt} attempt(s)`
      );


      // Rejoin room after reconnect
      try {

        const storedUser =
          localStorage.getItem("heartsync_user");

        if (storedUser) {

          const user = JSON.parse(storedUser);

          if (user?.id) {

            socketInstance.emit(
              "join_room",
              user.id
            );
          }
        }

      } catch (error) {

        console.error(
          "Error rejoining after reconnect:",
          error
        );
      }
    });
  }


  return socketInstance;
};


// =========================================================
// JOIN USER ROOM
// =========================================================

export const joinUserRoom = (userId) => {

  if (!userId) {
    console.warn(
      "Cannot join HeartSync room: userId missing"
    );

    return;
  }

  const socket = getSocket();

  if (socket) {

    if (socket.connected) {

      socket.emit(
        "join_room",
        userId
      );

      console.log(
        "Joined HeartSync room:",
        `user_${userId}`
      );

    } else {

      socket.once("connect", () => {

        socket.emit(
          "join_room",
          userId
        );

        console.log(
          "Joined HeartSync room after connection:",
          `user_${userId}`
        );
      });
    }
  }
};


// =========================================================
// SEND SOCKET MESSAGE
// =========================================================

export const sendSocketMessage = (
  senderId,
  receiverId,
  message
) => {

  if (!senderId || !receiverId || !message) {

    console.warn(
      "Cannot send message: missing sender, receiver or message"
    );

    return;
  }

  const socket = getSocket();

  if (socket) {

    socket.emit("send_message", {
      senderId,
      receiverId,
      message
    });

    console.log(
      "HeartSync message sent:",
      {
        senderId,
        receiverId
      }
    );
  }
};


// =========================================================
// DEFAULT EXPORT
// =========================================================

export default getSocket;
