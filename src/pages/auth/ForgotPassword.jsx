import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import { Mail, Lock, ArrowLeft, CheckCircle, Eye, EyeOff, KeyRound } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 1 = email input, 2 = token + new password, 3 = success
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [email, setEmail] = useState("");

  // Step 2
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
      setStep(2);
    }
  }, [searchParams]);

  const handleSendReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setStep(2);
    } catch (err) {
      setError(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", { token, newPassword });
      setStep(3);
    } catch (err) {
      setError(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const Spinner = () => (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a1a] font-sans flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-[#0a0a1a] to-purple-950/30" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-orange-600/10 blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px]" style={{ animation: 'float 4s ease-in-out infinite reverse' }} />
        <div className="absolute top-[50%] left-[50%] w-[300px] h-[300px] rounded-full bg-blue-600/5 blur-[80px]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[420px] px-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center animate-fade-in">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
            <img className="w-7 h-7 object-contain" src="/logo.png" alt="logo" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">Mpando</span>
        </div>

        {/* Form Card */}
        <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 lg:p-10 shadow-2xl shadow-black/20 animate-scale-in">

          {/* ===== STEP 1: Email Input ===== */}
          {step === 1 && (
            <>
              <div className="mb-8 text-center">
                <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Mail size={24} className="text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Şifremi Unuttum
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  E-posta adresinizi girin, size şifre sıfırlama bağlantısı göndereceğiz.
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm animate-fade-in">
                  <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSendReset} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    placeholder="ornek@mail.com"
                    className="w-full px-4 py-3.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold py-3.5 rounded-xl hover:from-orange-500 hover:to-orange-400 transition-all transform active:scale-[0.98] shadow-lg shadow-orange-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Mail size={18} />
                      Sıfırlama Bağlantısı Gönder
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors"
                >
                  <ArrowLeft size={16} />
                  Giriş sayfasına dön
                </button>
              </div>
            </>
          )}

          {/* ===== STEP 2: Token + New Password ===== */}
          {step === 2 && (
            <>
              <div className="mb-8 text-center">
                <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <KeyRound size={24} className="text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Yeni Şifre Belirle
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  E-postanıza gönderilen kodu girin ve yeni şifrenizi belirleyin.
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm animate-fade-in">
                  <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* Token */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                    Sıfırlama Kodu
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="E-postanıza gelen kodu girin"
                      className="w-full px-4 py-3.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all text-sm pl-11"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                    />
                    <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full px-4 py-3.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all text-sm pl-11 pr-11"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                    Şifre Tekrar
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full px-4 py-3.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all text-sm pl-11 pr-11"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold py-3.5 rounded-xl hover:from-orange-500 hover:to-orange-400 transition-all transform active:scale-[0.98] shadow-lg shadow-orange-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Şifre Sıfırlanıyor...
                    </>
                  ) : (
                    "Şifreyi Sıfırla"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => { setStep(1); setError(""); }}
                  className="inline-flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors"
                >
                  <ArrowLeft size={16} />
                  Geri dön
                </button>
              </div>
            </>
          )}

          {/* ===== STEP 3: Success ===== */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Şifre Başarıyla Sıfırlandı
              </h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Yeni şifreniz başarıyla belirlendi. Artık giriş yapabilirsiniz.
              </p>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold py-3.5 rounded-xl hover:from-orange-500 hover:to-orange-400 transition-all transform active:scale-[0.98] shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2"
              >
                Giriş Yap
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          © 2026 Mpando. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
