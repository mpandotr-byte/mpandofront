import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api, setToken } from "../../api/client";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Shield, BarChart3, Users, Zap, Briefcase, Building2, Package, Lock, Mail, HardHat, Construction } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Dinamik istatistikler
  const [stats, setStats] = useState(() => {
    try {
      const cached = localStorage.getItem('mpando_login_stats');
      if (cached) {
        const parsed = JSON.parse(cached);
        return { ...parsed, loadingStats: false };
      }
    } catch { }
    return { projects: 12, users: 48, customers: 156, loadingStats: false };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", { email, password });
      setToken(response.token);
      login(response);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0A1128] font-sans flex text-left">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#D36A47]/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(#D36A47 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="flex flex-col lg:flex-row w-full relative z-10">

        {/* LEFT PANEL - Information & Branding */}
        <div className="hidden lg:flex lg:w-[60%] flex-col justify-between p-16 xl:p-24 border-r border-white/5">
          {/* Logo Section */}
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="w-14 h-14 bg-gradient-to-br from-[#D36A47] to-[#A35235] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#D36A47]/20 border border-white/10">
              <img className="w-9 h-9 object-contain brightness-0 invert" src="/logo.png" alt="logo" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none uppercase">MPANDO</h1>
              <p className="text-[#D36A47] text-[10px] font-black tracking-[0.4em] uppercase mt-1">Construction Core</p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-xl space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D36A47]/10 border border-[#D36A47]/20 text-[#D36A47] text-[10px] font-black uppercase tracking-widest animate-bounce-slow">
                <Construction size={14} /> Yeni Nesil Şantiye Yönetimi
              </div>
              <h2 className="text-5xl xl:text-7xl font-black text-white leading-[1.1] tracking-tighter">
                SAHAYI <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D36A47] to-[#E37A57]">DİJİTALLE</span> <br />
                YÖNETİN.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-md">
                Proje planlama, stok takibi, ekip yönetimi ve finansal analizleri tek platformda birleştirin.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: <HardHat />, title: "İş Güvenliği & Puantaj", color: "text-amber-400" },
                { icon: <Package />, title: "Akıllı Stok Takibi", color: "text-emerald-400" },
                { icon: <Briefcase />, title: "Maliyet Analizi", color: "text-[#D36A47]" },
                { icon: <BarChart3 />, title: "Üretim İzleme", color: "text-blue-400" }
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-4 p-5 rounded-[28px] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${f.color} group-hover:scale-110 transition-transform`}>
                    {React.cloneElement(f.icon, { size: 18 })}
                  </div>
                  <span className="text-white font-black text-[11px] uppercase tracking-wide leading-tight">{f.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Stats */}
          <div className="flex items-center gap-12">
            <div className="space-y-1">
              <p className="text-3xl font-black text-white">%{stats.projects}+</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verim Artışı</p>
            </div>
            <div className="w-px h-10 bg-white/5" />
            <div className="space-y-1">
              <p className="text-3xl font-black text-white">{stats.users}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aktif Kullanıcı</p>
            </div>
            <div className="w-px h-10 bg-white/5" />
            <div className="space-y-1">
              <p className="text-3xl font-black text-white">{stats.customers}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Çözüm Ortağı</p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Login Card */}
        <div className="w-full lg:w-[40%] flex items-center justify-center p-8 lg:p-16 relative">

          <div className="w-full max-w-[440px] relative z-10">
            {/* Mobile Header */}
            <div className="lg:hidden flex flex-col items-center mb-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#D36A47] to-[#A35235] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#D36A47]/20 border border-white/10 mb-6">
                <img className="w-10 h-10 object-contain brightness-0 invert" src="/logo.png" alt="logo" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">MPANDO</h1>
              <p className="text-[#D36A47] text-[10px] font-black tracking-[0.4em] uppercase mt-1">Digital Construction</p>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-3xl border border-white/[0.08] rounded-[48px] p-10 xl:p-14 shadow-2xl relative overflow-hidden group">
              {/* Accent decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D36A47]/10 rounded-bl-[100px] -mr-8 -mt-8 blur-2xl group-hover:bg-[#D36A47]/20 transition-all duration-700" />

              <div className="relative z-10 space-y-10">
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Giriş Yap</h3>
                  <p className="text-slate-400 text-sm font-medium">Lütfen kimlik bilgilerinizle devam edin.</p>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-shake">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-400 text-xs font-bold uppercase tracking-wide">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-8">
                    {/* Email Field */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 block">Kurumsal E-Posta</label>
                      <div className="relative group/input">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-[#D36A47] transition-colors">
                          <Mail size={18} />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="isadiyaman@iskar.com"
                          required
                          className="w-full pl-16 pr-6 py-5 bg-white/[0.03] border border-white/[0.06] rounded-[24px] text-white text-sm font-bold focus:bg-white/[0.07] focus:border-[#D36A47]/30 focus:ring-4 focus:ring-[#D36A47]/5 outline-none transition-all placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Sistem Şifresi</label>
                        <button type="button" className="text-[10px] font-black text-[#D36A47] uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all">Şifremi Unuttum</button>
                      </div>
                      <div className="relative group/input">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-[#D36A47] transition-colors">
                          <Lock size={18} />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-16 pr-14 py-5 bg-white/[0.03] border border-white/[0.06] rounded-[24px] text-white text-sm font-bold focus:bg-white/[0.07] focus:border-[#D36A47]/30 focus:ring-4 focus:ring-[#D36A47]/5 outline-none transition-all placeholder:text-slate-600 tracking-[0.2em]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-2">
                    <input type="checkbox" id="remember" className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-[#D36A47] focus:ring-[#D36A47]/20 accent-[#D36A47]" />
                    <label htmlFor="remember" className="text-[11px] font-black text-slate-500 uppercase tracking-widest cursor-pointer select-none">Beni Hatırla</label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full group mt-4 relative overflow-hidden px-8 py-5 bg-[#D36A47] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-[#D36A47]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Sisteme Giriş Yap
                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                    <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                  </button>
                </form>

                <div className="pt-6 text-center">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                    © 2024 MPANDO CORE ENGINE <br />
                    <span className="text-slate-800 mt-2 block">V 2.4.8 PREMIUM CLOUD</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
