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
    <header className="w-full bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Side - Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow">
            AI
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              AI Real Chat
            </h1>
            <p className="text-sm text-gray-500">
              Real-time Smart Messaging
            </p>
          </div>
        </div>

        {/* Right Side - User Info */}
        <div className="flex items-center gap-4">
          {/* Text Info */}
          <div className="text-right leading-tight">
            <p className="text-sm text-gray-500">
              Logged in as
            </p>

            <p className="text-base font-semibold text-gray-900">
              {user.name}
            </p>

            <p className="text-sm text-gray-500 truncate max-w-[220px]">
              {user.email}
            </p>
          </div>

          {/* Avatar */}
          <img
            src={user.avatar}
            alt={user.name}
            className="w-11 h-11 rounded-full border-2 border-gray-200 object-cover"
          />

          {/* Status Badge */}
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              user.isPremium
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                : "bg-gray-100 text-gray-700 border border-gray-200"
            }`}
          >
            {user.isPremium ? "⭐ Premium" : "Free Plan"}
          </span>
        </div>
      </div>
    </header>
  );
}