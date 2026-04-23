// components/layout/Navbar.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface NavbarProps {
  user: User;
  chats: Chat[];
  selectedChat: string;
  activeTab: "chats" | "users";
  setActiveTab: (tab: "chats" | "users") => void;
  onChatSelect: (chat: any) => void;
}

export default function Navbar({
  user,
  chats,
  selectedChat,
  activeTab,
  setActiveTab,
  onChatSelect,
}: NavbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/");
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4">
        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("chats")}
            className={`pb-2 px-1 text-sm font-medium ${
              activeTab === "chats"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            Chats
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`pb-2 px-1 text-sm font-medium ${
              activeTab === "users"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            Users
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-4">
        <input
          type="text"
          placeholder={
            activeTab === "chats"
              ? "Search conversations..."
              : "Search users..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm outline-none"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto mt-4">
        {filteredChats.length === 0 ? (
          <p className="text-center text-sm text-gray-400 mt-6">
            {activeTab === "chats"
              ? "No chats yet"
              : "No users found"}
          </p>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat)}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${
                selectedChat === chat.id ? "bg-blue-50" : ""
              }`}
            >
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-12 h-12 rounded-full"
              />

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-gray-900 truncate">
                    {chat.name}
                  </p>

                  {activeTab === "chats" && chat.time && (
                    <span className="text-xs text-gray-500">
                      {chat.time}
                    </span>
                  )}
                </div>

                <p
                  className={`text-sm truncate ${
                    activeTab === "users"
                      ? "text-green-500"
                      : "text-gray-600"
                  }`}
                >
                  {activeTab === "users"
                    ? "Start chat"
                    : chat.lastMessage || "No messages"}
                </p>
              </div>

              {activeTab === "chats" && chat.unread > 0 && (
                <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                  {chat.unread}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full"
          />

          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {user.name}
            </p>
            <p className="text-sm text-gray-500">
              My Account
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-600"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}