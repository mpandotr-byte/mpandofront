import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Trash2,
  CheckCircle,
  User,
  Clock,
  Mail,
  MailOpen,
  ArrowLeft,
  Filter,
  CheckCircle2,
  AlertCircle,
  Send,
  MoreVertical,
  Paperclip,
  Plus,
  Users,
  Megaphone,
  Loader2,
  X,
  MessageSquarePlus
} from 'lucide-react';

// Relative timestamp helper
function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Az önce';
  if (diffMin < 60) return `${diffMin} dk önce`;
  if (diffHour < 24) return `${diffHour} saat önce`;
  if (diffDay < 7) return `${diffDay} gün önce`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function formatMessageTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function Messages() {
  const { user: currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Loading states
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // New message modal
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const chatEndRef = useRef(null);
  const messagesPollingRef = useRef(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const data = await api.get('/messages');
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Konuşmalar yüklenemedi:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // Fetch messages for a specific user
  const fetchMessages = useCallback(async (userId) => {
    setLoadingMessages(true);
    try {
      const data = await api.get(`/messages/${userId}`);
      setMessages(data.messages || []);
      setSelectedUser(data.otherUser || null);
    } catch (err) {
      console.error('Mesajlar yüklenemedi:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // On mount: fetch conversations
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // When selecting a conversation: fetch messages and start polling
  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);

      // Poll for new messages every 5 seconds
      messagesPollingRef.current = setInterval(() => {
        fetchMessages(selectedUserId);
      }, 5000);
    }

    return () => {
      if (messagesPollingRef.current) {
        clearInterval(messagesPollingRef.current);
        messagesPollingRef.current = null;
      }
    };
  }, [selectedUserId, fetchMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv => {
    const name = conv.user?.full_name || '';
    const email = conv.user?.email || '';
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId || sendingMessage) return;

    setSendingMessage(true);
    try {
      await api.post('/messages', {
        receiver_id: selectedUserId,
        content: newMessage.trim()
      });
      setNewMessage('');
      // Refresh messages and conversations
      await Promise.all([
        fetchMessages(selectedUserId),
        fetchConversations()
      ]);
    } catch (err) {
      console.error('Mesaj gönderilemedi:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Select conversation
  const handleSelectConversation = async (conv) => {
    const userId = conv.user?.id;
    if (!userId) return;
    setSelectedUserId(userId);
    setSelectedUser(conv.user);

    // Mark unread messages as read — update locally first
    if (conv.unreadCount > 0) {
      setConversations(prev => prev.map(c =>
        c.user?.id === userId ? { ...c, unreadCount: 0 } : c
      ));
    }
  };

  // New Message: fetch users
  const handleOpenNewMessage = async () => {
    setShowNewMessageModal(true);
    setLoadingUsers(true);
    setUserSearchQuery('');
    try {
      const data = await api.get('/users');
      // Filter out current user
      const users = (data.users || data || []).filter(u => u.id !== currentUser?.id);
      setAllUsers(users);
    } catch (err) {
      console.error('Kullanıcılar yüklenemedi:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Select user from new message modal
  const handleSelectNewUser = (user) => {
    setShowNewMessageModal(false);
    setSelectedUserId(user.id);
    setSelectedUser(user);
    setMessages([]);
    fetchMessages(user.id);
    fetchConversations();
  };

  // Filter users in modal
  const filteredUsers = allUsers.filter(u => {
    const q = userSearchQuery.toLowerCase();
    const name = u.full_name || '';
    const email = u.email || '';
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />

      <main className="flex-1 flex flex-col h-screen">
        <Navbar title="İletişim & Mesajlar" toggleMobileMenu={toggleMobileMenu} />

        <div className="flex-1 p-0 lg:p-6 xl:p-8 overflow-hidden">
          <div className="h-full flex flex-col gap-6">

            {/* Page Header */}
            <div className="hidden lg:flex flex-col md:flex-row md:items-center justify-between gap-5 px-4 md:px-0">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-black text-[#0A1128] tracking-tight">Mesaj Merkezi</h1>
                <p className="text-sm text-slate-500 font-medium">Ekibinizle anlık iletişim kurun ve süreçleri yönetin.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center justify-center gap-2 px-5 py-3 bg-[#0A1128] text-white rounded-2xl font-bold text-sm transition-all hover:bg-slate-900 shadow-lg shadow-slate-200">
                  <Megaphone size={18} />
                  <span className="hidden sm:inline">Tümüne Duyuru Yap</span>
                </button>
                <button
                  onClick={handleOpenNewMessage}
                  className="flex items-center justify-center w-12 h-12 bg-[#D36A47] text-white rounded-2xl font-bold transition-all hover:bg-[#C25936] shadow-lg shadow-[#D36A47]/20"
                  title="Yeni Mesaj"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white lg:rounded-[32px] lg:border border-slate-200/60 lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex overflow-hidden lg:border-b-8 lg:border-b-[#0A1128]/5 shadow-inner">

              {/* SOL PANEL: KONUŞMA LİSTESİ */}
              <div className={`w-full lg:w-[320px] xl:w-[380px] flex flex-col border-r border-slate-100 bg-white ${selectedUserId ? 'hidden lg:flex' : 'flex'}`}>

                {/* Arama Barı + Yeni Mesaj (mobil) */}
                <div className="p-5 border-b border-slate-50">
                  <div className="flex gap-2">
                    <div className="relative group flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D36A47] transition-colors" size={18} />
                      <input
                        type="text"
                        placeholder="Kullanıcı ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm transition-all outline-none focus:ring-2 focus:ring-[#D36A47]/10"
                      />
                    </div>
                    <button
                      onClick={handleOpenNewMessage}
                      className="lg:hidden flex items-center justify-center w-12 h-12 bg-[#D36A47] text-white rounded-2xl font-bold transition-all hover:bg-[#C25936] flex-shrink-0"
                      title="Yeni Mesaj"
                    >
                      <MessageSquarePlus size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {loadingConversations ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12">
                      <Loader2 size={32} className="text-[#D36A47] animate-spin" />
                      <p className="text-sm text-slate-400 mt-3 font-medium">Konuşmalar yükleniyor...</p>
                    </div>
                  ) : filteredConversations.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                      {filteredConversations.map((conv) => (
                        <div
                          key={conv.user?.id}
                          onClick={() => handleSelectConversation(conv)}
                          className={`group relative p-5 cursor-pointer transition-all duration-300 hover:bg-slate-50 ${selectedUserId === conv.user?.id ? 'bg-slate-50' : ''}`}
                        >
                          <div className="flex gap-4">
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 rounded-2xl bg-[#0A1128] text-white flex items-center justify-center font-bold text-lg shadow-inner">
                                {(conv.user?.full_name || '?').charAt(0)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="text-sm font-black text-[#0A1128] truncate">{conv.user?.full_name || 'Bilinmeyen'}</h4>
                                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">
                                  {formatRelativeTime(conv.lastMessage?.created_at)}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#D36A47] font-black uppercase tracking-widest mb-1">{conv.user?.email || ''}</p>
                              <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-[#0A1128] font-black' : 'text-slate-400 font-medium'}`}>
                                {conv.lastMessage?.content || 'Henüz mesaj yok'}
                              </p>
                            </div>
                            {conv.unreadCount > 0 && (
                              <div className="flex-shrink-0 flex items-center">
                                <div className="w-5 h-5 rounded-full bg-[#D36A47] text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-[#D36A47]/20">
                                  {conv.unreadCount}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                      <Users size={40} className="text-slate-100 mb-4" />
                      <h4 className="text-sm font-bold text-slate-400">
                        {searchQuery ? 'Sonuç Bulunamadı' : 'Henüz konuşma yok'}
                      </h4>
                      {!searchQuery && (
                        <button
                          onClick={handleOpenNewMessage}
                          className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#D36A47] text-white rounded-xl text-sm font-bold hover:bg-[#C25936] transition-all"
                        >
                          <MessageSquarePlus size={16} />
                          Yeni Mesaj Başlat
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* SAĞ PANEL: SOHBET EKRANI */}
              <div className={`flex-1 flex flex-col bg-slate-50/30 ${!selectedUserId ? 'hidden lg:flex' : 'flex'}`}>
                {selectedUserId ? (
                  <>
                    <div className="flex items-center justify-between p-4 md:p-6 border-b border-white bg-white/60 backdrop-blur-md">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => { setSelectedUserId(null); setSelectedUser(null); setMessages([]); }}
                          className="lg:hidden p-2 text-slate-500 hover:text-[#0A1128]"
                        >
                          <ArrowLeft size={20} />
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-[#0A1128] text-white flex items-center justify-center font-bold">
                          {(selectedUser?.full_name || '?').charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-[#0A1128] leading-tight">{selectedUser?.full_name || 'Kullanıcı'}</h3>
                          <p className="text-[10px] font-bold text-[#D36A47] uppercase tracking-wider">{selectedUser?.email || ''}</p>
                        </div>
                      </div>
                      <button className="p-2.5 text-slate-400 hover:text-[#0A1128] hover:bg-white rounded-xl transition-all">
                        <MoreVertical size={20} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-90">
                      {loadingMessages ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12">
                          <Loader2 size={28} className="text-[#D36A47] animate-spin" />
                          <p className="text-sm text-slate-400 mt-3 font-medium">Mesajlar yükleniyor...</p>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                          <MailOpen size={40} className="text-slate-200 mb-4" />
                          <p className="text-sm text-slate-400 font-medium">Henüz mesaj yok. İlk mesajı gönderin!</p>
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isMe = msg.sender_id === currentUser?.id;
                          return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className="max-w-[80%] md:max-w-[70%] space-y-1">
                                <div className={`px-5 py-3.5 rounded-3xl text-sm font-medium shadow-sm ${isMe ? 'bg-[#0A1128] text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                                  }`}>
                                  {msg.content}
                                </div>
                                <div className={`flex items-center gap-2 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {formatMessageTime(msg.created_at)}
                                  </span>
                                  {isMe && msg.is_read && <CheckCircle2 size={12} className="text-emerald-500" />}
                                  {isMe && !msg.is_read && <CheckCircle2 size={12} className="text-slate-300" />}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 md:p-6 bg-white border-t border-slate-100">
                      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <button type="button" className="p-3 text-slate-400 hover:text-[#D36A47] hover:bg-slate-50 rounded-2xl transition-all">
                          <Paperclip size={20} />
                        </button>
                        <div className="flex-1 relative flex items-center">
                          <input
                            type="text"
                            placeholder="Mesajınızı yazın..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="w-full pl-5 pr-14 py-4 bg-slate-50 border-none rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-[#D36A47]/5 focus:bg-white transition-all outline-none"
                            disabled={sendingMessage}
                          />
                          <button
                            type="submit"
                            disabled={!newMessage.trim() || sendingMessage}
                            className="absolute right-2 p-3 bg-[#D36A47] text-white rounded-full shadow-lg hover:bg-[#C25936] disabled:bg-slate-200 transition-all active:scale-90"
                          >
                            {sendingMessage ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white/40 backdrop-blur-sm">
                    <div className="relative mb-10">
                      <div className="absolute inset-0 bg-[#D36A47]/5 rounded-full blur-[80px] animate-pulse"></div>
                      <div className="relative w-32 h-32 bg-white rounded-[40px] shadow-2xl flex items-center justify-center border border-slate-50">
                        <MailOpen size={56} className="text-[#D36A47]/20" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-[#0A1128] mb-2">Ekibinizle Sohbet Edin</h3>
                    <p className="text-sm text-slate-500 max-w-[280px] mx-auto font-medium">Soldaki listeden bir ekip arkadaşınızı seçerek yazışmaya başlayabilirsiniz.</p>
                    <button
                      onClick={handleOpenNewMessage}
                      className="mt-6 flex items-center gap-2 px-5 py-3 bg-[#D36A47] text-white rounded-2xl text-sm font-bold hover:bg-[#C25936] transition-all shadow-lg shadow-[#D36A47]/20"
                    >
                      <MessageSquarePlus size={18} />
                      Yeni Mesaj Başlat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* YENİ MESAJ MODALI */}
      {showNewMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-black text-[#0A1128]">Yeni Mesaj</h3>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="p-2 text-slate-400 hover:text-[#0A1128] hover:bg-slate-50 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 border-b border-slate-50">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D36A47] transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Kullanıcı ara..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm transition-all outline-none focus:ring-2 focus:ring-[#D36A47]/10"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingUsers ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <Loader2 size={28} className="text-[#D36A47] animate-spin" />
                  <p className="text-sm text-slate-400 mt-3 font-medium">Kullanıcılar yükleniyor...</p>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {filteredUsers.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => handleSelectNewUser(u)}
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#0A1128] text-white flex items-center justify-center font-bold text-sm shadow-inner flex-shrink-0">
                        {(u.full_name || '?').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[#0A1128] truncate">{u.full_name || 'İsimsiz'}</h4>
                        <p className="text-xs text-slate-400 truncate">{u.email || ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <Users size={32} className="text-slate-200 mb-3" />
                  <p className="text-sm text-slate-400 font-medium">Kullanıcı bulunamadı</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;
