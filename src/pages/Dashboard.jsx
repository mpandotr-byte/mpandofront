import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from "../context/AuthContext";
import { api } from '../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell, PieChart, Pie
} from 'recharts';
import {
  Plus, FileText, Users, Package, ArrowUpRight, ArrowDownRight,
  AlertTriangle, CheckCircle, Clock, MoreHorizontal, DollarSign, Briefcase,
  AlertCircle, Hourglass, TrendingUp, Activity, Wallet,
  ArrowRight, Eye, Layers, Zap, CalendarDays, MapPin, Calendar
} from 'lucide-react';


const defaultFinancialData = [
  { name: 'Oca', income: 0, expense: 0 },
  { name: 'Şub', income: 0, expense: 0 },
  { name: 'Mar', income: 0, expense: 0 },
  { name: 'Nis', income: 0, expense: 0 },
  { name: 'May', income: 0, expense: 0 },
  { name: 'Haz', income: 0, expense: 0 },
  { name: 'Tem', income: 0, expense: 0 },
  { name: 'Ağu', income: 0, expense: 0 },
  { name: 'Eyl', income: 0, expense: 0 },
  { name: 'Eki', income: 0, expense: 0 },
  { name: 'Kas', income: 0, expense: 0 },
  { name: 'Ara', income: 0, expense: 0 },
];

const defaultStockData = [];
const STOCK_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#4f46e5', '#7c3aed'];
const defaultActivities = [];
const defaultPayments = [];


// --- Status helpers ---
const getStatusClasses = (status) => {
  switch (status) {
    case 'Devam Ediyor': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Planlanıyor': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Gecikmede': return 'bg-red-50 text-red-700 border-red-200';
    case 'Bitiyor': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Tamamlandı': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Devam Ediyor': return <Clock size={12} />;
    case 'Planlanıyor': return <Hourglass size={12} />;
    case 'Gecikmede': return <AlertCircle size={12} />;
    case 'Bitiyor': return <Hourglass size={12} />;
    case 'Tamamlandı': return <CheckCircle size={12} />;
    default: return null;
  }
};

const getProgressBarColor = (status) => {
  switch (status) {
    case 'Devam Ediyor': return 'bg-gradient-to-r from-blue-500 to-blue-400';
    case 'Planlanıyor': return 'bg-gradient-to-r from-purple-500 to-purple-400';
    case 'Gecikmede': return 'bg-gradient-to-r from-red-500 to-red-400';
    case 'Bitiyor': return 'bg-gradient-to-r from-amber-500 to-amber-400';
    case 'Tamamlandı': return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
    default: return 'bg-slate-500';
  }
};

const getProgressTextColor = (status) => {
  switch (status) {
    case 'Devam Ediyor': return 'text-blue-600';
    case 'Planlanıyor': return 'text-purple-600';
    case 'Gecikmede': return 'text-red-600';
    case 'Bitiyor': return 'text-amber-600';
    case 'Tamamlandı': return 'text-emerald-600';
    default: return 'text-slate-600';
  }
};


// --- Custom Chart Tooltip ---
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-xl border border-slate-200 px-4 py-3 shadow-xl shadow-black/5">
      <p className="text-xs font-bold text-slate-800 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-500">{entry.name}:</span>
          <span className="font-bold text-slate-800 ml-auto">₺{Number(entry.value).toLocaleString('tr-TR')}</span>
        </div>
      ))}
    </div>
  );
}


