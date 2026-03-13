import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api, setToken } from "../../api/client";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Shield, BarChart3, Users, Zap, Briefcase, Building2, Package } from "lucide-react";
import { getDefaultPath } from "../../config/roles";

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
    // Önce localStorage'dan cache'lenmiş veriyi oku
    try {
      const cached = localStorage.getItem('mpando_login_stats');
      if (cached) {
        const parsed = JSON.parse(cached);
        return { ...parsed, loadingStats: false };
      }
    } catch { }
    return { projects: null, users: null, customers: null, loadingStats: true };
  });

  const fetchAndCacheStats = async () => {
    try {
      const [projectsData, usersData, customersData] = await Promise.allSettled([
        api.get('/projects'),
        api.get('/users'),
        api.get('/customers')
      ]);

      const newStats = {
        projects: projectsData.status === 'fulfilled' ? (projectsData.value || []).length : stats.projects,
        users: usersData.status === 'fulfilled' ? (usersData.value || []).length : stats.users,
        customers: customersData.status === 'fulfilled' ? (customersData.value || []).length : stats.customers,
        loadingStats: false
      };

      setStats(newStats);
      // Cache'e kaydet
      localStorage.setItem('mpando_login_stats', JSON.stringify({
        projects: newStats.projects,
        users: newStats.users,
        customers: newStats.customers
      }));
    } catch {
      setStats(prev => ({ ...prev, loadingStats: false }));
    }
  };

  useEffect(() => {
    fetchAndCacheStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", { email, password });
      setToken(response.token);

      // Login başarılı — yeni token ile stats'ı çek ve cache'le
      try {
        const [projectsData, usersData, customersData] = await Promise.allSettled([
          api.get('/projects'),
          api.get('/users'),
          api.get('/customers')
        ]);
        const freshStats = {
          projects: projectsData.status === 'fulfilled' ? (projectsData.value || []).length : null,
          users: usersData.status === 'fulfilled' ? (usersData.value || []).length : null,
          customers: customersData.status === 'fulfilled' ? (customersData.value || []).length : null,
        };
        localStorage.setItem('mpando_login_stats', JSON.stringify(freshStats));
      } catch { }

      login(response);
      const targetPath = getDefaultPath(response.user?.role);
      navigate(targetPath);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <BarChart3 size={20} />, title: "Gerçek Zamanlı Analitik", desc: "Projelerin anlık durumunu takip edin" },
    { icon: <Users size={20} />, title: "Ekip Yönetimi", desc: "Tüm ekibinizi tek platformda yönetin" },
    { icon: <Shield size={20} />, title: "Güvenli Altyapı", desc: "Verileriniz her zaman güvende" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a1a] font-sans flex">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-[#0a0a1a] to-purple-950/30" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" style={{ animation: 'float 4s ease-in-out infinite reverse' }} />
        <div className="absolute top-[50%] left-[50%] w-[300px] h-[300px] rounded-full bg-blue-600/5 blur-[80px]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* LEFT PANEL - Branding */}
      <div className="hidden lg:flex w-[55%] relative z-10 flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
            <img className="w-7 h-7 object-contain" src="/logo.png" alt="logo" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">Mpando</span>
        </div>

        {/* Hero Content */}
        <div className="max-w-xl animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
            <Zap size={14} />
            İnşaat Yönetim Platformu
          </div>

          <h1 className="text-5xl font-bold text-white leading-[1.15] mb-6">
            Şantiye Yönetimi
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              Yeni Nesil
            </span>
            {' '}Çözüm
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md">
            Projelerinizi, ekiplerinizi ve finansal süreçlerinizi tek bir platformda yönetin. Veri odaklı kararlar alın.
          </p>

          {/* Feature Cards */}
          <div className="space-y-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-300 group animate-slide-in-left"
                style={{ animationDelay: `${0.4 + i * 0.1}s`, animationFillMode: 'both' }}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-white text-sm font-semibold mb-0.5">{feature.title}</h3>
                  <p className="text-slate-500 text-xs">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="flex items-center gap-6 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>
          {[
            { icon: <Briefcase size={16} />, value: stats.projects, label: 'Aktif Proje', suffix: '' },
            { icon: <Users size={16} />, value: stats.users, label: 'Kullanıcı', suffix: '' },
            { icon: <Building2 size={16} />, value: stats.customers, label: 'Müşteri', suffix: '' },
          ].map((stat, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="w-px h-10 bg-white/10" />}
              <div className="group">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-indigo-400/70">{stat.icon}</div>
                  <p className="text-2xl font-extrabold text-white tracking-tight">
                    {stats.loadingStats ? (
                      <span className="inline-block w-10 h-6 bg-white/10 rounded animate-pulse" />
                    ) : stat.value !== null ? (
                      <>{stat.value}{stat.suffix}</>
                    ) : '—'}
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL - Login Form */}
      <div className="w-full lg:w-[45%] relative z-10 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 animate-fade-in">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
              <img className="w-7 h-7 object-contain" src="/logo.png" alt="logo" />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">Mpando</span>
          </div>

          {/* Form Card */}
          <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 lg:p-10 shadow-2xl shadow-black/20 animate-scale-in">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Tekrar Hoş Geldiniz
              </h2>
              <p className="text-slate-400 text-sm">
                Devam etmek için hesabınıza giriş yapın
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-5 flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm animate-fade-in">
                <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  placeholder="ornek@mail.com"
                  className="w-full px-4 py-3.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Şifre
                  </label>
                  <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                    Şifremi Unuttum
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all text-sm pr-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30 cursor-pointer accent-indigo-500"
                />
                <label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer select-none">
                  Beni hatırla
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold py-3.5 rounded-xl hover:from-indigo-500 hover:to-indigo-400 transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Giriş Yapılıyor...
                  </>
                ) : (
                  <>
                    Giriş Yap
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]" />
              </div>
            </div>

            <p className="text-center text-xs text-slate-500">
              Hesabınız yok mu?{' '}
              <a href="#" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                İletişime Geçin
              </a>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-600 mt-6">
            © 2024 Mpando. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
