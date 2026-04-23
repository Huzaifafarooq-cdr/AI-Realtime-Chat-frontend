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

interface Props {
  user: User;
  chats: Chat[];
  selectedChat: string;
  onChatSelect: (id: string) => void;
}

export default function Navbar({
  user,
  chats,
  selectedChat,
  onChatSelect,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"chats" | "users">("chats");
  const [search, setSearch] = useState("");

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const logout = () => {
    localStorage.removeItem("auth_token");
    router.push("/");
  };

  return (
    <div className="w-80 bg-white border-r flex flex-col">
      {/* HEADER */}
      <div className="p-4 font-semibold text-lg">Messages</div>

      {/* TABS */}
      <div className="flex px-4 gap-4 text-sm">
        <button
          onClick={() => setTab("chats")}
          className={tab === "chats" ? "text-blue-600" : "text-gray-500"}
        >
          Chats
        </button>
        <button
          onClick={() => setTab("users")}
          className={tab === "users" ? "text-blue-600" : "text-gray-500"}
        >
          Users
        </button>
      </div>

      {/* SEARCH */}
      <div className="p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 bg-gray-100 rounded"
          placeholder="Search..."
        />
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onChatSelect(chat.id)}
            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 ${
              selectedChat === chat.id ? "bg-blue-50" : ""
            }`}
          >
            <img
              src={chat.avatar}
              className="w-10 h-10 rounded-full"
            />

            <div>
              <p className="font-medium">{chat.name}</p>
              <p className="text-xs text-gray-500">
                {chat.lastMessage || "Start chat"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t flex items-center gap-3">
        <img src={user.avatar} className="w-10 h-10 rounded-full" />

        <div className="flex-1">
          <p className="font-medium">{user.name}</p>
          <p className="text-xs text-gray-500">My Account</p>
        </div>

        <button onClick={logout} className="text-red-500">
          Logout
        </button>
      </div>
    </div>
  );
}