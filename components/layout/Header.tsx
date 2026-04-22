'use client';

import { useRouter } from 'next/navigation';

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_avatar');
    router.push('/');
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Nexus Chat Logo */}
        <div className="flex items-center gap-2">
          {/* Blue speech bubble icon */}
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
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
          <h1 className="text-lg font-semibold text-gray-900">Nexus Chat</h1>
        </div>

        {/* Right: User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider">WELCOME BACK</p>
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
          </div>
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
