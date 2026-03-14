import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
    Bell,
    CheckCircle,
    Trash2,
    Clock,
    User,
    Filter,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Package,
    CreditCard,
    Briefcase,
    ExternalLink,
    MoreVertical,
    ArrowLeft,
    ChevronRight,
    Search,
    Loader2
} from 'lucide-react';

// subject_type -> notification type mapping
const mapSubjectType = (subjectType) => {
    if (!subjectType) return 'system';
    const type = subjectType.toLowerCase();
    if (type.includes('sale')) return 'approval';
    if (type.includes('user')) return 'system';
    if (type.includes('project')) return 'project';
    if (type.includes('customer') || type.includes('client')) return 'customer';
    if (type.includes('material') || type.includes('stock') || type.includes('inventory')) return 'stock';
    if (type.includes('payment') || type.includes('finance')) return 'finance';
    return 'system';
};

// event -> priority mapping
const mapEventToPriority = (event) => {
    if (!event) return 'low';
    switch (event) {
        case 'deleted': return 'high';
        case 'created': return 'medium';
        case 'updated': return 'low';
        case 'login': return 'low';
        case 'logout': return 'low';
        case 'viewed': return 'low';
        default: return 'low';
    }
};

// Relative time formatting
const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return `${Math.floor(diffDays / 30)} ay önce`;
};

