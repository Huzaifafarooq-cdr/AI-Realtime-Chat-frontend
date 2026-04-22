'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

interface NavbarProps {
  user: User;
  chats: Chat[];
  selectedChat: string;
  onChatSelect: (chatId: string) => void;
}

export default function Navbar({ user, chats, selectedChat, onChatSelect }: NavbarProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'chats' | 'users'>('chats');
  const [searchQuery, setSearchQuery] = useState('');

  // User data for the Users tab
  const users: UserProfile[] = [
    {
      id: '1',
      name: 'Sarah Wilson',
      avatar: 'https://picsum.photos/seed/sarah/40/40.jpg',
      isOnline: true
    },
    {
      id: '2',
      name: 'James Rodriguez',
      avatar: 'https://picsum.photos/seed/james/40/40.jpg',
      isOnline: false
    },
    {
      id: '3',
      name: 'Elena Gilbert',
      avatar: 'https://picsum.photos/seed/elena/40/40.jpg',
      isOnline: true
    },
    {
      id: '4',
      name: 'Michael Brown',
      avatar: 'https://picsum.photos/seed/michael/40/40.jpg',
      isOnline: false
    }
  ];

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_avatar');
    router.push('/');
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">

      {/* Messages Section */}
      <div className="flex-1 flex flex-col">
        {/* Messages Title */}
        <div className="px-4 pt-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-3">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('chats')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === 'chats'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Users
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pt-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'chats' ? 'Search conversations...' : 'Search users...'}
              className="w-full pl-10 pr-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Chat List or User List */}
        <div className="flex-1 overflow-y-auto mt-4">
          {activeTab === 'chats' ? (
            // Chat list
            filteredChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedChat === chat.id ? 'bg-blue-50' : ''
                }`}
              >
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-900 truncate">{chat.name}</p>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {chat.lastMessage || 'No messages'}
                  </p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                    {chat.unread}
                  </div>
                )}
              </div>
            ))
          ) : (
            // User list
            users
              .filter(user => 
                user.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className={`text-sm ${
                      user.isOnline ? 'text-green-500' : 'text-gray-500'
                    }`}>
                      {user.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* User Account Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-600">My Account</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
