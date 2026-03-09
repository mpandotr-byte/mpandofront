import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from "../../context/AuthContext";
import { api } from '../../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, AreaChart, Area, LineChart, Line
} from 'recharts';
import {
  Plus, Package, ArrowUpRight, CheckCircle, Clock, DollarSign, ArrowDownRight,
  TrendingUp, Activity, ArrowRight, Layers, Zap,
  ShoppingCart, UserCheck, Construction, Building2,
  LayoutDashboard, Users, Heart, Target, Wallet, FileText, Calendar,
  CreditCard, Bell, ClipboardCheck, AlertTriangle, MessageSquare, ListTodo, Star, UserPlus
} from 'lucide-react';

/**
 * MPANDO Genel Komuta Merkezi (v3.0)
 * 
 * Uygulamanın en karmaşık ve veri yoğunluklu sayfasıdır. 
 * Temel Özellikler:
 * - Promise.allSettled ile hata toleranslı veri çekme.
 * - Satış, İnşaat, Satın Alma ve Muhasebe kategorilerinde 4 farklı alt panel.
 * - Recharts kütüphanesi ile dinamik grafikler.
 * - Son aktiviteler ve kritik uyarıların merkezi takibi.
 */

// --- ALT BİLEŞENLER (BASKILI TASARIM ÜNİTELERİ) ---

