import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Phone, Shield, Camera, Save, Lock, Eye, EyeOff,
  CheckCircle2, XCircle, Send, KeyRound, Loader2
} from 'lucide-react';

const ROLES = [
  { value: 'CORP_ADMIN', label: 'Sirket Yoneticisi', color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'PROJECT_MANAGER', label: 'Proje Muduru', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'SITE_ENGINEER', label: 'Saha Muhendisi', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'ACCOUNTANT', label: 'Muhasebeci', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'SALES_REP', label: 'Satis Temsilcisi', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'SUB_OWNER', label: 'Taseron Sahibi', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  { value: 'SUB_SUPERVISOR', label: 'Taseron Amiri', color: 'bg-slate-50 text-slate-600 border-slate-200' },
  { value: 'SUPP_MANAGER', label: 'Tedarikci Muduru', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { value: 'SUPP_LOGISTICS', label: 'Tedarikci Lojistik', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
];

const getRoleInfo = (role) => ROLES.find(r => r.value === role) || { label: role, color: 'bg-slate-50 text-slate-600 border-slate-200' };

export default function Profile() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, login } = useAuth();

  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    profile_img_url: '',
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  // Email verification state
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verificationMsg, setVerificationMsg] = useState(null);

  // Fresh user data
  const [userData, setUserData] = useState(null);

  const fetchMe = async () => {
    setProfileLoading(true);
    try {
      const data = await api.get('/auth/me');
      setUserData(data);
      setProfileData({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        profile_img_url: data.profile_img_url || '',
      });
      setEmailVerified(!!data.email_verified);
    } catch (err) {
      console.error('Profil yuklenemedi:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchMe();
  }, [user]);

  // Profile save
  const handleProfileSave = async () => {
    if (!profileData.full_name || !profileData.email) {
      setProfileMsg({ type: 'error', text: 'Ad Soyad ve E-posta zorunludur.' });
      return;
    }
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const id = userData?.id || user?.id;
      await api.put(`/users/${id}`, {
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone,
        profile_img_url: profileData.profile_img_url,
      });
      // Update local storage user
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfileMsg({ type: 'success', text: 'Profil basariyla guncellendi.' });
      fetchMe();
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Profil guncellenemedi.' });
    } finally {
      setProfileSaving(false);
    }
  };

  // Password change
  const handlePasswordChange = async () => {
    if (!passwordData.current_password || !passwordData.new_password) {
      setPasswordMsg({ type: 'error', text: 'Mevcut ve yeni sifre zorunludur.' });
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordMsg({ type: 'error', text: 'Yeni sifreler eslesmiyor.' });
      return;
    }
    if (passwordData.new_password.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Yeni sifre en az 6 karakter olmalidir.' });
      return;
    }
    setPasswordSaving(true);
    setPasswordMsg(null);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.current_password,
        newPassword: passwordData.new_password,
      });
      setPasswordMsg({ type: 'success', text: 'Sifre basariyla degistirildi.' });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message || 'Sifre degistirilemedi.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Send verification
  const handleSendVerification = async () => {
    setVerificationSending(true);
    setVerificationMsg(null);
    try {
      await api.post('/auth/send-verification');
      setVerificationSent(true);
      setVerificationMsg({ type: 'success', text: 'Dogrulama kodu e-posta adresinize gonderildi.' });
    } catch (err) {
      setVerificationMsg({ type: 'error', text: err.message || 'Dogrulama kodu gonderilemedi.' });
    } finally {
      setVerificationSending(false);
    }
  };

  // Verify code
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setVerificationMsg({ type: 'error', text: 'Lutfen dogrulama kodunu giriniz.' });
      return;
    }
    setVerifyingCode(true);
    setVerificationMsg(null);
    try {
      await api.post('/auth/verify-email', {
        email: profileData.email,
        code: verificationCode,
      });
      setEmailVerified(true);
      setVerificationSent(false);
      setVerificationCode('');
      setVerificationMsg({ type: 'success', text: 'E-posta basariyla dogrulandi.' });
    } catch (err) {
      setVerificationMsg({ type: 'error', text: err.message || 'Dogrulama basarisiz.' });
    } finally {
      setVerifyingCode(false);
    }
  };

  const roleInfo = getRoleInfo(userData?.role || user?.role);
  const avatarLetter = (profileData.full_name || 'K')[0].toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#f8f9fb]">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">

          {/* Profile Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1128] via-[#0D1630] to-[#0A1128] rounded-2xl p-6 md:p-8 text-white shadow-xl mb-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-center gap-5">
              {/* Avatar */}
              <div className="relative">
                {profileData.profile_img_url ? (
                  <img
                    src={profileData.profile_img_url}
                    alt="Profil"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white/20 flex items-center justify-center">
                    <span className="text-3xl font-black text-white">{avatarLetter}</span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-[#0A1128]" />
              </div>
              {/* Info */}
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-black tracking-tight">
                  {profileData.full_name || 'Kullanici'}
                </h1>
                <p className="text-white/50 text-sm mt-1 flex items-center gap-2">
                  <Mail size={14} />
                  {profileData.email}
                </p>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${roleInfo.color}`}>
                    <Shield size={12} />
                    {roleInfo.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {profileLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <span className="ml-3 text-slate-500">Profil yukleniyor...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Profile Info Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2">
                  <User size={20} className="text-blue-500" />
                  Profil Bilgileri
                </h2>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Ad Soyad</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-colors"
                        placeholder="Ad Soyad"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">E-posta</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-colors"
                        placeholder="E-posta"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Telefon</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-colors"
                        placeholder="Telefon numarasi"
                      />
                    </div>
                  </div>

                  {/* Role - Read Only */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Rol</label>
                    <div className="relative">
                      <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={roleInfo.label}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Profile Image URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Profil Fotografi URL</label>
                    <div className="relative">
                      <Camera size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={profileData.profile_img_url}
                        onChange={(e) => setProfileData({ ...profileData, profile_img_url: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-colors"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                {/* Profile message */}
                {profileMsg && (
                  <div className={`mt-4 flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-xl ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {profileMsg.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {profileMsg.text}
                  </div>
                )}

                {/* Save button */}
                <button
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg"
                >
                  {profileSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {profileSaving ? 'Kaydediliyor...' : 'Degisiklikleri Kaydet'}
                </button>
              </div>

              <div className="space-y-6">

                {/* Password Change Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2">
                    <KeyRound size={20} className="text-amber-500" />
                    Sifre Degistir
                  </h2>

                  <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Mevcut Sifre</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showCurrentPw ? 'text' : 'password'}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                          className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-colors"
                          placeholder="Mevcut sifreniz"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Yeni Sifre</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showNewPw ? 'text' : 'password'}
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                          className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-colors"
                          placeholder="Yeni sifreniz"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Yeni Sifre Tekrar</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showConfirmPw ? 'text' : 'password'}
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                          className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-colors"
                          placeholder="Yeni sifrenizi tekrar giriniz"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw(!showConfirmPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password message */}
                  {passwordMsg && (
                    <div className={`mt-4 flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-xl ${
                      passwordMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {passwordMsg.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {passwordMsg.text}
                    </div>
                  )}

                  <button
                    onClick={handlePasswordChange}
                    disabled={passwordSaving}
                    className="mt-5 w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg"
                  >
                    {passwordSaving ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                    {passwordSaving ? 'Degistiriliyor...' : 'Sifreyi Degistir'}
                  </button>
                </div>

                {/* Email Verification Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2">
                    <Mail size={20} className="text-purple-500" />
                    E-posta Dogrulama
                  </h2>

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border ${
                      emailVerified
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {emailVerified ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {emailVerified ? 'E-posta Dogrulandi' : 'E-posta Dogrulanmadi'}
                    </div>
                  </div>

                  {!emailVerified && (
                    <>
                      {!verificationSent ? (
                        <button
                          onClick={handleSendVerification}
                          disabled={verificationSending}
                          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg"
                        >
                          {verificationSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                          {verificationSending ? 'Gonderiliyor...' : 'Dogrulama Kodu Gonder'}
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Dogrulama Kodu</label>
                            <input
                              type="text"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-400 transition-colors text-center tracking-widest font-bold"
                              placeholder="Kodu giriniz"
                              maxLength={6}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleVerifyCode}
                              disabled={verifyingCode}
                              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg"
                            >
                              {verifyingCode ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                              {verifyingCode ? 'Dogrulaniyor...' : 'Dogrula'}
                            </button>
                            <button
                              onClick={handleSendVerification}
                              disabled={verificationSending}
                              className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-3 rounded-xl text-sm font-bold transition-all"
                            >
                              <Send size={16} />
                              Tekrar Gonder
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Verification message */}
                  {verificationMsg && (
                    <div className={`mt-4 flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-xl ${
                      verificationMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {verificationMsg.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {verificationMsg.text}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
