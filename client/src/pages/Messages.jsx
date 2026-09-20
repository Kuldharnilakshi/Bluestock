import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./Messages.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getSocket, joinUserRoom, sendSocketMessage } from "../services/socket";

const defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop";

function Messages() {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get("user");

  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [search, setSearch] = useState("");
  const [inputText, setInputText] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Load matches to populate conversations
  useEffect(() => {
    async function loadMatches() {
      setLoadingChats(true);
      try {
        const data = await api.matches.getMatches();
        const matchesList = (data.matches || []).map((m) => ({
          id: m.id,
          name: m.name,
          image: m.profile_pic || defaultAvatar,
          city: m.city || "Nearby",
          age: m.age || 23,
          online: true,
          lastMessage: "You matched! Start the conversation."
        }));

        setConversations(matchesList);

        if (matchesList.length > 0) {
          // If query param ?user=<id> exists, select that user
          if (targetUserId) {
            const found = matchesList.find((c) => c.id === parseInt(targetUserId, 10));
            setSelectedChat(found || matchesList[0]);
          } else {
            setSelectedChat(matchesList[0]);
          }
        }
      } catch (err) {
        console.error("Error loading conversations:", err);
      } finally {
        setLoadingChats(false);
      }
    }

    loadMatches();
  }, [targetUserId]);

  // Join user room on mount
  useEffect(() => {
    if (currentUser?.id) {
      joinUserRoom(currentUser.id);
    }
  }, [currentUser]);

  // Load message history when selectedChat changes
  useEffect(() => {
    if (!selectedChat?.id) return;

    async function loadHistory() {
      setLoadingMessages(true);
      try {
        const data = await api.messages.getHistory(selectedChat.id);
        setChatMessages(data.messages || []);
      } catch (err) {
        console.error("Error loading message history:", err);
      } finally {
        setLoadingMessages(false);
      }
    }

    loadHistory();
  }, [selectedChat?.id]);

  // Listen for socket events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      // If message is from current chat or sent by me to current chat
      if (
        (selectedChat && msg.sender_id === selectedChat.id) ||
        (selectedChat && msg.receiver_id === selectedChat.id && msg.sender_id === currentUser?.id)
      ) {
        setChatMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.sender_id || c.id === msg.receiver_id
            ? { ...c, lastMessage: msg.message }
            : c
        )
      );
    };

    const handleMessageSent = (msg) => {
      if (selectedChat && msg.receiver_id === selectedChat.id) {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.sender_id || c.id === msg.receiver_id
            ? { ...c, lastMessage: msg.message }
            : c
        )
      );
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_sent", handleMessageSent);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_sent", handleMessageSent);
    };
  }, [selectedChat, currentUser]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedChat || !currentUser) return;

    const text = inputText.trim();
    setInputText("");

    const socket = getSocket();
    if (socket && socket.connected) {
      sendSocketMessage(currentUser.id, selectedChat.id, text);
    } else {
      // Fallback via REST if socket not connected
      try {
        const saved = await api.messages.send(selectedChat.id, text);
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === saved.id)) return prev;
          return [...prev, saved];
        });
        setConversations((prev) =>
          prev.map((c) =>
            c.id === saved.sender_id || c.id === saved.receiver_id
              ? { ...c, lastMessage: saved.message }
              : c
          )
        );
      } catch (err) {
        console.error("REST send message error:", err);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (dateStr) => {
    if (!dateStr) return "Now";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Now";
    }
  };

  return (
    <>
      <Navbar />
      <div className="messages-page">
        {/* LEFT SIDEBAR */}
        <aside className="messages-sidebar">
          <div className="messages-heading">
            <div>
              <span className="messages-label">YOUR CONNECTIONS</span>
              <h1>Messages</h1>
            </div>

            <Link to="/discover" className="new-message-btn" title="Discover new connections">
              <span>＋</span>
            </Link>
          </div>

          {/* Search */}
          <div className="message-search">
            <span className="search-icon">⌕</span>

            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button className="clear-search" onClick={() => setSearch("")}>
                ×
              </button>
            )}
          </div>

          {/* Conversation list */}
          <div className="conversation-list">
            {loadingChats ? (
              <div style={{ padding: "30px 20px", color: "#68758d", textAlign: "center" }}>
                Loading conversations...
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((chat) => (
                <button
                  key={chat.id}
                  className={`conversation ${
                    selectedChat?.id === chat.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="conversation-avatar">
                    <img src={chat.image} alt={chat.name} />
                    {chat.online && <span className="online-dot"></span>}
                  </div>

                  <div className="conversation-info">
                    <div className="conversation-top">
                      <h3>{chat.name}</h3>
                      <span>{chat.city}</span>
                    </div>

                    <div className="conversation-bottom">
                      <p>{chat.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="no-results">
                <span>♡</span>
                <p>No conversations yet</p>
                <Link
                  to="/discover"
                  style={{
                    color: "#ec4899",
                    fontSize: "12px",
                    marginTop: "8px",
                    textDecoration: "none",
                    fontWeight: "600"
                  }}
                >
                  Match on Discover →
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* CHAT AREA */}
        <main className="chat-area">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <header className="chat-header">
                <div className="chat-user">
                  <div className="chat-avatar">
                    <img src={selectedChat.image} alt={selectedChat.name} />
                    {selectedChat.online && <span className="chat-online-dot"></span>}
                  </div>

                  <div>
                    <h2>{selectedChat.name}</h2>
                    <p>
                      <span className="status-online"></span>
                      Active now • {selectedChat.city}
                    </p>
                  </div>
                </div>

                <div className="chat-actions">
                  <Link
                    to="/discover"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                      color: "#ec4899",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}
                  >
                    Discover
                  </Link>
                </div>
              </header>

              {/* Messages Container */}
              <div className="chat-messages">
                <div className="match-date">
                  <span>You matched with {selectedChat.name}</span>
                </div>

                <div className="match-card">
                  <div className="match-image">
                    <img src={selectedChat.image} alt={selectedChat.name} />
                    <span>♥</span>
                  </div>

                  <div>
                    <strong>It's a match!</strong>
                    <p>You and {selectedChat.name} liked each other.</p>
                  </div>
                </div>

                {loadingMessages ? (
                  <div style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>
                    Loading messages...
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#7f8ba3", padding: "30px 15px", fontSize: "14px" }}>
                    👋 Say hello to {selectedChat.name}! Don't leave them hanging.
                  </div>
                ) : (
                  <div className="messages-container">
                    {chatMessages.map((msg) => {
                      const isMine = msg.sender_id === currentUser?.id;
                      return (
                        <div
                          key={msg.id || `${msg.sender_id}-${msg.created_at}`}
                          className={`message-row ${isMine ? "mine" : "theirs"}`}
                        >
                          {!isMine && (
                            <img
                              className="tiny-avatar"
                              src={selectedChat.image}
                              alt={selectedChat.name}
                            />
                          )}

                          <div className="message-content">
                            <div className="message-bubble">{msg.message}</div>
                            <span className="message-time">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Cute Quick Emoji Bar */}
              <div className="quick-emojis-bar">
                {["💖", "✨", "😍", "🥺", "🌸", "☕", "🎉"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="quick-emoji-btn"
                    onClick={() => setInputText((prev) => prev + emoji)}
                    title={`Add ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Message Input */}
              <div className="message-input-wrapper">
                <input
                  type="text"
                  placeholder={`Message ${selectedChat.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <button
                  className={`send-btn ${inputText.trim() ? "ready" : ""}`}
                  onClick={handleSendMessage}
                  title="Send message"
                  type="button"
                >
                  ➤
                </button>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                padding: "20px",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "50px", marginBottom: "15px" }}>💬</div>
              <h2 style={{ color: "#fff", marginBottom: "8px" }}>No Conversation Selected</h2>
              <p style={{ maxWidth: "350px", lineHeight: "1.6", marginBottom: "20px" }}>
                Select a match from the left panel to start chatting, or swipe on Discover to find new matches!
              </p>
              <Link
                to="/discover"
                style={{
                  padding: "12px 24px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: "700"
                }}
              >
                Go to Discover
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default Messages;