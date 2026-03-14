import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Activity, Search, Clock, LogIn, Plus, Edit2, Trash2, LogOut,
  ChevronLeft, ChevronRight, RefreshCw, Eye, Settings
} from 'lucide-react';

const EVENT_TYPES = {
  created: { label: 'Olusturma', icon: Plus, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  updated: { label: 'Guncelleme', icon: Edit2, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  deleted: { label: 'Silme', icon: Trash2, color: 'bg-red-50 text-red-600 border-red-200' },
  login: { label: 'Giris', icon: LogIn, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  logout: { label: 'Cikis', icon: LogOut, color: 'bg-slate-50 text-slate-600 border-slate-200' },
  viewed: { label: 'Goruntuleme', icon: Eye, color: 'bg-purple-50 text-purple-600 border-purple-200' },
};

const SUBJECT_LABELS = {
  'App\\Models\\User': 'Kullanici',
  'App\\Models\\Sale': 'Satis',
  'App\\Models\\Customer': 'Musteri',
  'App\\Models\\Project': 'Proje',
  'App\\Models\\Block': 'Blok',
  'App\\Models\\Unit': 'Daire',
  'App\\Models\\Employee': 'Personel',
  'App\\Models\\Material': 'Malzeme',
  'App\\Models\\Supplier': 'Tedarikci',
};

const getSubjectLabel = (type) => {
  if (!type) return 'Sistem';
  return SUBJECT_LABELS[type] || type.split('\\').pop() || 'Diger';
};

const formatDate = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

const detectEvent = (log) => {
  if (log.event) return log.event;
  const desc = (log.description || '').toLowerCase();
  if (desc.includes('giriş') || desc.includes('giris') || desc.includes('login')) return 'login';
  if (desc.includes('çıkış') || desc.includes('cikis') || desc.includes('logout')) return 'logout';
  if (desc.includes('oluşturul') || desc.includes('olusturul') || desc.includes('created') || desc.includes('eklendi')) return 'created';
  if (desc.includes('güncellen') || desc.includes('guncellen') || desc.includes('updated')) return 'updated';
  if (desc.includes('silindi') || desc.includes('deleted')) return 'deleted';
  return null;
};

export default function ActivityLogs() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filterEvent, setFilterEvent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const perPage = 50;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `/activities?limit=${perPage}&offset=${page * perPage}`;
      if (filterEvent) url += `&event=${filterEvent}`;
      const res = await api.get(url);
      if (res.data) {
        setLogs(res.data);
        setTotal(res.total || res.data.length);
      } else if (Array.isArray(res)) {
        setLogs(res);
        setTotal(res.length);
      }
    } catch (err) {
      console.error('Log kayitlari yuklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchLogs(); }, [user, page, filterEvent]);

  const filteredLogs = searchQuery
    ? logs.filter(l =>
        (l.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.user?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : logs;

  const getEventInfo = (log) => {
    const event = detectEvent(log);
    return EVENT_TYPES[event] || { label: 'Diger', icon: Settings, color: 'bg-slate-50 text-slate-600 border-slate-200' };
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fb]">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">

          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1128] via-[#0D1630] to-[#0A1128] rounded-2xl p-6 md:p-8 text-white shadow-xl mb-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <Activity size={28} className="text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black tracking-tight">Aktivite Kayitlari</h1>
                  <p className="text-white/50 text-xs mt-1">Sistem uzerindeki tum islemlerin kayitlari • {total} kayit</p>
                </div>
              </div>
              <button onClick={fetchLogs} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg">
                <RefreshCw size={18} /> Yenile
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Kayitlarda ara..." className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 transition-colors" />
            </div>
            <select value={filterEvent} onChange={e => { setFilterEvent(e.target.value); setPage(0); }}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:border-emerald-400">
              <option value="">Tum Islemler</option>
              {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            {Object.entries(EVENT_TYPES).map(([key, info]) => {
              const count = logs.filter(l => detectEvent(l) === key).length;
              const Icon = info.icon;
              return (
                <div key={key} className={`${info.color} border rounded-xl p-3 text-center`}>
                  <Icon size={18} className="mx-auto mb-1" />
                  <p className="text-lg font-black">{count}</p>
                  <p className="text-[10px] font-bold uppercase">{info.label}</p>
                </div>
              );
            })}
          </div>

          {/* Log Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCw size={24} className="mx-auto mb-2 animate-spin" />
                <p className="text-sm">Yukleniyor...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Activity size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Kayit bulunamadi</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-[10px] font-bold uppercase text-slate-400">Tarih</th>
                      <th className="text-left px-4 py-3 text-[10px] font-bold uppercase text-slate-400">Kullanici</th>
                      <th className="text-left px-4 py-3 text-[10px] font-bold uppercase text-slate-400">Islem</th>
                      <th className="text-left px-4 py-3 text-[10px] font-bold uppercase text-slate-400">Modul</th>
                      <th className="text-left px-4 py-3 text-[10px] font-bold uppercase text-slate-400">Aciklama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => {
                      const eventInfo = getEventInfo(log);
                      const Icon = eventInfo.icon;
                      return (
                        <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Clock size={12} /> {formatDate(log.created_at)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
                                {(log.user?.full_name || '?')[0]}
                              </div>
                              <div>
                                <span className="text-xs font-medium text-slate-700 block">{log.user?.full_name || 'Sistem'}</span>
                                {log.user?.email && <span className="text-[10px] text-slate-400">{log.user.email}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border ${eventInfo.color}`}>
                              <Icon size={11} /> {eventInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                              {getSubjectLabel(log.subject_type)}
                            </span>
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <p className="text-xs text-slate-600 truncate">{log.description}</p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {total > perPage && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                <span className="text-xs text-slate-400">
                  Sayfa {page + 1} / {Math.ceil(total / perPage)}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30">
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * perPage >= total}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
