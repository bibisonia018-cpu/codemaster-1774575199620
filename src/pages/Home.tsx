import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, User } from 'lucide-react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && roomCode.trim()) {
      // حفظ اسم المستخدم محلياً ليعرفه التطبيق في صفحة الدردشة
      localStorage.setItem('secret_chat_username', username.trim());
      navigate(`/chat/${roomCode.trim()}`);
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-dark-900 p-4">
      <div className="bg-dark-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-dark-700">
        <div className="text-center mb-8">
          <div className="bg-primary/20 p-4 rounded-full inline-block mb-4">
            <KeyRound className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">الدردشة السرية</h1>
          <p className="text-gray-400 text-sm">أدخل اسمك والكود السري للغرفة للبدء</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">الاسم المستعار</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full bg-dark-900 border border-dark-700 rounded-lg py-3 pl-3 pr-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="أدخل اسمك..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">الكود السري للغرفة</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                required
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="block w-full bg-dark-900 border border-dark-700 rounded-lg py-3 pl-3 pr-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="مثال: X7Y9Q..."
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-dark-900 bg-primary hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-dark-900 transition-colors"
          >
            دخول الغرفة السريــة
          </button>
        </form>
      </div>
    </div>
  );
}