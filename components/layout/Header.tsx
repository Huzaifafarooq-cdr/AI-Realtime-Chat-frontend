"use client";

interface User {
  name: string;
  email: string;
  avatar: string;
  isPremium?: boolean;
}

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold">
            AI
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">
              AI Real Chat
            </h1>
            <p className="text-xs text-gray-500">
              Smart Messaging Platform
            </p>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {user.name}
            </p>
            <p className="text-xs text-gray-500">
              {user.email}
            </p>
          </div>

          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full border"
          />

        </div>
      </div>
    </header>
  );
}