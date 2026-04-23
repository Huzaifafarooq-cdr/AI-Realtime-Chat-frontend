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

interface Chat {
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
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [premium, setPremium] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= SOCKET INIT =================
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/");
      return;
    }

    const socket = connectSocket(token);

    const init = async () => {
      try {
        const decoded: any = jwtDecode(token);

        const currentUser: User = {
          id: decoded.id || decoded._id,
          name: decoded.name,
          email: decoded.email,
          avatar:
            decoded.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(decoded.name)}`,
          isPremium: decoded.isPremium,
        };

        setUser(currentUser);

        await loadUsers();

        socket.emit("check_premium");

        socket.on("premium_status", (data: any) => {
          setPremium(data.isPremium);
        });

        socket.on("receive_message", (data: any) => {
          setMessages((prev) => [
            ...prev,
            {
              id: data._id,
              text: data.message,
              sender: "other",
              timestamp: new Date(data.createdAt).toLocaleTimeString(),
            },
          ]);
        });

        socket.on("message_sent", (data: any) => {
          setMessages((prev) => [
            ...prev,
            {
              id: data._id,
              text: data.message,
              sender: "user",
              timestamp: new Date(data.createdAt).toLocaleTimeString(),
            },
          ]);
        });

        socket.on("suggestions", (data: any) => {
          setSuggestions(Array.isArray(data) ? data : [data]);
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        router.push("/");
      }
    };

    init();

    return () => {
      socket.disconnect();
    };
  }, []);

  // ================= AUTO SCROLL =================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ================= LOAD USERS =================
  const loadUsers = async () => {
    const token = localStorage.getItem("auth_token");

    const res = await fetch(`${API_URL}/user/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.success) {
      const formatted = data.users.map((u: any) => ({
        id: u._id,
        name: u.name,
        avatar:
          u.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`,
        lastMessage: "",
        time: "",
        unread: 0,
      }));

      setChats(formatted);

      if (!selectedChat && formatted.length > 0) {
        setSelectedChat(formatted[0].id);
      }
    }
  };

  // ================= LOAD MESSAGES =================
  const loadMessages = async (receiverId: string) => {
    const token = localStorage.getItem("auth_token");

    const res = await fetch(`${API_URL}/messages/${receiverId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (data.success) {
      const formatted = data.messages.map((m: any) => ({
        id: m._id,
        text: m.message,
        sender: m.senderId === user?.id ? "user" : "other",
        timestamp: new Date(m.createdAt).toLocaleTimeString(),
      }));

      setMessages(formatted);
    }
  };

  useEffect(() => {
    if (selectedChat && user) loadMessages(selectedChat);
  }, [selectedChat, user]);

  // ================= SEND MESSAGE =================
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
    if (!message.trim()) return;

    getSocket()?.emit("get_suggestions", { text: message });
  };

  // ================= UI =================
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const currentChat = chats.find((c) => c.id === selectedChat);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} />

      <div className="flex flex-1">
        <Navbar
          user={user}
          chats={chats}
          selectedChat={selectedChat}
          onChatSelect={setSelectedChat}
        />

        <div className="flex-1 flex flex-col">
          {/* HEADER */}
          <div className="bg-white border-b px-6 py-4 flex justify-between">
            <div className="flex items-center gap-3">
              {currentChat && (
                <img
                  src={currentChat.avatar}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <h3>{currentChat?.name || "Select Chat"}</h3>
                <p className="text-green-500 text-sm">Online</p>
              </div>
            </div>

            <span>{premium ? "Premium" : "Free"}</span>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="bg-gray-200 px-4 py-2 rounded-xl mb-2">
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef}></div>
          </div>

          {/* INPUT */}
          <div className="p-4 bg-white border-t">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border px-4 py-2 w-full rounded"
              placeholder="Type message..."
            />

            <div className="flex gap-2 mt-2">
              <button onClick={handleSuggestions}>AI</button>
              <button onClick={handleSendMessage}>Send</button>
            </div>

            {suggestions.length > 0 && (
              <div className="flex gap-2 mt-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(s)}
                    className="bg-gray-200 px-2 py-1 rounded"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}