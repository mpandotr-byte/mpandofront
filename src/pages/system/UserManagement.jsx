import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Users, Plus, Edit2, Trash2, X, Shield, Mail, User, Building2, Search, Check
} from 'lucide-react';

const ROLES = [
  { value: 'CORP_ADMIN', label: 'Sirket Yoneticisi', color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'PROJECT_MANAGER', label: 'Proje Muduru', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'SITE_ENGINEER', label: 'Saha Muhendisi', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'ACCOUNTANT', label: 'Muhasebeci', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'SALES_REP', label: 'Satis Temsilcisi', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'SUB_OWNER', label: 'Taseron Sahibi', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  { value: 'SUB_SUPERVISOR', label: 'Taseron Amiri', color: 'bg-slate-50 text-slate-600 border-slate-200' },
  { value: 'SUPP_MANAGER', label: 'Tedarikci Muduru', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { value: 'SUPP_LOGISTICS', label: 'Tedarikci Lojistik', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
];

const getRoleInfo = (role) => ROLES.find(r => r.value === role) || { label: role, color: 'bg-slate-50 text-slate-600 border-slate-200' };

export default function UserManagement() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', email: '', password_hash: '', role: 'SITE_ENGINEER', is_active: true });
  const { user } = useAuth();
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const sendVerificationEmail = async (email) => {
    try {
      await api.post('/auth/send-verification', { email });
      showNotification('Kullaniciya dogrulama e-postasi gonderildi');
    } catch (err) {
      showNotification('Dogrulama e-postasi gonderilemedi: ' + (err.message || 'Bilinmeyen hata'), 'error');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get('/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Kullanicilar yuklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchUsers(); }, [user]);

  const handleSave = async () => {
    if (!formData.full_name || !formData.email || (!editingUser && !formData.password_hash)) {
      alert('Lutfen tum zorunlu alanlari doldurunuz.');
      return;
    }
    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password_hash) delete updateData.password_hash;
        await api.put(`/users/${editingUser.id}`, updateData);
      } else {
        await api.post('/users', { ...formData, company_id: user?.company_id || 1 });
        // Yeni kullanici olusturulduktan sonra dogrulama e-postasi gonder
        sendVerificationEmail(formData.email);
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ full_name: '', email: '', password_hash: '', role: 'SITE_ENGINEER', is_active: true });
      fetchUsers();
    } catch (err) {
      alert('Kullanici kaydedilemedi: ' + (err.message || 'Bilinmeyen hata'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kullaniciyi silmek istediginize emin misiniz?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Silinemedi: ' + err.message);
    }
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setFormData({ full_name: u.full_name, email: u.email, password_hash: '', role: u.role, is_active: u.is_active });
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingUser(null);
    setFormData({ full_name: '', email: '', password_hash: '', role: 'SITE_ENGINEER', is_active: true });
    setIsModalOpen(true);
  };

  const filtered = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f8f9fb]">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">

          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1128] via-[#0D1630] to-[#0A1128] rounded-2xl p-6 md:p-8 text-white shadow-xl mb-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <Users size={28} className="text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black tracking-tight">Kullanici Yonetimi</h1>
                  <p className="text-white/50 text-xs mt-1">{users.length} kayitli kullanici</p>
                </div>
              </div>
              <button
                onClick={openNew}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg"
              >
                <Plus size={18} /> Yeni Kullanici
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Kullanici ara... (isim, email, rol)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-96 pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* User Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Users size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="font-bold">Kullanici bulunamadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(u => {
                const roleInfo = getRoleInfo(u.role);
                return (
                  <div key={u.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-lg">
                          {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">{u.full_name || 'Isimsiz'}</h3>
                          <p className="text-xs text-slate-400 flex items-center gap-1"><Mail size={11} /> {u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(u)} className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${u.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        {u.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${u.email_verified ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                        {u.email_verified ? '✓ Email Dogrulandi' : '⚠ Email Dogrulanmadi'}
                      </span>
                      {!u.email_verified && (
                        <button
                          onClick={() => sendVerificationEmail(u.email)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold border bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 transition-colors flex items-center gap-1"
                        >
                          <Mail size={10} /> Dogrulama Gonder
                        </button>
                      )}
                    </div>

                    {u.last_login && (
                      <p className="text-[10px] text-slate-400 mt-3">
                        Son giris: {new Date(u.last_login).toLocaleString('tr-TR')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Notification Toast */}
          {notification && (
            <div className={`fixed top-6 right-6 z-[10000] px-5 py-3 rounded-xl shadow-lg text-sm font-bold transition-all ${notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
              {notification.message}
            </div>
          )}

          {/* Add/Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800">
                    {editingUser ? 'Kullanici Duzenle' : 'Yeni Kullanici'}
                  </h3>
                  <button onClick={() => { setIsModalOpen(false); setEditingUser(null); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Ad Soyad *</label>
                    <input
                      value={formData.full_name}
                      onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
                      placeholder="Ornek: Ahmet Yilmaz"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">E-posta *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
                      placeholder="ornek@sirket.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">
                      Sifre {editingUser ? '(bos birakirsaniz degismez)' : '*'}
                    </label>
                    <input
                      type="password"
                      value={formData.password_hash}
                      onChange={(e) => setFormData(p => ({ ...p, password_hash: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
                      placeholder="********"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Rol *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
                    >
                      {ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, is_active: !p.is_active }))}
                      className={`w-10 h-6 rounded-full transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-300'} relative`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                    <span className="text-sm font-medium text-slate-600">{formData.is_active ? 'Aktif' : 'Pasif'}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => { setIsModalOpen(false); setEditingUser(null); }}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                  >
                    Iptal
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                  >
                    {editingUser ? 'Guncelle' : 'Kaydet'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
