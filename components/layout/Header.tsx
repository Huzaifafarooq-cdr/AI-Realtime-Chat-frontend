// components/layout/Header.tsx
"use client";

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  return (
    <div className="w-full bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
            <svg
              width="20"
              height="20"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 20C16 17.7909 17.7909 16 20 16H44C46.2091 16 48 17.7909 48 20V36C48 38.2091 46.2091 40 44 40H28L20 48V40C17.7909 40 16 38.2091 16 36V20Z"
                fill="white"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              AI Real Chat
            </h1>
            <p className="text-xs text-gray-500">
              Smart Messaging Platform
            </p>
          </div>
        </div>

        {/* Right User */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Welcome Back
            </p>
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
            className="w-10 h-10 rounded-full border border-gray-200 object-cover"
          />
        </div>
      </div>
    </div>
  );
}