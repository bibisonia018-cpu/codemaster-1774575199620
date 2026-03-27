import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Send, LogOut, ShieldCheck } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: string;
  createdAt: any;
}

export default function ChatRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentUser = localStorage.getItem('secret_chat_username');

  // التأكد من وجود اسم مستخدم
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // استدعاء الرسائل في الوقت الفعلي باستخدام onSnapshot
  useEffect(() => {
    if (!roomId) return;

    const messagesRef = collection(db, 'messages');
    // جلب رسائل الغرفة الحالية فقط وترتيبها حسب وقت الإرسال
    const q = query(
      messagesRef,
      where('roomId', '==', roomId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: Message[] = [];
      snapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(fetchedMessages);
    }, (error) => {
      console.error("خطأ في جلب الرسائل:", error);
      // ملاحظة: قد تحتاج لإنشاء Index في Firebase إذا ظهر هذا الخطأ
    });

    return () => unsubscribe();
  }, [roomId]);

  // التمرير للأسفل عند وصول رسالة جديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || !currentUser) return;

    const messageText = newMessage;
    setNewMessage(''); // إفراغ الحقل فوراً لتجربة مستخدم أسرع

    try {
      await addDoc(collection(db, 'messages'), {
        roomId: roomId,
        text: messageText,
        sender: currentUser,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("خطأ في إرسال الرسالة: ", error);
    }
  };

  const handleLeave = () => {
    navigate('/');
  };

  if (!currentUser) return null;

  return (
    <div className="flex flex-col h-full bg-dark-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-dark-800 border-b border-dark-700 shadow-md">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-primary w-6 h-6" />
          <div>
            <h2 className="text-white font-semibold">غرفة سرية</h2>
            <p className="text-xs text-primary font-mono" dir="ltr">ID: {roomId}</p>
          </div>
        </div>
        <button 
          onClick={handleLeave}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm bg-dark-900 px-3 py-2 rounded-lg"
        >
          <span>مغادرة</span>
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <ShieldCheck className="w-16 h-16 mb-4 opacity-20" />
            <p>لا توجد رسائل بعد. ابدأ المحادثة الآن!</p>
            <p className="text-sm mt-2">جميع الرسائل مشفرة ومقتصرة على هذه الغرفة.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === currentUser;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-gray-500 mb-1 px-1">{isMe ? 'أنت' : msg.sender}</span>
                <div 
                  className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                    isMe 
                      ? 'bg-primary text-dark-900 rounded-tr-none' 
                      : 'bg-dark-700 text-white rounded-tl-none'
                  }`}
                >
                  <p className="break-words">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-dark-800 border-t border-dark-700">
        <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 bg-dark-900 border border-dark-700 rounded-full px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-primary text-dark-900 p-3 rounded-full hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-6 h-6 rotate-180" /> {/* Rotate for RTL */}
          </button>
        </form>
      </footer>
    </div>
  );
}