// Format date for detail view
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${mins}`;
};

// Check if created within last 24 hours
const isRecent = (dateString) => {
    if (!dateString) return false;
    const now = new Date();
    const date = new Date(dateString);
    return (now - date) < 86400000; // 24 hours in ms
};

// Map API activity to notification format
const mapActivityToNotification = (activity) => ({
    id: activity.id,
    title: activity.description || 'Bildirim',
    text: activity.description || '',
    sender: activity.user?.full_name || 'Sistem',
    time: formatRelativeTime(activity.created_at),
    date: formatDate(activity.created_at),
    unread: isRecent(activity.created_at),
    type: mapSubjectType(activity.subject_type),
    priority: mapEventToPriority(activity.event),
});

const getTypeStyles = (type) => {
    switch (type) {
        case 'finance': return { icon: <CreditCard size={18} />, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600' };
        case 'approval': return { icon: <CheckCircle2 size={18} />, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600' };
        case 'stock': return { icon: <Package size={18} />, color: 'amber', bg: 'bg-orange-50', text: 'text-orange-600' };
        case 'project': return { icon: <Briefcase size={18} />, color: 'indigo', bg: 'bg-orange-50', text: 'text-orange-600' };
        case 'customer': return { icon: <User size={18} />, color: 'rose', bg: 'bg-red-50', text: 'text-red-600' };
        default: return { icon: <Bell size={18} />, color: 'slate', bg: 'bg-slate-50', text: 'text-slate-600' };
    }
};

const getPriorityBadge = (priority) => {
    switch (priority) {
        case 'urgent': return <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-600 text-[10px] font-black uppercase">Acil</span>;
        case 'high': return <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-600 text-[10px] font-black uppercase">Yüksek</span>;
        case 'medium': return <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-600 text-[10px] font-black uppercase">Orta</span>;
        default: return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-black uppercase">Düşük</span>;
    }
};

function Notifications() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [selectedNotif, setSelectedNotif] = useState(null);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuth();

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const fetchActivities = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/activities?limit=50&offset=0');
            const activities = response.data || response || [];
            const mapped = (Array.isArray(activities) ? activities : []).map(mapActivityToNotification);
            setNotifications(mapped);
        } catch (err) {
            console.error('Bildirimler yüklenirken hata:', err);
            setError('Bildirimler yüklenemedi. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const filteredNotifs = notifications.filter(n => {
        const matchesFilter = filter === 'unread' ? n.unread : true;
        const matchesSearch = searchQuery
            ? n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              n.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
              n.sender.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        return matchesFilter && matchesSearch;
    });

    const handleSelectNotif = (notif) => {
        setSelectedNotif(notif);
        if (notif.unread) {
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
        }
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (selectedNotif?.id === id) setSelectedNotif(null);
    };

    return (
        <div className="flex min-h-screen bg-white lg:bg-[#F8FAFC] font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />

            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <Navbar title="Bildirimler" toggleMobileMenu={toggleMobileMenu} />

                <div className="flex-1 flex flex-col min-w-0 p-0 lg:p-6 xl:p-8 overflow-hidden">
                    <div className="flex-1 flex flex-col min-w-0 lg:gap-6 h-full">

                        {/* DESKTOP HEADER */}
                        <div className="hidden lg:flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-black text-[#0A1128] tracking-tight">Bildirim Merkezi</h1>
                                <p className="text-sm text-slate-500 font-medium">Süreç onayları ve sistem güncellemelerini takip edin.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={markAllAsRead}
                                    className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm transition-all hover:bg-slate-50 shadow-sm"
                                >
                                    <CheckCircle size={18} />
                                    <span>Hepsini Oku</span>
                                </button>
                                <button
                                    onClick={fetchActivities}
                                    className="flex items-center justify-center w-12 h-12 bg-[#0A1128] text-white rounded-2xl font-bold shadow-lg shadow-[#0A1128]/20 hover:bg-[#0A1128]/90 transition-all"
                                >
                                    <Filter size={20} />
                                </button>
                            </div>
                        </div>

                        {/* CONTAINER */}
                        <div className="flex-1 bg-white lg:rounded-[32px] lg:border border-slate-200/60 lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex overflow-hidden">

                            {/* LIST PANEL */}
                            <div className={`w-full lg:w-[380px] xl:w-[420px] flex flex-col border-r border-slate-100 bg-white ${selectedNotif ? 'hidden lg:flex' : 'flex'}`}>

                                {/* Mobile-only context header */}
                                <div className="lg:hidden px-6 py-8 bg-[#0A1128] text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D36A47] rounded-full blur-[60px] opacity-20 -mr-10 -mt-10"></div>
                                    <h1 className="text-2xl font-black tracking-tight relative z-10">Bildirim Merkezi</h1>
                                    <div className="flex items-center justify-between mt-3 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#D36A47] animate-pulse"></span>
                                            <p className="text-[11px] text-white/50 font-black uppercase tracking-widest">{notifications.filter(n => n.unread).length} Yeni Mesaj</p>
                                        </div>
                                        <button onClick={markAllAsRead} className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">Hepsini Oku</button>
                                    </div>
                                </div>

                                {/* Search Bar (Mobile/Desktop) */}
                                <div className="p-4 lg:p-5 border-b border-slate-50">
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#D36A47] transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Bildirimlerde ara..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-[#D36A47]/20 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="px-4 lg:px-5 pb-4 lg:pb-5">
                                    <div className="flex gap-2 p-1 bg-slate-100/60 rounded-xl">
                                        <button
                                            onClick={() => setFilter('all')}
                                            className={`flex-1 py-2.5 text-[11px] font-black rounded-lg transition-all ${filter === 'all' ? 'bg-white text-[#0A1128] shadow-sm' : 'text-slate-400'}`}
                                        >
                                            HEPSİ
                                        </button>
                                        <button
                                            onClick={() => setFilter('unread')}
                                            className={`flex-1 py-1 px-1 text-[11px] font-black rounded-lg transition-all ${filter === 'unread' ? 'bg-white text-[#D36A47] shadow-sm' : 'text-slate-400'}`}
                                        >
                                            OKUNMAMIŞ
                                        </button>
                                    </div>
                                </div>

                                {/* List */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 lg:bg-white p-4 lg:p-0">
                                    {loading ? (
                                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                            <Loader2 size={40} className="text-[#D36A47] animate-spin mb-4" />
                                            <p className="text-sm font-bold text-slate-500">Bildirimler yükleniyor...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-4">
                                                <AlertCircle size={40} className="text-red-400" />
                                            </div>
                                            <h4 className="text-sm font-black text-[#0A1128]">Hata Oluştu</h4>
                                            <p className="text-xs text-slate-400 mt-1 font-bold">{error}</p>
                                            <button
                                                onClick={fetchActivities}
                                                className="mt-4 px-5 py-2.5 bg-[#D36A47] text-white rounded-xl text-xs font-bold hover:bg-[#C25936] transition-all"
                                            >
                                                Tekrar Dene
                                            </button>
                                        </div>
                                    ) : filteredNotifs.length > 0 ? (
                                        <div className="flex flex-col gap-3 lg:gap-0 lg:divide-y lg:divide-slate-50">
                                            {filteredNotifs.map((notif) => {
                                                const styles = getTypeStyles(notif.type);
                                                return (
                                                    <div
                                                        key={notif.id}
                                                        onClick={() => handleSelectNotif(notif)}
                                                        className={`group relative p-5 lg:p-6 cursor-pointer transition-all duration-300 bg-white rounded-2xl lg:rounded-none border border-slate-100 lg:border-none lg:border-l-4 shadow-sm lg:shadow-none ${selectedNotif?.id === notif.id ? 'lg:border-l-[#D36A47] lg:bg-slate-50 ring-2 ring-[#D36A47]/10 lg:ring-0' : 'lg:border-l-transparent'
                                                            } ${notif.unread ? 'bg-white lg:bg-[#D36A47]/[0.01]' : ''} hover:scale-[1.01] lg:hover:scale-100 lg:hover:bg-slate-50`}
                                                    >
                                                        <div className="flex gap-4">
                                                            <div className={`w-11 h-11 rounded-2xl ${styles.bg} ${styles.text} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                                                                {React.cloneElement(styles.icon, { size: 20 })}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start mb-1 gap-2">
                                                                    <h4 className={`text-[13px] lg:text-sm tracking-tight truncate leading-tight ${notif.unread ? 'font-black text-[#0A1128]' : 'font-bold text-slate-600'}`}>
                                                                        {notif.title}
                                                                    </h4>
                                                                    <span className="text-[10px] font-bold text-slate-300 flex-shrink-0">{notif.time}</span>
                                                                </div>
                                                                <p className="text-[11px] lg:text-[12px] line-clamp-2 leading-relaxed text-slate-500 font-medium">{notif.text}</p>
                                                                <div className="mt-3 flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        {getPriorityBadge(notif.priority)}
                                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{notif.sender}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 text-[#D36A47] opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <span className="text-[10px] font-black uppercase tracking-widest">OKU</span>
                                                                        <ChevronRight size={14} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {notif.unread && (
                                                            <div className="absolute top-4 right-4 lg:top-6 lg:right-5 w-2 h-2 rounded-full bg-[#D36A47] shadow-lg shadow-[#D36A47]/40" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
                                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                                                <Bell size={40} className="text-slate-200" />
                                            </div>
                                            <h4 className="text-sm font-black text-[#0A1128]">Bildirim Kalmadı</h4>
                                            <p className="text-xs text-slate-400 mt-1 font-bold">Harika! Şu an için her şey güncel.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* DETAIL PANEL */}
                            <div className={`flex-1 flex flex-col bg-slate-50/20 ${!selectedNotif ? 'hidden lg:flex' : 'flex'}`}>
                                {selectedNotif ? (
                                    <div className="flex flex-col h-full bg-white lg:bg-white/40 backdrop-blur-sm">
                                        {/* Mobile Toolbar */}
                                        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white bg-white/80 backdrop-blur-xl sticky top-0 z-20">
                                            <button
                                                onClick={() => setSelectedNotif(null)}
                                                className="flex items-center gap-2 text-[10px] font-black text-white px-5 py-3 bg-[#0A1128] rounded-2xl shadow-lg shadow-[#0A1128]/20 uppercase tracking-widest active:scale-95 transition-all"
                                            >
                                                <ArrowLeft size={16} /> GERİ DÖN
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => deleteNotification(selectedNotif.id)} className="p-3 text-slate-400 hover:text-red-500 bg-slate-50 rounded-2xl">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Desktop Toolbar */}
                                        <div className="hidden lg:flex items-center justify-end p-6 border-b border-white bg-white/40">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => deleteNotification(selectedNotif.id)}
                                                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                                <button className="p-3 text-slate-400 hover:text-[#0A1128] hover:bg-white rounded-2xl transition-all">
                                                    <MoreVertical size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-6 lg:p-16 xl:p-20 custom-scrollbar">
                                            <div className="max-w-2xl mx-auto space-y-8 lg:space-y-12">
                                                <div className="flex flex-col items-center text-center space-y-5">
                                                    <div className={`w-20 h-20 rounded-[32px] ${getTypeStyles(selectedNotif.type).bg} ${getTypeStyles(selectedNotif.type).text} flex items-center justify-center shadow-xl shadow-black/5`}>
                                                        {React.cloneElement(getTypeStyles(selectedNotif.type).icon, { size: 32 })}
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex justify-center gap-2">
                                                            {getPriorityBadge(selectedNotif.priority)}
                                                            <span className="px-3 py-1 rounded-lg bg-[#0A1128] text-white text-[10px] font-black uppercase tracking-[0.2em]">{selectedNotif.type}</span>
                                                        </div>
                                                        <h2 className="text-2xl lg:text-5xl font-black text-[#0A1128] tracking-tight leading-tight">
                                                            {selectedNotif.title}
                                                        </h2>
                                                        <div className="flex items-center justify-center gap-6 text-[12px] font-bold text-slate-400">
                                                            <span className="flex items-center gap-2"><Clock size={16} className="text-slate-300" /> {selectedNotif.date}</span>
                                                            <span className="flex items-center gap-2"><User size={16} className="text-slate-300" /> {selectedNotif.sender}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white rounded-[2.5rem] p-8 lg:p-14 shadow-2xl shadow-slate-200/40 border border-slate-100 relative group overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D36A47]/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                                                    <p className="text-[16px] lg:text-[18px] text-slate-600 leading-relaxed font-semibold relative z-10">
                                                        {selectedNotif.text}
                                                    </p>
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                                    <button className="flex-1 py-5 bg-[#D36A47] text-white rounded-2xl lg:rounded-[1.5rem] font-black text-sm shadow-2xl shadow-[#D36A47]/20 hover:bg-[#C25936] hover:scale-[1.02] active:scale-95 transition-all">Süreci Hemen Onayla</button>
                                                    <button className="flex-1 py-5 bg-white border border-slate-200 text-[#0A1128] rounded-2xl lg:rounded-[1.5rem] font-black text-sm hover:border-[#0A1128] active:scale-95 transition-all">İlgili Kaydı Görüntüle</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center opacity-40">
                                        <div className="w-32 h-32 bg-slate-50 rounded-[40px] flex items-center justify-center mb-6">
                                            <TrendingUp size={64} className="text-slate-200" />
                                        </div>
                                        <h3 className="text-xl font-black text-[#0A1128]">Detayları İnceleyin</h3>
                                        <p className="text-sm font-bold mt-2">Soldaki listeden bir bildirim seçerek süreci yönetin.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Notifications;
