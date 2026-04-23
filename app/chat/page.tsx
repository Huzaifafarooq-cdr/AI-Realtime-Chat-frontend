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
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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
  const [showPopup, setShowPopup] = useState(false);

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

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
        setChats(data.chats || []);

        setSelectedChat((prev) => {
          if (prev) return prev;
          if (data.chats.length > 0) return data.chats[0].id;
          return "";
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

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
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              item.name
            )}`,
          lastMessage: "",
          time: "",
          unread: 0,
        }));

        setUsers(formatted);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadMessages = async (receiverId: string) => {
    try {
      if (!receiverId) return;

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
          sender:
            String(item.senderId) === String(user?.id)
              ? "user"
              : "other",
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
          if (data.isPremium) setShowPopup(false);
        });

        socket.on("message_sent", (data: any) => {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === data._id);
            if (exists) return prev;

            return [
              ...prev,
              {
                id: data._id,
                text: data.message,
                sender: "user",
                timestamp: formatTime(data.createdAt),
              },
            ];
          });

          loadSidebarChats();
        });

        socket.on("receive_message", (data: any) => {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === data._id);
            if (exists) return prev;

            if (
              String(data.senderId) === String(selectedChat) ||
              String(data.receiverId) === String(selectedChat)
            ) {
              return [
                ...prev,
                {
                  id: data._id,
                  text: data.message,
                  sender: "other",
                  timestamp: formatTime(data.createdAt),
                },
              ];
            }

            return prev;
          });

          loadSidebarChats();
        });

        socket.on("suggestions", (data: any) => {
          setSuggestions(Array.isArray(data) ? data : [data]);
        });

        setLoading(false);
      } catch (error) {
        router.push("/");
      }
    };

    init();
  }, [router, selectedChat]);

  useEffect(() => {
    if (selectedChat && user) {
      loadMessages(selectedChat);
    }
  }, [selectedChat, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!premium) return;

    if (!message.trim()) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      getSocket()?.emit("get_suggestions", {
        text: message,
      });
    }, 700);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [message, premium]);

  const handleSelectUser = (chatId: string) => {
    const selectedUser = users.find((u) => u.id === chatId);
    if (!selectedUser) return;

    const exists = chats.find((c) => c.id === chatId);

    if (!exists) {
      setChats((prev) => [selectedUser, ...prev]);
    }

    setSelectedChat(chatId);
    setActiveTab("chats");
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId);
    setActiveTab("chats");
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;

    getSocket()?.emit("send_message", {
      receiverId: selectedChat,
      message,
    });

    setMessage("");
    setSuggestions([]);
  };

  const handleSuggestions = () => {
    if (!premium) {
      setShowPopup(true);
      return;
    }

    if (!message.trim()) return;

    getSocket()?.emit("get_suggestions", {
      text: message,
    });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  const currentList = activeTab === "chats" ? chats : users;

  const currentChat = [...chats, ...users].find(
    (item) => item.id === selectedChat
  );

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      <Header user={user} />

      <div className="flex flex-1 overflow-hidden">
        <Navbar
          user={user}
          chats={currentList}
          selectedChat={selectedChat}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onChatSelect={
            activeTab === "users"
              ? handleSelectUser
              : handleSelectChat
          }
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              {currentChat && (
                <img
                  src={currentChat.avatar}
                  alt="avatar"
                  className="w-11 h-11 rounded-full object-cover"
                />
              )}

              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {currentChat?.name || "Select Chat"}
                </h3>
                <p className="text-sm text-green-500">Online</p>
              </div>
            </div>

            <div
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                premium
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700"
              }`}
            >
              {premium ? "✨ Premium User" : "🆓 Free User"}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-gray-400 py-10">
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
                      className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm ${
                        msg.sender === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-white border text-gray-900"
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

              <div ref={bottomRef}></div>
            </div>
          </div>

          <div className="bg-white border-t px-6 py-4">
            <div className="max-w-3xl mx-auto space-y-3">
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(item)}
                      className="px-3 py-1 rounded-full bg-gray-100 text-sm hover:bg-blue-100 hover:text-blue-600 transition"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSendMessage()
                  }
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 rounded-full bg-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div
                  onClick={handleSuggestions}
                  className="cursor-pointer hover:scale-110 transition"
                >
                  <AIButton
                    isPremium={premium}
                    message={message}
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="text-center">
              <div className="text-4xl mb-3">✨</div>
              <h2 className="text-2xl font-bold text-gray-900">
                Unlock AI Features
              </h2>
              <p className="text-gray-500 mt-2">
                Upgrade to premium and enjoy smart AI replies.
              </p>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => {
                    setShowPopup(false);
                    router.push("/pricing");
                  }}
                  className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition"
                >
                  Upgrade Now
                </button>

                <button
                  onClick={() => setShowPopup(false)}
                  className="w-full bg-gray-100 py-3 rounded-xl hover:bg-gray-200 transition"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}