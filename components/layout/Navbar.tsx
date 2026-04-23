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
      {/* Title */}
      <div className="px-4 pt-5">
        <h2 className="text-xl font-semibold text-gray-900">
          Messages
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Manage chats and users
        </p>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex gap-6 border-b border-gray-100">
          <button
            onClick={() => setActiveTab("chats")}
            className={`pb-2 text-sm font-medium transition ${
              activeTab === "chats"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Chats
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`pb-2 text-sm font-medium transition ${
              activeTab === "users"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Users
          </button>
        </div>
      </div>



      {/* List */}
      <div className="flex-1 overflow-y-auto mt-4">
        {filteredChats.length === 0 ? (
          <p className="text-center text-sm text-gray-400 mt-8">
            {activeTab === "chats"
              ? "No chats yet"
              : "No users found"}
          </p>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition ${
                selectedChat === chat.id
                  ? "bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-11 h-11 rounded-full object-cover"
              />

              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="font-medium text-gray-900 truncate">
                    {chat.name}
                  </p>

                  {activeTab === "chats" && chat.time && (
                    <span className="text-xs text-gray-400">
                      {chat.time}
                    </span>
                  )}
                </div>

                <p
                  className={`text-sm truncate ${
                    activeTab === "users"
                      ? "text-green-500"
                      : "text-gray-500"
                  }`}
                >
                  {activeTab === "users"
                    ? "Start chat"
                    : chat.lastMessage || "No messages"}
                </p>
              </div>

              {activeTab === "chats" && chat.unread > 0 && (
                <div className="min-w-[20px] h-5 px-1 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center">
                  {chat.unread}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer User */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />

          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition text-lg"
            title="Logout"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}