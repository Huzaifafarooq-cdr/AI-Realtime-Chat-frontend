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

  console.log(user.name)
  console.log(user.email)
  console.log(user.avatar)
  return (
    <header className="w-full bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
            AI
          </div>

          <div className="min-w-0">
            <h1 className="font-bold text-gray-900 text-base sm:text-lg truncate">
              AI Real Chat
            </h1>

            <p className="text-xs text-gray-500 truncate">
              Smart Messaging Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 min-w-0">
          {/* Text */}
          <div className="text-right min-w-0 hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">
              {user.name}
            </p>

            <p className="text-xs text-gray-500 truncate max-w-[220px]">
              {user.email}
            </p>
          </div>

          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full border border-gray-300 object-cover shrink-0"
          />
        </div>
      </div>
    </header>
  );
}