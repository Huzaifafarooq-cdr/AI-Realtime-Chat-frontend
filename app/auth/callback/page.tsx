'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(error);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Mock authentication - simulate successful auth
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Store mock user data in localStorage instead of cookies
        localStorage.setItem('auth_token', 'mock_token_' + Date.now());
        localStorage.setItem('user_avatar', 'https://picsum.photos/seed/farooq/40/40.jpg');
        localStorage.setItem('user_name', 'Farooq Huzaifa');
        localStorage.setItem('user_email', 'farooq.huzaifa@example.com');

        router.push('/chat');
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
