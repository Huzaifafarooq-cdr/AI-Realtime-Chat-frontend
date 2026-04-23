// app/chat/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

import Header from "../../components/layout/Header";
import Navbar from "../../components/layout/Navbar";
import AIButton from "@/components/chat/AIButton";
import { connectSocket, getSocket } from "@/lib/socket";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isPremium?: boolean;
}

interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ChatPage() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [user, setUser] = useState<User | null>(null);

  const [users, setUsers] = useState<ChatItem[]>([]);
  const [chats, setChats] = useState<ChatItem[]>([]);

  const [activeTab, setActiveTab] = useState<"chats" | "users">("chats");
  const [selectedChat, setSelectedChat] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");

  const [premium, setPremium] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // INIT APP
  // =====================================================
  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      router.push("/");
      return;
    }

    const init = async () => {
      try {
        const decoded: any = jwtDecode(token);

        const currentUser: User = {
          id: decoded.id || decoded._id,
          name: decoded.name,
          email: decoded.email,
          avatar:
            decoded.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              decoded.name
            )}`,
          isPremium: decoded.isPremium,
        };

        setUser(currentUser);

        await loadSidebarChats();
        await loadUsers();

        const socket = connectSocket(token);

        socket.emit("check_premium");

        socket.on("premium_status", (data: any) => {
          setPremium(data.isPremium);
        });

        socket.on("message_sent", (data: any) => {
          const newMsg = {
            id: data._id,
            text: data.message,
            sender: "user" as const,
            timestamp: formatTime(data.createdAt),
          };

          setMessages((prev) => [...prev, newMsg]);
          loadSidebarChats();
        });

        socket.on("receive_message", (data: any) => {
          if (
            data.senderId === selectedChat ||
            data.receiverId === selectedChat
          ) {
            const newMsg = {
              id: data._id,
              text: data.message,
              sender: "other" as const,
              timestamp: formatTime(data.createdAt),
            };

            setMessages((prev) => [...prev, newMsg]);
          }

          loadSidebarChats();
        });

        socket.on("suggestions", (data: any) => {
          setSuggestions(Array.isArray(data) ? data : [data]);
        });

        setLoading(false);

        return () => {
          socket.disconnect();
        };
      } catch (error) {
        router.push("/");
      }
    };

    init();
  }, [router, selectedChat]);

  // =====================================================
  // AUTO SCROLL
  // =====================================================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =====================================================
  // LOAD MESSAGES WHEN CHAT CHANGES
  // =====================================================
  useEffect(() => {
    if (selectedChat && user) {
      loadMessages(selectedChat);
    }
  }, [selectedChat, user]);

  // =====================================================
  // HELPERS
  // =====================================================
  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  // =====================================================
  // LOAD SIDEBAR CHATS
  // =====================================================
  const loadSidebarChats = async () => {
    try {
      const token = localStorage.getItem("auth_token");

      const res = await fetch(`${API_URL}/messages/sidebar`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setChats(data.chats);

        if (!selectedChat && data.chats.length > 0) {
          setSelectedChat(data.chats[0].id);
        }
      }
    } catch (error) {
      console.error("Sidebar error:", error);
    }
  };

  // =====================================================
  // LOAD ALL USERS
  // =====================================================
  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("auth_token");

      const res = await fetch(`${API_URL}/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        const formatted = data.users.map((item: any) => ({
          id: item._id,
          name: item.name,
          avatar:
            item.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}`,
          lastMessage: "",
          time: "",
          unread: 0,
        }));

        setUsers(formatted);
      }
    } catch (error) {
      console.error("Users error:", error);
    }
  };

  // =====================================================
  // LOAD CHAT HISTORY
  // =====================================================
  const loadMessages = async (receiverId: string) => {
    try {
      const token = localStorage.getItem("auth_token");

      const res = await fetch(`${API_URL}/messages/${receiverId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        const formatted = data.messages.map((item: any) => ({
          id: item._id,
          text: item.message,
          sender: item.senderId === user?.id ? "user" : "other",
          timestamp: formatTime(item.createdAt),
        }));

        setMessages(formatted);
      } else {
        setMessages([]);
      }
    } catch (error) {
      setMessages([]);
    }
  };

  // =====================================================
  // START CHAT FROM USERS TAB
  // =====================================================
  const handleSelectUser = (chatUser: ChatItem) => {
    const exists = chats.find((item) => item.id === chatUser.id);

    if (!exists) {
      setChats((prev) => [chatUser, ...prev]);
    }

    setSelectedChat(chatUser.id);
    setActiveTab("chats");
  };

  // =====================================================
  // SELECT CHAT FROM CHAT TAB
  // =====================================================
  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId);
    setActiveTab("chats");
  };

  // =====================================================
  // SEND MESSAGE
  // =====================================================
  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;

    getSocket()?.emit("send_message", {
      receiverId: selectedChat,
      message,
    });

    setMessage("");
    setSuggestions([]);
  };

  // =====================================================
  // AI SUGGESTIONS
  // =====================================================
  const handleSuggestions = () => {
    if (!message.trim()) return;

    getSocket()?.emit("get_suggestions", {
      text: message,
    });
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const currentList = activeTab === "chats" ? chats : users;

  const currentChat = [...chats, ...users].find(
    (item) => item.id === selectedChat
  );

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} />

      <div className="flex flex-1">
        <Navbar
          user={user}
          chats={currentList}
          selectedChat={selectedChat}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onChatSelect={
            activeTab === "users" ? handleSelectUser : handleSelectChat
          }
        />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b px-6 py-4 flex justify-between">
            <div className="flex items-center gap-3">
              {currentChat && (
                <img
                  src={currentChat.avatar}
                  className="w-10 h-10 rounded-full"
                />
              )}

              <div>
                <h3 className="font-semibold">
                  {currentChat?.name || "Select Chat"}
                </h3>
                <p className="text-sm text-green-500">Online</p>
              </div>
            </div>

            <span>
              {premium ? "Premium User" : "Free User"}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-gray-400">
                  No messages yet. Start chatting 🚀
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-xs ${
                        msg.sender === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              )}

              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          <div className="bg-white border-t px-6 py-4">
            <div className="max-w-3xl mx-auto space-y-2">
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setMessage(item)}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSendMessage()
                  }
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none"
                />

                <div onClick={handleSuggestions}>
                  <AIButton
                    isPremium={premium}
                    message={message}
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  className="px-5 py-2 bg-blue-500 text-white rounded-full"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}