// --- STAT CARD ---
function StatCard({ title, value, subtext, trend, trendUp, icon, iconBg, iconColor, loading }) {
  if (loading) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="w-11 h-11 bg-slate-100 rounded-xl"></div>
          <div className="w-14 h-5 bg-slate-50 rounded-full"></div>
        </div>
        <div className="w-16 h-3 bg-slate-100 rounded mb-2"></div>
        <div className="w-24 h-7 bg-slate-200 rounded"></div>
      </div>
    );
  }
  return (
    <div className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm card-hover relative overflow-hidden">
      {/* Subtle orange gradient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D36A47]/[0.02] via-transparent to-[#D36A47]/[0.05] group-hover:from-[#D36A47]/[0.08] group-hover:to-[#D36A47]/[0.05] transition-all duration-500 pointer-events-none rounded-2xl" />

      <div className="relative flex justify-between items-start mb-3.5">
        <div className={`p-2.5 rounded-xl ${iconBg || 'bg-[#D36A47]/10'} ${iconColor || 'text-[#D36A47]'} transition-transform group-hover:scale-110 duration-300`}>
          {icon}
        </div>
        {trend && (
          <span className={`flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
            {trendUp ? <ArrowUpRight size={13} className="mr-0.5" /> : <ArrowDownRight size={13} className="mr-0.5" />}
            {trend}
          </span>
        )}
      </div>
      <h3 className="relative text-slate-500 text-[11px] font-bold uppercase tracking-[0.08em] mb-1">{title}</h3>
      <div className="relative flex items-end gap-2">
        <span className="text-[22px] font-extrabold text-[#0A1128] tracking-tight">{value}</span>
        {subtext && <span className="text-[11px] text-slate-400 mb-0.5 font-medium">{subtext}</span>}
      </div>
    </div>
  );
}


// --- SECTION HEADER ---
function SectionHeader({ title, subtitle, action, icon }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        {icon && <div className="p-1.5 rounded-lg bg-[#D36A47]/10 text-[#D36A47]">{icon}</div>}
        <div>
          <h2 className="text-[15px] font-bold text-[#0A1128]">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}


// --- MAIN DASHBOARD ---
function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [projects, setProjects] = useState([]);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [financialData, setFinancialData] = useState(defaultFinancialData);
  const [recentPayments, setRecentPayments] = useState(defaultPayments);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [users, setUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState({
    projects: true, finance: true, users: true, activities: true
  });

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const { user } = useAuth();

  const formatCurrency = (value) => {
    if (value >= 1000000) return `₺${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₺${(value / 1000).toFixed(1)}K`;
    return `₺${value}`;
  };

  useEffect(() => {
    if (!user || !user.company_id) return;

    const loadAllDashboardData = async () => {
      let validUserIds = [];
      try {
        const usersData = await api.get('/users');
        validUserIds = (usersData || [])
          .filter(u => String(u.company_id) === String(user.company_id))
          .map(u => String(u.id));
      } catch (uErr) {
        console.error("Users list couldn't be fetched:", uErr);
        validUserIds = [String(user.id)];
      }

      // 1. Projects
      const fetchProjectsData = async () => {
        try {
          const data = await api.get('/projects');
          const filtered = (data || []).filter(p => String(p.contractor_id) === String(user.company_id));
          const mapped = filtered.map(p => {
            const rawStatus = String(p.status || '').toUpperCase();
            let mappedStatus = 'Devam Ediyor';
            if (rawStatus === 'IN_PROGRESS' || p.status === 'Devam Ediyor') mappedStatus = 'Devam Ediyor';
            else if (rawStatus === 'PLANNING' || p.status === 'Planlanıyor') mappedStatus = 'Planlanıyor';
            else if (rawStatus === 'COMPLETED' || p.status === 'Tamamlandı') mappedStatus = 'Tamamlandı';
            else if (rawStatus === 'DELAYED' || p.status === 'Gecikmede') mappedStatus = 'Gecikmede';
            else if (p.status === 'Bitiyor') mappedStatus = 'Bitiyor';

            return {
              ...p,
              name: p.name || p.project_name || 'İsimsiz Proje',
              status: mappedStatus,
              progress: mappedStatus === 'Tamamlandı' ? 100
                : (p.progress !== undefined && p.progress !== null
                  ? p.progress
                  : (mappedStatus === 'Planlanıyor' ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 50) + 30))
            };
          });
          setProjects(mapped);
          setActiveProjectsCount(mapped.filter(p => p.status === 'Devam Ediyor').length);
        } catch (e) { console.error("Projects error:", e); }
        setLoading(prev => ({ ...prev, projects: false }));
      };

      // 2. Finance
      const fetchFinanceData = async () => {
        try {
          const [trans, recent] = await Promise.all([
            api.get('/finance/transactions'),
            api.get('/finance/transactions/recent')
          ]);

          const myTrans = (trans || []).filter(t => validUserIds.includes(String(t.created_by)));

          const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
          const monthly = monthNames.map(name => ({ name, income: 0, expense: 0 }));
          let incomeSum = 0, expenseSum = 0;

          myTrans.forEach(t => {
            const date = new Date(t.transaction_date || t.created_at);
            if (isNaN(date.getTime())) return;
            const amount = Math.abs(Number(t.amount) || 0);
            const monthIdx = date.getMonth();

            // CASH = Gelir, WIRE = Gider
            const isIncome = (t.payment_type || '').toUpperCase() === 'CASH';

            if (isIncome) {
              monthly[monthIdx].income += amount;
              incomeSum += amount;
            } else {
              monthly[monthIdx].expense += amount;
              expenseSum += amount;
            }
          });

          setTotalIncome(incomeSum); setTotalExpense(expenseSum); setFinancialData(monthly);
          setRecentPayments((recent || []).filter(t => validUserIds.includes(String(t.created_by))).slice(0, 4).map(r => ({
            recipient: r.description || 'İşlem',
            amount: `₺${Number(r.amount).toLocaleString('tr-TR')}`,
            date: new Date(r.transaction_date || r.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
            status: (r.payment_type || '').toUpperCase() === 'CASH' ? 'Gelir' : 'Gider'
          })));
        } catch (e) { console.error("Finance error:", e); }
        setLoading(prev => ({ ...prev, finance: false }));
      };

      // 3. Users list for performance
      const fetchUsersData = async () => {
        try {
          const uData = await api.get('/users');
          const myUsers = (uData || []).filter(u => String(u.company_id) === String(user.company_id));
          setUsers(myUsers);
        } catch (e) {
          console.error("Users list couldn't be fetched:", e);
        }
        setLoading(prev => ({ ...prev, users: false }));
      };

      // 4. Activities
      const fetchActivitiesData = async () => {
        try {
          const acts = await api.get('/activities');
          const myActs = (acts || []).filter(a => (a.company_id && String(a.company_id) === String(user.company_id)) || validUserIds.includes(String(a.user_id || a.created_by)));
          const mapped = myActs.map(a => {
            const calculateTimeAgo = (dateStr) => {
              if (!dateStr) return '-';
              const date = new Date(new Date(dateStr).getTime() + (3 * 60 * 60 * 1000));
              const diff = new Date() - date;
              if (diff < 3600000) return `${Math.max(Math.floor(diff / 60000), 1)} dk önce`;
              if (diff < 86400000) return `${Math.floor(diff / 3600000)} saat önce`;
              return `${Math.floor(diff / 86400000)} gün önce`;
            };
            return {
              id: a.id || Math.random(),
              title: a.title || a.action || 'Aktivite',
              desc: a.description || '',
              time: calculateTimeAgo(a.created_at || a.timestamp),
              icon: <Clock size={16} />,
              rawDate: new Date(a.created_at || a.timestamp)
            };
          }).sort((a, b) => b.rawDate - a.rawDate).slice(0, 6);
          setRecentActivities(mapped);
        } catch (e) { console.error("Activities error:", e); }
        setLoading(prev => ({ ...prev, activities: false }));
      };

      fetchProjectsData();
      fetchFinanceData();
      fetchUsersData();
      fetchActivitiesData();
    };

    loadAllDashboardData();
  }, [user]);

  const netProfit = totalIncome - totalExpense;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={closeMobileMenu} />

      <main className="flex-1 overflow-y-auto h-screen pt-16 md:pt-0">
        <Navbar title="Dashboard" toggleMobileMenu={toggleMobileMenu} />

        <div className="px-4 sm:px-6 md:px-8 pb-12 pt-6 space-y-7">

          {/* ═════════════════ WELCOME BANNER ═════════════════ */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0A1128] via-[#111A35] to-[#010614] rounded-[2rem] p-8 lg:p-12 text-white animate-fade-in shadow-2xl shadow-[#0A1128]/20 border border-white/[0.05]">
            {/* Background Pattern & Premium Glow */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSI0MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-20" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D36A47]/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#D36A47]/5 rounded-full blur-[80px]" />

            {/* Orange Logo Watermark behind text */}
            <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 opacity-10 pointer-events-none group">
              <div className="relative">
                <div className="absolute inset-0 blur-3xl bg-[#D36A47]/40 rounded-full" />
                <Activity size={360} strokeWidth={0.5} className="relative text-[#D36A47] -rotate-12 transition-transform duration-700 group-hover:rotate-0" />
              </div>
            </div>

            <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#D36A47]/20 border border-[#D36A47]/30 shadow-inner">
                    <Zap size={20} className="text-[#D36A47] fill-[#D36A47]/20" />
                  </div>
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">Kontrol Paneli</span>
                </div>

                <div className="max-w-2xl">
                  <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-3 leading-tight">
                    Hoş Geldiniz, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#D36A47]">{user?.full_name?.split(' ')[0] || 'Kullanıcı'} 👋</span>
                  </h1>
                  <p className="text-slate-400 text-sm lg:text-base font-medium leading-relaxed">
                    İşletmenizin nabzını tutun. Projelerinizdeki son durumu ve finansal sağlığınızı buradan anlık olarak izleyebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => window.location.href = '/projects'}
                  className="group flex items-center gap-3 px-8 py-4 bg-[#D36A47] text-white rounded-2xl text-sm font-bold shadow-xl shadow-[#D36A47]/30 hover:bg-[#C25936] hover:-translate-y-1 transition-all duration-300 active:scale-95"
                >
                  <Eye size={18} className="group-hover:scale-110 transition-transform" />
                  Projeleri Yönet
                </button>
              </div>
            </div>
          </div>


          {/* ═════════════════ STAT CARDS ═════════════════ */}
          {(() => {
            // Akıllı trend hesaplama: bu ayda veri varsa bu ay vs geçen ay, yoksa geçen ay vs ondan önceki ay
            const now = new Date();
            const cm = now.getMonth(); // current month
            const pm = cm === 0 ? 11 : cm - 1; // previous month
            const ppm = pm === 0 ? 11 : pm - 1; // month before previous

            const cmIncome = financialData[cm]?.income || 0;
            const pmIncome = financialData[pm]?.income || 0;
            const ppmIncome = financialData[ppm]?.income || 0;
            const cmExpense = financialData[cm]?.expense || 0;
            const pmExpense = financialData[pm]?.expense || 0;
            const ppmExpense = financialData[ppm]?.expense || 0;

            // Bu ayda veri varsa: bu ay vs geçen ay. Yoksa: geçen ay vs ondan önceki ay
            const calcTrend = (cur, prev, prevPrev) => {
              if (cur > 0 && prev > 0) return Math.round(((cur - prev) / prev) * 100);
              if (cur === 0 && prev > 0 && prevPrev > 0) return Math.round(((prev - prevPrev) / prevPrev) * 100);
              if (cur > 0 && prev === 0) return 100;
              return null; // veri yetersiz
            };

            const incomeTrend = calcTrend(cmIncome, pmIncome, ppmIncome);
            const expenseTrend = calcTrend(cmExpense, pmExpense, ppmExpense);
            const projectTrend = projects.length > 0 ? Math.round((activeProjectsCount / projects.length) * 100) : 0;

            return (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                <StatCard
                  title="Aktif Projeler"
                  value={activeProjectsCount.toString()}
                  subtext={`/ ${projects.length} proje`}
                  icon={<Briefcase size={20} />}
                  iconBg="bg-[#D36A47]/10" iconColor="text-[#D36A47]"
                  trend={`%${projectTrend}`} trendUp={projectTrend >= 50}
                  loading={loading.projects}
                />
                <StatCard
                  title="Toplam Gelir"
                  value={totalIncome > 0 ? formatCurrency(totalIncome) : "₺0"}
                  subtext="bu yıl"
                  icon={<TrendingUp size={20} />}
                  iconBg="bg-emerald-50" iconColor="text-emerald-600"
                  trend={incomeTrend !== null ? `${incomeTrend >= 0 ? '+' : ''}%${incomeTrend}` : null} trendUp={incomeTrend !== null ? incomeTrend >= 0 : true}
                  loading={loading.finance}
                />
                <StatCard
                  title="Toplam Gider"
                  value={totalExpense > 0 ? formatCurrency(totalExpense) : "₺0"}
                  subtext="bu yıl"
                  icon={<Wallet size={20} />}
                  iconBg="bg-rose-50" iconColor="text-rose-500"
                  trend={expenseTrend !== null ? `${expenseTrend >= 0 ? '+' : ''}%${expenseTrend}` : null} trendUp={expenseTrend !== null ? expenseTrend <= 0 : true}
                  loading={loading.finance}
                />
                <StatCard
                  title="Kullanıcı Sayısı"
                  value={users.length.toString()}
                  subtext="aktif personel"
                  icon={<Users size={20} />}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                  loading={loading.users}
                />
              </div>
            );
          })()}


          {/* ═════════════════ PROJECTS & CASH FLOW ═════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">

            {/* Project Status Cards */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 pb-3 border-b border-slate-100">
                <SectionHeader
                  title="Proje Durumları"
                  icon={<Layers size={15} />}
                  action={
                    <button
                      onClick={() => window.location.href = '/projects'}
                      className="flex items-center gap-1 text-[#D36A47] text-xs font-bold hover:text-[#C25936] transition-colors px-2.5 py-1 rounded-lg hover:bg-[#D36A47]/10"
                    >
                      Tümü <ArrowRight size={13} />
                    </button>
                  }
                />
              </div>
              <div className="p-4 space-y-2 overflow-y-auto max-h-[340px] scrollbar-hide">
                {loading.projects ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="p-3.5 animate-pulse rounded-xl bg-slate-50">
                      <div className="flex justify-between items-start">
                        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                        <div className="h-5 bg-slate-100 rounded-full w-20"></div>
                      </div>
                    </div>
                  ))
                ) : projects.length > 0 ? projects.map((project) => (
                  <div
                    key={project.id}
                    className="group p-3.5 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50/80 transition-all cursor-pointer"
                    onClick={() => window.location.href = `/projects/${project.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 mr-3">
                        <h4 className="font-bold text-slate-800 text-[13px] truncate group-hover:text-[#D36A47] transition-colors">{project.name}</h4>
                      </div>
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusClasses(project.status)}`}>
                        {getStatusIcon(project.status)} {project.status}
                      </span>
                    </div>
                    {project.address && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <MapPin size={11} className="text-slate-300" />
                        <span className="text-[11px] text-slate-400 font-medium">{project.address}</span>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="flex flex-col items-center py-10 text-slate-400">
                    <Briefcase size={28} className="mb-2 text-slate-300" />
                    <p className="text-sm font-medium">Proje bulunamadı.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cash Flow Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 pb-3 border-b border-slate-100">
                <SectionHeader
                  title="Nakit Akışı Analizi"
                  subtitle="Aylık gelir-gider karşılaştırması"
                  icon={<Activity size={15} />}
                />
                {/* Legend + Net */}
                <div className="flex items-center gap-5 mt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                    <span className="text-[11px] text-slate-500 font-medium">Gelir</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-rose-400" />
                    <span className="text-[11px] text-slate-500 font-medium">Gider</span>
                  </div>
                  {netProfit !== 0 && (
                    <div className="ml-auto flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-medium">Net:</span>
                      <span className={`text-xs font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {netProfit >= 0 ? '+' : ''}{formatCurrency(netProfit)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 pt-3">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={4} barCategoryGap="25%">
                      <defs>
                        <linearGradient id="barIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D36A47" />
                          <stop offset="100%" stopColor="#C25936" />
                        </linearGradient>
                        <linearGradient id="barExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1E293B" />
                          <stop offset="100%" stopColor="#0A1128" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} tickFormatter={(v) => `₺${v / 1000}k`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)', radius: 8 }} />
                      <Bar dataKey="income" name="Gelir" fill="url(#barIncome)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                      <Bar dataKey="expense" name="Gider" fill="url(#barExpense)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>


          {/* ═════════════════ USER PERFORMANCE ═════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">

            {/* User Performance Table */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 pb-3 border-b border-slate-100">
                <SectionHeader
                  title="Saha Personel Performansı"
                  subtitle="Aktiflik ve ekleme durumları"
                  icon={<Activity size={15} />}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>PERSONEL</th>
                      <th>ROL</th>
                      <th className="text-center">AKTİF PROJELER</th>
                      <th className="text-center">SON AKTİVİTE</th>
                      <th className="text-right">PERFORMANS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading.users ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i}>
                          <td className="py-4"><div className="h-4 bg-slate-100 rounded w-2/3 animate-shimmer"></div></td>
                          <td className="py-4"><div className="h-4 bg-slate-50 rounded w-1/2 animate-shimmer"></div></td>
                          <td className="py-4"><div className="h-4 bg-slate-100 rounded w-10 mx-auto animate-shimmer"></div></td>
                          <td className="py-4"><div className="h-4 bg-slate-50 rounded w-20 ml-auto animate-shimmer"></div></td>
                          <td className="py-4"><div className="h-4 bg-slate-50 rounded w-32 ml-auto animate-shimmer"></div></td>
                        </tr>
                      ))
                    ) : users.length > 0 ? users.map((u, idx) => {
                      const userProjects = projects.filter(p => String(p.contractor_id) === String(u.id)).length;
                      const performanceScore = Math.floor(Math.random() * 40) + 60; // Mock score
                      return (
                        <tr key={idx}>
                          <td>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#0A1128] flex items-center justify-center text-white text-[10px] font-black">
                                {u.full_name?.charAt(0) || u.name?.charAt(0) || '?'}
                              </div>
                              <span className="font-semibold text-slate-700 text-[13px]">{u.full_name || u.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                              {u.role || 'Personel'}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="font-bold text-slate-800 text-[13px]">{userProjects}</span>
                          </td>
                          <td className="text-center">
                            <span className="text-[11px] text-slate-500 font-medium">Bu Hafta</span>
                          </td>
                          <td className="text-right">
                            <div className="flex flex-col items-end gap-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400">%{performanceScore}</span>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${performanceScore}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="5">
                          <div className="flex flex-col items-center py-10 text-slate-400">
                            <Users size={28} className="mb-2 text-slate-300" />
                            <p className="text-sm font-medium">Kullanıcı verisi bulunamadı.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>


          {/* ═════════════════ TIMELINE & PAYMENTS ═════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 pb-3 border-b border-slate-100">
                <SectionHeader
                  title="Son Aktiviteler"
                  subtitle="Sistem üzerindeki son hareketler"
                  icon={<CalendarDays size={15} />}
                />
              </div>
              <div className="p-5">
                <div className="relative pl-1">
                  {/* Vertical Line */}
                  <div className="absolute left-[17px] top-3 bottom-4 w-[2px] bg-gradient-to-b from-[#D36A47]/30 via-slate-100 to-transparent rounded-full"></div>

                  <div className="space-y-5">
                    {loading.activities ? (
                      [...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-4 animate-pulse">
                          <div className="w-9 h-9 bg-slate-100 rounded-xl"></div>
                          <div className="flex-1 space-y-2 py-1">
                            <div className="h-3.5 bg-slate-100 rounded w-1/3"></div>
                            <div className="h-3 bg-slate-50 rounded w-2/3"></div>
                          </div>
                        </div>
                      ))
                    ) : recentActivities.length > 0 ? recentActivities.map((act, idx) => (
                      <div key={act.id} className="relative flex gap-3.5 group">
                        <div className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${idx === 0
                          ? 'bg-[#D36A47]/10 text-[#D36A47] shadow-sm shadow-[#D36A47]/10'
                          : 'bg-white border border-slate-200 text-slate-400 group-hover:text-[#D36A47] group-hover:border-[#D36A47]/30'
                          }`}>
                          {act.icon}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-[13px] font-bold text-slate-800 truncate">{act.title}</h4>
                            <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                              {act.time}
                            </span>
                          </div>
                          {act.desc && (
                            <p className="text-[12px] text-slate-500 mt-0.5 truncate">{act.desc}</p>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="flex flex-col items-center py-8 text-slate-400">
                        <Clock size={28} className="mb-2 text-slate-300" />
                        <p className="text-sm font-medium">Hiç aktivite bulunmuyor.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 pb-3 border-b border-slate-100">
                <SectionHeader
                  title="Son Ödemeler"
                  subtitle="Son finansal hareketler"
                  icon={<DollarSign size={15} />}
                  action={
                    <button className="flex items-center gap-1 text-[#D36A47] text-xs font-bold hover:text-[#C25936] transition-colors px-2.5 py-1 rounded-lg hover:bg-[#D36A47]/10">
                      Tümünü Gör <ArrowRight size={13} />
                    </button>
                  }
                />
              </div>

              <div className="p-5 space-y-2.5">
                {loading.finance ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                        <div className="space-y-2">
                          <div className="h-3.5 bg-slate-200 rounded w-24"></div>
                          <div className="h-3 bg-slate-100 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="space-y-2 text-right">
                        <div className="h-3.5 bg-slate-200 rounded w-16 ml-auto"></div>
                        <div className="h-3 bg-slate-100 rounded w-12 ml-auto"></div>
                      </div>
                    </div>
                  ))
                ) : recentPayments.length > 0 ? recentPayments.map((pay, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 flex items-center justify-center text-indigo-500 group-hover:from-indigo-100 group-hover:to-purple-100 transition-all">
                        <DollarSign size={17} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-[13px]">{pay.recipient}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{pay.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-slate-900 text-[13px]">{pay.amount}</p>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                        {pay.status}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center py-8 text-slate-400">
                    <DollarSign size={28} className="mb-2 text-slate-300" />
                    <p className="text-sm font-medium">Henüz ödeme kaydı yok.</p>
                  </div>
                )}

                <button className="w-full mt-1 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-sm font-semibold hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                  <Plus size={16} />
                  Yeni Ödeme Ekle
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;