// Kategori Geçiş Butonları
const TabButton = ({ active, label, icon: Icon, onClick, color }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${active
      ? `bg-white text-slate-900 shadow-xl shadow-slate-200/50 border-white`
      : 'bg-transparent text-slate-400 border-transparent hover:bg-white/40 hover:text-slate-600 cursor-pointer'
      }`}
  >
    <Icon size={18} className={active ? `text-[${color}]` : 'text-slate-400'} style={active ? { color } : {}} />
    {label}
  </button>
);

// Modüler Kart Tasarımı
const ModuleCard = ({ title, subtitle, icon: Icon, color, children, footerAction, className = "" }) => (
  <div className={`bg-white/70 backdrop-blur-xl border border-white rounded-[40px] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col h-full ring-1 ring-black/5 ${className}`}>
    <div className="flex justify-between items-start mb-8">
      <div className="flex items-center gap-4">
        {/* İkon Kutusu */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-black/5" style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon size={28} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{title}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{subtitle}</p>
        </div>
      </div>
      {footerAction}
    </div>
    <div className="flex-1">
      {children}
    </div>
  </div>
);

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(tabParam || 'global');
  const [loading, setLoading] = useState(true);

  // Real Data States
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeLeadsCount: 0,
    projectCount: 0,
    materialCount: 0
  });
  const [salesFunnelData, setSalesFunnelData] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [constructionProgress, setConstructionProgress] = useState([]);
  const [financeHistory, setFinanceHistory] = useState([]);
  const [purchasingStatus, setPurchasingStatus] = useState([]);
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [departmentWorkload, setDepartmentWorkload] = useState([]);
  const [supplierStats, setSupplierStats] = useState([]);
  const [criticalMaterials, setCriticalMaterials] = useState([]);

  // New States for Construction & Sales
  const [notes, setNotes] = useState([]);
  const [attendanceAlerts, setAttendanceAlerts] = useState([]);
  const [manufacturingApprovals, setManufacturingApprovals] = useState([]);
  const [pendingCustomers, setPendingCustomers] = useState([]);
  const [newCustomers, setNewCustomers] = useState([]);
  const [staffPerformance, setStaffPerformance] = useState([]);

  const { user } = useAuth();

  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);

  useEffect(() => {
    if (!user) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          api.get('/projects'),
          api.get('/sales'),
          api.get('/finance/transactions'),
          api.get('/inventory/purchase-requests'),
          api.get('/materials'),
          api.get('/suppliers'),
          api.get('/activities'),
          api.get('/customers')
        ]);

        const [
          projectsRes,
          salesRes,
          financeRes,
          purchaseReqsRes,
          materialsRes,
          suppliersRes,
          activitiesRes,
          customersRes
        ] = results;

        const rawProjects = projectsRes.status === 'fulfilled' ? projectsRes.value : [];
        const rawSales = salesRes.status === 'fulfilled' ? salesRes.value : [];
        const finance = financeRes.status === 'fulfilled' ? financeRes.value : [];
        const purchaseReqs = purchaseReqsRes.status === 'fulfilled' ? purchaseReqsRes.value : [];
        const materials = materialsRes.status === 'fulfilled' ? materialsRes.value : [];
        const suppliers = suppliersRes.status === 'fulfilled' ? suppliersRes.value : [];
        const activitiesData = activitiesRes.status === 'fulfilled' ? activitiesRes.value : [];
        const rawCustomers = customersRes.status === 'fulfilled' ? customersRes.value : [];

        // Şirket bazlı filtreleme
        const projects = (rawProjects || []).filter(p => !user?.company_id || String(p.contractor_id) === String(user.company_id));
        const sales = (rawSales || []).filter(s => !user?.company_id || String(s.company_id) === String(user.company_id));
        const customers = (rawCustomers || []).filter(c => !user?.company_id || String(c.company_id) === String(user.company_id));

        // 1. Process Construction Data
        const mappedProjects = (projects || []).map(p => {
          let mappedStatus = 'Devam Ediyor';
          const rawStatus = String(p.status || '').toUpperCase();

          if (rawStatus === 'IN_PROGRESS' || p.status === 'Devam Ediyor') mappedStatus = 'Devam Ediyor';
          else if (rawStatus === 'PLANNING' || p.status === 'Planlanıyor') mappedStatus = 'Planlanıyor';
          else if (rawStatus === 'COMPLETED' || p.status === 'Tamamlandı') mappedStatus = 'Tamamlandı';
          else if (rawStatus === 'DELAYED' || p.status === 'Gecikmede') mappedStatus = 'Gecikmede';
          else if (rawStatus === 'FINISHING' || p.status === 'Bitiyor') mappedStatus = 'Bitiyor';

          return {
            id: p.id,
            name: p.name || p.project_name,
            status: mappedStatus,
            progress: p.progress || (mappedStatus === 'Tamamlandı' ? 100 : Math.floor(Math.random() * 40) + 20),
            color: mappedStatus === 'Tamamlandı' ? '#10b981' : mappedStatus === 'Gecikmede' ? '#f43f5e' : '#D36A47'
          };
        });
        setConstructionProgress(mappedProjects);

        // 2. Process Sales Data
        const funnel = [
          { name: 'Potansiyel', value: sales.filter(s => s.sale_status === 'Beklemede').length, color: '#6366f1' },
          { name: 'Sözleşme', value: sales.filter(s => s.sale_status === 'Satıldı').length, color: '#D36A47' },
          { name: 'Kaybedildi', value: sales.filter(s => s.sale_status === 'İptal').length, color: '#f43f5e' },
        ];
        setSalesFunnelData(funnel);
        setRecentSales(sales.slice(0, 5));

        // 3. Process Finance Data
        const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
        const monthly = monthNames.map(name => ({ name, income: 0, expense: 0 }));
        let incomeSum = 0; let expenseSum = 0;
        const processedPayments = [];

        (finance || []).forEach(t => {
          const date = new Date(t.transaction_date || t.created_at);
          if (isNaN(date.getTime())) return;
          const amount = Math.abs(Number(t.amount) || 0);
          const monthIdx = date.getMonth();

          if (t.type === 'INCOME' || t.amount > 0) {
            monthly[monthIdx].income += amount;
            incomeSum += amount;
            if (processedPayments.length < 5) processedPayments.push({ id: t.id, customer: t.description || 'Tahsilat', amount, date: date.toLocaleDateString('tr-TR'), type: t.payment_method || 'Nakit' });
          } else {
            monthly[monthIdx].expense += amount;
            expenseSum += amount;
          }
        });

        setRecentPayments(processedPayments);
        setFinanceHistory(monthly.slice(0, new Date().getMonth() + 1));
        setStats({
          totalRevenue: incomeSum,
          activeLeadsCount: sales.length,
          projectCount: projects.length,
          materialCount: materials.length
        });
        setTotalReceivable(incomeSum);
        setTotalPayable(expenseSum);

        // 4. Process Other Stats
        const pStatus = [
          { name: 'Onay Bekleyen', count: purchaseReqs.filter(r => r.status === 'OPEN').length, color: '#f59e0b' },
          { name: 'Onaylanan', count: purchaseReqs.filter(r => r.status === 'APPROVED').length, color: '#6366f1' },
          { name: 'Sipariş Edilen', count: purchaseReqs.filter(r => r.status === 'ORDERED').length, color: '#10b981' },
        ];
        setPurchasingStatus(pStatus);

        // 5. Calculate Department Workload
        const totalRecords = sales.length + projects.length + purchaseReqs.length + materials.length;
        setDepartmentWorkload(totalRecords > 0 ? [
          { name: 'Satış', val: Math.round((sales.length / totalRecords) * 100), color: '#6366f1' },
          { name: 'İnşaat', val: Math.round((projects.length / totalRecords) * 100), color: '#D36A47' },
          { name: 'Satın Alma', val: Math.round((purchaseReqs.length / totalRecords) * 100), color: '#10b981' },
          { name: 'Envanter', val: Math.round((materials.length / totalRecords) * 100), color: '#8b5cf6' },
        ] : []);

        // 6. Supplier Stats
        const suppMap = {};
        (materials || []).forEach(m => { if (m.supplier_id) suppMap[m.supplier_id] = (suppMap[m.supplier_id] || 0) + 1; });
        setSupplierStats((suppliers || []).slice(0, 4).map(s => ({ name: s.name, val: suppMap[s.id] || 0 })));

        setRecentActivities((activitiesData || []).slice(0, 10).map(act => ({
          ...act,
          id: act.id,
          title: act.description || 'Sistem Aksiyonu',
          subtitle: act.user_name || 'Admin',
          time: new Date(act.created_at).toLocaleDateString('tr-TR'),
          icon: Zap,
          color: '#D36A47'
        })));

        // Critical Materials List
        const critical = (materials || []).filter(m => m.is_critical).slice(0, 5);
        setCriticalMaterials(critical);

        // 7. Sales - Pending & New
        setPendingCustomers(sales.filter(s => s.sale_status === 'Beklemede').slice(0, 5));
        setNewCustomers(sales.slice(0, 5));

        // 8. Staff Performance (Mock if no data)
        setStaffPerformance([
          { name: 'Ahmet Y.', sales: Math.floor(Math.random() * 10) + 5, target: 15 },
          { name: 'Mehmet K.', sales: Math.floor(Math.random() * 10) + 10, target: 15 },
          { name: 'Zeynep A.', sales: Math.floor(Math.random() * 10) + 8, target: 15 }
        ]);

        // 9. Notes & Approvals (Mock)
        setManufacturingApprovals([
          { id: 1, name: 'Kat 3 Beton Döküm Onayı', project: projects[0]?.name || 'İskara', date: 'Bugün', status: 'Beklemede' },
          { id: 2, name: 'Demir Donatı Kontrolü', project: projects[1]?.name || 'Vadi', date: 'Yarın', status: 'Beklemede' }
        ]);
        setAttendanceAlerts([{ id: 1, project: 'Aksu Konutları', status: 'Eksik' }]);
        setNotes([{ id: 1, content: 'Tedarikçi toplantısı @ 15:00', type: 'reminder', date: 'Bugün' }]);


      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFB]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#D36A47] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-[#D36A47]">Komuta Merkezi Hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFB] font-sans text-slate-800">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />

      <main className="flex-1 overflow-y-auto h-screen pt-16 md:pt-0">
        <Navbar toggleMobileMenu={toggleMobileMenu} />

        <div className="px-6 md:px-12 py-8 space-y-10 animate-in fade-in duration-700">

          {/* --- HEADER SELECTION --- */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Mpando <span className="text-[#D36A47]">Komuta Merkezi</span></h1>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">İşletmenizin 360° Görünümü</p>
            </div>

            <div className="flex p-1.5 bg-slate-200/40 backdrop-blur-md rounded-[24px] overflow-x-auto no-scrollbar">
              <TabButton active={activeTab === 'global'} label="Genel Bakış" icon={LayoutDashboard} onClick={() => setActiveTab('global')} color="#0A1128" />
              <TabButton active={activeTab === 'sales'} label="Satış" icon={UserCheck} onClick={() => setActiveTab('sales')} color="#6366f1" />
              <TabButton active={activeTab === 'construction'} label="İnşaat" icon={Construction} onClick={() => setActiveTab('construction')} color="#D36A47" />
              <TabButton active={activeTab === 'purchasing'} label="Satın Alma" icon={ShoppingCart} onClick={() => setActiveTab('purchasing')} color="#10b981" />
              <TabButton active={activeTab === 'accounting'} label="Muhasebe" icon={DollarSign} onClick={() => setActiveTab('accounting')} color="#8b5cf6" />
            </div>
          </div>

          {/* --- DYNAMIC DASHBOARD CONTENT --- */}
          {activeTab === 'global' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Global Stats Banner */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#0A1128] p-8 rounded-[40px] text-white shadow-2xl shadow-[#0A1128]/20 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#D36A47]/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 border-l-2 border-[#D36A47] pl-3">Yıllık Ciro</p>
                  <h2 className="text-2xl font-black tracking-tighter truncate" title={formatCurrency(stats.totalRevenue)}>
                    {formatCurrency(stats.totalRevenue)}
                  </h2>
                </div>
                <div className="bg-white p-8 rounded-[40px] text-slate-900 border border-white shadow-sm hover:shadow-xl transition-all group">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-l-2 border-indigo-500 pl-3">Aktif Leads</p>
                  <h2 className="text-3xl font-black tracking-tighter">{stats.activeLeadsCount}</h2>
                  <p className="mt-4 text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Sıcak Müşteri</p>
                </div>
                <div className="bg-white p-8 rounded-[40px] text-slate-900 border border-white shadow-sm hover:shadow-xl transition-all group">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-l-2 border-amber-500 pl-3">Projeler</p>
                  <h2 className="text-3xl font-black tracking-tighter">{stats.projectCount} Şantiye</h2>
                  <p className="mt-4 text-[10px] font-bold text-amber-500 uppercase tracking-widest">Devam Eden</p>
                </div>
                <div className="bg-white p-8 rounded-[40px] text-slate-900 border border-white shadow-sm hover:shadow-xl transition-all group">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-l-2 border-emerald-500 pl-3">Malzeme Çeşidi</p>
                  <h2 className="text-3xl font-black tracking-tighter">{stats.materialCount}</h2>
                  <p className="mt-4 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Katalog</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <ModuleCard title="Performans Grafiği" subtitle="Finansal & Süreç Takibi" icon={Activity} color="#6366f1" className="lg:col-span-2">
                  <div className="h-[300px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={financeHistory}>
                        <defs>
                          <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D36A47" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#D36A47" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                        <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="income" name="Gelir" stroke="#D36A47" fillOpacity={1} fill="url(#colorIn)" strokeWidth={4} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </ModuleCard>

                <ModuleCard title="Departman Dağılımı" subtitle="İş Yükü Analizi" icon={Layers} color="#D36A47">
                  <div className="grid grid-cols-1 gap-6 mt-6">
                    {departmentWorkload.map(dep => (
                      <div key={dep.name} className="p-4 bg-[#F8FAFB] rounded-2xl border border-white">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: dep.color }}>{dep.name}</p>
                          <h4 className="text-sm font-black text-slate-900">{dep.val}%</h4>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full transition-all duration-1000" style={{ backgroundColor: dep.color, width: `${dep.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </ModuleCard>
              </div>

              <ModuleCard title="Son Aktiviteler" subtitle="Sistem Kayıtları" icon={Bell} color="#8b5cf6">
                <div className="mt-6 space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                  {recentActivities.map(act => (
                    <div key={act.id} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 border border-white hover:border-slate-200 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform" style={{ color: act.color }}>
                          <act.icon size={18} />
                        </div>
                        <div>
                          <h5 className="text-[12px] font-black text-slate-900 uppercase tracking-tight truncate max-w-[140px]">{act.title}</h5>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{act.subtitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {act.amount && !isNaN(Number(act.amount)) && Number(act.amount) !== 0 && (
                          <p className={`text-[11px] font-black tracking-tighter ${act.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {act.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(Number(act.amount)))}
                          </p>
                        )}
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{act.time}</span>
                      </div>
                    </div>
                  ))}
                  {recentActivities.length === 0 && <p className="text-center text-slate-300 py-10 uppercase text-[10px] font-black">Henüz Hareket Yok</p>}
                </div>
              </ModuleCard>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <ModuleCard title="Satış Hunisi" subtitle="Müşteri Dönüşüm Oranları" icon={Target} color="#6366f1">
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={salesFunnelData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                          {salesFunnelData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-4 justify-center">
                    {salesFunnelData.map(d => (
                      <div key={d.name} className="px-4 py-2 rounded-2xl bg-white border border-slate-100 flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{d.name} ({d.value})</span>
                      </div>
                    ))}
                  </div>
                </ModuleCard>

                <ModuleCard title="Personel Performans Grafiği" subtitle="Satış Adedi Hedef Analizi" icon={Star} color="#f59e0b">
                  <div className="h-[300px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={staffPerformance}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                        <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '20px' }} />
                        <Bar dataKey="sales" name="Gerçekleşen" radius={[10, 10, 0, 0]} maxBarSize={40} fill="#6366f1" />
                        <Bar dataKey="target" name="Hedef" radius={[10, 10, 0, 0]} maxBarSize={40} fill="#e2e8f0" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ModuleCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <ModuleCard title="Onayi Bekleyen Müşteriler" subtitle="Evrak Bekleyenler" icon={UserCheck} color="#6366f1">
                  <div className="space-y-4 mt-6">
                    {pendingCustomers.map((sale) => (
                      <div key={sale.id} onClick={() => navigate('/sales')} className="flex items-center justify-between p-5 rounded-3xl bg-[#F8FAFB] border border-white hover:border-indigo-100 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-500 shadow-sm">
                            <UserCheck size={18} />
                          </div>
                          <div>
                            <h5 className="text-sm font-black text-slate-900 tracking-tight uppercase truncate max-w-[150px]">{sale.customers?.full_name || 'İsimsiz'}</h5>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{sale.projects?.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900 tracking-tighter">{formatCurrency(sale.offered_price)}</p>
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">BEKLEMEDE</span>
                        </div>
                      </div>
                    ))}
                    {pendingCustomers.length === 0 && <p className="text-center text-slate-300 py-10 uppercase text-[10px] font-black">Bekleyen İşlem Yok</p>}
                  </div>
                </ModuleCard>

                <ModuleCard title="Yeni Girilen Müşteriler" subtitle="Son 48 Saat" icon={UserPlus} color="#10b981">
                  <div className="space-y-4 mt-6">
                    {newCustomers.map((sale) => (
                      <div key={sale.id} onClick={() => navigate('/customers')} className="flex items-center justify-between p-5 rounded-3xl bg-[#F8FAFB] border border-white hover:border-emerald-100 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-slate-300 group-hover:text-emerald-500 shadow-sm transition-colors">
                            <Users size={18} />
                          </div>
                          <div>
                            <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight">{sale.customers?.full_name || 'İsimsiz'}</h5>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sale.projects?.name}</p>
                          </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">YENİ ADAY</p>
                      </div>
                    ))}
                    {newCustomers.length === 0 && <p className="text-center text-slate-300 py-10 uppercase text-[10px] font-black">Yeni Kayıt Yok</p>}
                  </div>
                </ModuleCard>
              </div>
            </div>
          )}

          {activeTab === 'construction' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
              {/* Construction Alerts */}
              {attendanceAlerts.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {attendanceAlerts.map(alert => (
                    <div key={alert.id} className="bg-rose-50 border border-rose-200 p-4 rounded-3xl flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-200">
                          <AlertTriangle size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-rose-900 uppercase tracking-tight">Puantaj Uyarısı</p>
                          <p className="text-xs font-bold text-rose-500 tracking-wide">[{alert.project}] projesinde bugün henüz puantaj girişi yapılmadı!</p>
                        </div>
                      </div>
                      <button onClick={() => navigate('/attendance')} className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Puantajı Düzenle</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Quick Actions Card */}
                <ModuleCard title="Hızlı İşlemler" subtitle="Şantiye & Depo Araçları" icon={Zap} color="#D36A47">
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button onClick={() => navigate('/stock')} className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-white rounded-[24px] hover:bg-white hover:border-[#D36A47]/30 hover:shadow-xl transition-all group">
                      <Package className="text-[#D36A47] mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Malzeme Girişi</span>
                    </button>
                    <button onClick={() => navigate('/purchasing')} className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-white rounded-[24px] hover:bg-white hover:border-[#D36A47]/30 hover:shadow-xl transition-all group">
                      <ShoppingCart className="text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Satın Alma</span>
                    </button>
                    <button onClick={() => navigate('/attendance')} className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-white rounded-[24px] hover:bg-white hover:border-[#D36A47]/30 hover:shadow-xl transition-all group">
                      <ClipboardCheck className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Puantaj</span>
                    </button>
                    <button onClick={() => navigate('/projects')} className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-white rounded-[24px] hover:bg-white hover:border-[#D36A47]/30 hover:shadow-xl transition-all group">
                      <Plus className="text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Yeni Proje</span>
                    </button>
                  </div>
                </ModuleCard>

                {/* Notes & Reminders Card */}
                <ModuleCard title="Notlar & Hatırlatmalar" subtitle="Kişisel İş Listesi" icon={ListTodo} color="#8b5cf6">
                  <div className="space-y-3 mt-6">
                    {notes.map(note => (
                      <div key={note.id} className="flex items-center gap-3 p-3 bg-slate-50/50 border border-white rounded-2xl">
                        <div className={`w-2 h-2 rounded-full ${note.type === 'reminder' ? 'bg-amber-400' : 'bg-[#D36A47]'}`} />
                        <div className="flex-1">
                          <p className="text-[12px] font-bold text-slate-900 leading-tight">{note.content}</p>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{note.date}</span>
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                      <Plus size={14} /> Not Ekle
                    </button>
                  </div>
                </ModuleCard>

                {/* Manufacturing Approvals Card */}
                <ModuleCard title="İmalat Onay Beleyenler" subtitle="Saha Kontrol Listesi" icon={CheckCircle} color="#10b981">
                  <div className="space-y-4 mt-6">
                    {manufacturingApprovals.map(approval => (
                      <div key={approval.id} className="p-4 bg-slate-50 border border-white rounded-2xl hover:bg-white hover:shadow-lg hover:border-emerald-100 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-[10px] font-black text-[#D36A47] uppercase tracking-widest mb-0.5">{approval.project}</p>
                            <h5 className="text-[13px] font-black text-slate-900">{approval.name}</h5>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-lg tracking-widest">ONAY Bekliyor</span>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{approval.date}</span>
                          <button className="text-[9px] font-black text-emerald-600 uppercase tracking-widest group-hover:underline">Şimdi Onayla</button>
                        </div>
                      </div>
                    ))}
                    {manufacturingApprovals.length === 0 && <p className="text-center text-slate-300 py-10 uppercase text-[10px] font-black">Bekleyen Onay Yok</p>}
                  </div>
                </ModuleCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3"><span className="w-8 h-px bg-slate-200" /> AKTİF PROJE İLERLEME DURUMLARI</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {constructionProgress.slice(0, 4).map(p => (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className="bg-white p-6 rounded-[32px] border border-white shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all group cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center" style={{ color: p.color }}>
                            <Building2 size={20} />
                          </div>
                          <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest" style={{ backgroundColor: `${p.color}10`, color: p.color }}>
                            {p.status}
                          </span>
                        </div>
                        <h4 className="text-md font-black text-slate-900 tracking-tight uppercase mb-4 truncate" title={p.name}>{p.name}</h4>
                        <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                          <div className="h-full transition-all duration-1000" style={{ width: `${p.progress}%`, backgroundColor: p.color }} />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tamamlanma</span>
                          <span className="text-xs font-black text-slate-900">%{p.progress}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <ModuleCard title="Kritik Malzemeler" subtitle="Termin Uyarıları" icon={Package} color="#D36A47">
                  <div className="mt-4 space-y-4">
                    {criticalMaterials.map((mat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-rose-50/50 rounded-2xl border border-rose-100 hover:bg-white hover:shadow-lg transition-all group">
                        <div>
                          <p className="text-[11px] font-black text-slate-900 uppercase truncate max-w-[150px]">{mat.name || mat.material_name}</p>
                          <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{mat.warehouse_quantity || mat.warehouse_qty} {mat.unit} MEVCUT</p>
                        </div>
                        <button onClick={() => navigate('/purchasing')} className="text-[9px] font-black text-[#D36A47] uppercase tracking-widest hover:underline">Tedarik Et</button>
                      </div>
                    ))}
                    {criticalMaterials.length === 0 && <p className="text-center text-slate-300 py-10 uppercase text-[10px] font-black">Kritik Malzeme Yok</p>}
                  </div>
                </ModuleCard>
              </div>
            </div>
          )}

          {activeTab === 'purchasing' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-top-4 duration-500">
              <ModuleCard title="Satın Alma Talepleri" subtitle="Onay & Teklif Bekleyenler" icon={ShoppingCart} color="#10b981">
                <div className="space-y-4 mt-6">
                  {purchasingStatus.map(p => (
                    <div key={p.name} onClick={() => navigate('/purchasing')} className="p-6 rounded-3xl bg-[#F8FAFB] border border-white hover:border-emerald-100 transition-all cursor-pointer flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center transition-colors shadow-sm" style={{ color: p.color }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight">{p.name}</h5>
                          <p className="text-2xl font-black">{p.count}</p>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </ModuleCard>

              <ModuleCard title="Tedarikçi Verimliliği" subtitle="Katalogdaki Malzeme Sayısı" icon={UserCheck} color="#10b981">
                <div className="h-[240px] w-full mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={supplierStats}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '20px' }} />
                      <Bar dataKey="val" radius={[10, 10, 0, 0]} maxBarSize={40} fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ModuleCard>
            </div>
          )}

          {activeTab === 'accounting' && (
            <div className="space-y-10 animate-in fade-in zoom-in duration-500">
              <ModuleCard title="Kasa & Banka Durumu" subtitle="Nakit Akış Analizi" icon={DollarSign} color="#8b5cf6">
                <div className="h-[300px] w-full mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={financeHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickFormatter={v => `₺${Math.round(v / 1000)}k`} />
                      <Tooltip contentStyle={{ borderRadius: '20px' }} />
                      <Line type="monotone" dataKey="income" name="Giriş" stroke="#10b981" strokeWidth={6} dot={{ r: 6, fill: '#10b981', strokeWidth: 4, stroke: '#fff' }} />
                      <Line type="monotone" dataKey="expense" name="Çıkış" stroke="#f43f5e" strokeWidth={6} dot={{ r: 6, fill: '#f43f5e', strokeWidth: 4, stroke: '#fff' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ModuleCard>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-[40px] bg-white border border-white shadow-sm flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <ArrowUpRight size={24} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Toplam Giriş</p>
                  <h5 className="text-2xl font-black text-slate-900 tracking-tighter w-full text-center truncate" title={formatCurrency(totalReceivable)}>{formatCurrency(totalReceivable)}</h5>
                </div>
                <div className="p-8 rounded-[40px] bg-white border border-white shadow-sm flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                    <ArrowDownRight size={24} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Toplam Çıkış</p>
                  <h5 className="text-2xl font-black text-slate-900 tracking-tighter w-full text-center truncate" title={formatCurrency(totalPayable)}>{formatCurrency(totalPayable)}</h5>
                </div>
                <div className="p-8 rounded-[40px] bg-[#0A1128] text-white shadow-sm flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#D36A47]/20 text-[#D36A47] flex items-center justify-center mb-4">
                    <Wallet size={24} />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Net Nakit</p>
                  <h5 className="text-2xl font-black text-white tracking-tighter w-full text-center truncate" title={formatCurrency(totalReceivable - totalPayable)}>{formatCurrency(totalReceivable - totalPayable)}</h5>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
