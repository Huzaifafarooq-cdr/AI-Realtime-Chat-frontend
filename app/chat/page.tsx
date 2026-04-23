'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Header from '../../components/layout/Header';
import Navbar from '../../components/layout/Navbar';
import { connectSocket, getSocket } from '@/lib/socket';
import AIButton from "@/components/chat/AIButton";
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
  sender: 'user' | 'other';
  timestamp: string;
}

export default function ChatPage() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>('');
  const [premium, setPremium] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      router.push('/');
      return;
    }

    try {
      const decoded: any = jwtDecode(token);

      setUser({
        id: decoded.id || decoded._id,
        name: decoded.name,
        email: decoded.email,
        avatar:
          decoded.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(decoded.name)}`,
        isPremium: decoded.isPremium,
      });

      const savedUsers = JSON.parse(localStorage.getItem('chat_users') || '[]');

      const formattedChats: Chat[] = savedUsers.map((item: any) => ({
        id: item.id,
        name: item.name,
        avatar: item.avatar,
        lastMessage: item.lastMessage || '',
        time: item.time || '',
        unread: item.unread || 0,
      }));

      setChats(formattedChats);

      if (formattedChats.length > 0) {
        setSelectedChat(formattedChats[0].id);
      }

      const socket = connectSocket(token);

      socket.emit('check_premium');

      socket.on('premium_status', (data: any) => {
        setPremium(data.isPremium);
      });

      socket.on('receive_message', (data: any) => {
        setMessages((prev) => [
          ...prev,
          {
            id: data._id,
            text: data.message,
            sender: 'other',
            timestamp: new Date(data.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
      });

      socket.on('message_sent', (data: any) => {
        setMessages((prev) => [
          ...prev,
          {
            id: data._id,
            text: data.message,
            sender: 'user',
            timestamp: new Date(data.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
      });

      socket.on('suggestions', (data: any) => {
        setSuggestions(Array.isArray(data) ? data : [data]);
      });

      socket.on('suggestions_locked', () => {
        alert('Upgrade to premium to unlock AI suggestions');
      });

      return () => {
        socket.off('premium_status');
        socket.off('receive_message');
        socket.off('message_sent');
        socket.off('suggestions');
        socket.off('suggestions_locked');
      };
    } catch (error) {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;

    getSocket()?.emit('send_message', {
      receiverId: selectedChat,
      message,
    });

    setMessage('');
    setSuggestions([]);
  };

  const handleSuggestions = () => {
    if (!message.trim()) return;

    getSocket()?.emit('get_suggestions', {
      text: message,
    });
  };

  if (!user) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        Loading...
      </div>
    );
  }

  const currentChat = chats.find((chat) => chat.id === selectedChat);

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <Header user={user} />

      <div className='flex flex-1'>
        <Navbar
          user={user}
          chats={chats}
          selectedChat={selectedChat}
          onChatSelect={setSelectedChat}
        />

        <div className='flex-1 flex flex-col'>
          <div className='bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              {currentChat && (
                <img
                  src={currentChat.avatar}
                  className='w-10 h-10 rounded-full'
                  alt='avatar'
                />
              )}

              <div>
                <h3 className='font-semibold text-gray-900'>
                  {currentChat?.name || 'Select Chat'}
                </h3>
                <p className='text-sm text-green-500'>Online</p>
              </div>
            </div>

            <div>
              <span className='text-sm font-medium'>
                {premium ? 'Premium User' : 'Free User'}
              </span>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-6 bg-gray-50'>
            <div className='max-w-3xl mx-auto space-y-4'>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className='text-xs mt-1 opacity-70'>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}

              <div ref={bottomRef}></div>
            </div>
          </div>

          <div className='bg-white border-t border-gray-200 px-6 py-4'>
            <div className='max-w-3xl mx-auto space-y-2'>
              {suggestions.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {suggestions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(item)}
                      className='px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200'
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}

              <div className='flex gap-2'>
                <input
                  type='text'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && handleSendMessage()
                  }
                  placeholder='Type a message...'
                  className='flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none'
                />

<AIButton
  isPremium={premium}
  message={message}
/>

                <button
                  onClick={handleSendMessage}
                  className='px-5 py-2 bg-blue-500 text-white rounded-full'
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}