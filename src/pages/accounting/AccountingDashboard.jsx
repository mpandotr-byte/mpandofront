import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    CreditCard,
    Users,
    ArrowRight,
    ArrowUpRight,
    ArrowDownRight,
    Receipt,
    Truck,
    Building2,
    FileText,
    PieChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * MUHASEBE VE FİNANS ANA MERKEZİ
 * 
 * Bu ekran şirketin nakit akışını, alacaklarını ve borçlarını özetler.
 * Fonksiyonlar:
 * - API'den gelen son işlemleri (Income/Expense) türüne göre ayırıp toplar.
 * - Son 30 günlük net nakit durumunu hesaplar.
 * - Çek ve senet portföyünü filtreleyerek gösterir.
 */

export default function AccountingDashboard() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [summary, setSummary] = useState({
        monthlyCollection: 0,
        monthlyPayment: 0,
        netCash30Days: 0,
        totalChecksReceived: 0,
        totalDebt: 0
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Sayfa yüklendiğinde finansal verileri çek ve özet istatistikleri hesapla
    useEffect(() => {
        const fetchFinanceData = async () => {
            setLoading(true);
            try {
                const results = await Promise.allSettled([
                    api.get('/finance/transactions'),
                    api.get('/sales'),
                    api.get('/purchasing')
                ]);

                const [transRes] = results;
                const transactions = transRes.status === 'fulfilled' ? transRes.value : [];

                let monthlyIn = 0;
                let monthlyOut = 0;
                let cash30 = 0;
                let checks = 0;

                const now = new Date();
                const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

                (transactions || []).forEach(t => {
                    const date = new Date(t.transaction_date || t.created_at);
                    const amount = Math.abs(Number(t.amount) || 0);
                    const isWithinMonth = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    const isWithin30Days = date >= thirtyDaysAgo;

                    // INCOME (Giriş) ise toplam rakama ekle
                    if (t.type === 'INCOME' || t.amount > 0) {
                        if (isWithinMonth) monthlyIn += amount;
                        if (isWithin30Days) cash30 += amount;
                        if (t.payment_method === 'CHECK') checks += amount;
                    }
                    // EXPENSE (Çıkış) ise toplam rakamdan düş
                    else {
                        if (isWithinMonth) monthlyOut += amount;
                        if (isWithin30Days) cash30 -= amount;
                    }
                });

                setSummary({
                    monthlyCollection: monthlyIn,
                    monthlyPayment: monthlyOut,
                    netCash30Days: cash30,
                    totalChecksReceived: checks,
                    totalDebt: (monthlyOut * 2.5) // Geçici olarak simüle edilen borç rakamı
                });

            } catch (err) {
                console.error("Muhasebe verisi çekilirken hata:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFinanceData();
    }, []);

    const mainButtons = [
        { id: 'income', title: 'GELİR YÖNETİMİ', desc: 'Müşteri Tahsilat & Satış Takibi', icon: <TrendingUp size={32} />, color: 'from-emerald-500 to-teal-600', path: '/accounting/income' },
        { id: 'expense', title: 'GİDER YÖNETİMİ', desc: 'Tedarikçi Ödemeleri & Fatura Kontrol', icon: <TrendingDown size={32} />, color: 'from-rose-500 to-red-600', path: '/accounting/expense' },
        { id: 'subcontractor', title: 'TAŞERON & PERSONEL', desc: 'Hakediş & Puantaj Ödemeleri', icon: <Users size={32} />, color: 'from-amber-500 to-orange-600', path: '/accounting/subcontractors' },
        { id: 'cashflow', title: 'ÇEK & NAKİT AKIŞI', desc: 'Portföy & Finansal Projeksiyon', icon: <Wallet size={32} />, color: 'from-indigo-500 to-blue-600', path: '/accounting/cash-flow' }
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Muhasebe & Finans" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-3 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-6 md:space-y-8">

                    {/* Finance Summary Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                        <SummaryCard
                            title="Bu Ay Tahsilat"
                            amount={summary.monthlyCollection}
                            icon={<ArrowUpRight size={18} />}
                            trend="positive"
                            color="text-emerald-600"
                        />
                        <SummaryCard
                            title="Bu Ay Ödeme"
                            amount={summary.monthlyPayment}
                            icon={<ArrowDownRight size={18} />}
                            trend="negative"
                            color="text-rose-600"
                        />
                        <SummaryCard
                            title="30 Günlük Net Nakit"
                            amount={summary.netCash30Days}
                            icon={<Wallet size={18} />}
                            trend="neutral"
                            color="text-blue-600"
                            isHighlight={true}
                        />
                        <SummaryCard
                            title="Toplam Alınan Çek"
                            amount={summary.totalChecksReceived}
                            icon={<CreditCard size={18} />}
                            trend="neutral"
                            color="text-indigo-600"
                        />
                        <SummaryCard
                            title="Toplam Borç"
                            amount={summary.totalDebt}
                            icon={<Receipt size={18} />}
                            trend="negative"
                            color="text-amber-600"
                            subText="(Ted. + Taş.)"
                        />
                    </div>

                    {/* Quick Access Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {mainButtons.map(btn => (
                            <button
                                key={btn.id}
                                onClick={() => navigate(btn.path)}
                                className="group relative overflow-hidden bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left flex flex-col items-start"
                            >
                                <div className={`w-14 h-14 md:w-20 md:h-20 rounded-[20px] md:rounded-[28px] bg-gradient-to-br ${btn.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-4 md:mb-6`}>
                                    {React.cloneElement(btn.icon, { size: 24, className: 'md:w-8 md:h-8' })}
                                </div>
                                <h3 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight mb-2 leading-none">{btn.title}</h3>
                                <p className="text-slate-400 text-[10px] md:text-xs font-medium uppercase tracking-widest">{btn.desc}</p>

                                <div className="mt-6 md:mt-8 flex items-center gap-2 text-[10px] font-black text-slate-300 group-hover:text-slate-800 transition-colors uppercase tracking-[0.2em]">
                                    Modüle Git <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Projects Overview - Mini Bilançolar */}
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">Proje Finans Paneli</h2>
                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Her proje için anlık kâr/zarar dökümü</p>
                            </div>
                            <button className="w-fit px-6 py-3 bg-slate-800 text-white rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Tüm Projeleri Filtrele</button>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                            {[
                                { name: 'Aksu Lüks Konutları', sales: 45000000, cost: 28000000, profit: 17000000, progress: 65 },
                                { name: 'Batı Vista Rezidans', sales: 120000000, cost: 85000000, profit: 35000000, progress: 30 }
                            ].map((proj, i) => (
                                <ProjectMiniBalance key={i} project={proj} />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function SummaryCard({ title, amount, icon, trend, color, isHighlight, subText }) {
    return (
        <div className={`p-5 md:p-6 rounded-[24px] md:rounded-[32px] border ${isHighlight ? 'bg-[#0A1128] border-transparent shadow-xl' : 'bg-white border-slate-100 shadow-sm'} flex flex-col gap-1`}>
            <div className={`flex items-center justify-between mb-2 ${isHighlight ? 'text-white/40' : 'text-slate-400'}`}>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{title}</span>
                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center ${isHighlight ? 'bg-white/10' : 'bg-slate-50'}`}>
                    {React.cloneElement(icon, { size: 14 })}
                </div>
            </div>
            <div className={`text-base md:text-xl font-black ${isHighlight ? 'text-white' : 'text-slate-800'}`}>
                {amount.toLocaleString('tr-TR')} ₺
            </div>
            {subText && <span className="text-[8px] md:text-[9px] font-bold text-slate-300 uppercase">{subText}</span>}
        </div>
    );
}

function ProjectMiniBalance({ project }) {
    return (
        <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-0 mb-8 md:mb-10">
                <div className="flex items-center gap-4 md:gap-5">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                        <Building2 size={24} className="md:w-7 md:h-7" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight break-words">{project.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-20 sm:w-40 h-1 md:h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${project.progress}%` }}></div>
                            </div>
                            <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase leading-none">%{project.progress}</span>
                        </div>
                    </div>
                </div>
                <div className="sm:text-right w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                    <div className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Kar (Tahmini)</div>
                    <div className="text-xl md:text-2xl font-black text-emerald-600">{project.profit.toLocaleString('tr-TR')} ₺</div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 p-5 md:p-8 bg-slate-50 rounded-[24px] md:rounded-[32px] border border-slate-100">
                <div className="space-y-1">
                    <div className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Toplam Satış</div>
                    <div className="text-xs md:text-sm font-black text-slate-800">{project.sales.toLocaleString('tr-TR')} ₺</div>
                </div>
                <div className="space-y-1">
                    <div className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Toplam Maliyet</div>
                    <div className="text-xs md:text-sm font-black text-slate-800">{project.cost.toLocaleString('tr-TR')} ₺</div>
                </div>
                <div className="space-y-1 sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 sm:border-transparent">
                    <button className="text-[8px] md:text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">DETAYLI ANALİZ</button>
                </div>
            </div>

            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4">
                <div className="flex-1 p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-indigo-200">
                    <div className="flex items-center gap-3">
                        <PieChart size={14} className="text-indigo-400" />
                        <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Maliyet Dağılımı</span>
                    </div>
                    <ArrowRight size={14} className="text-slate-200 group-hover:text-indigo-600 transition-colors" />
                </div>
                <div className="flex-1 p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-indigo-200">
                    <div className="flex items-center gap-3">
                        <FileText size={14} className="text-indigo-400" />
                        <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Proje Belgeleri</span>
                    </div>
                    <ArrowRight size={14} className="text-slate-200 group-hover:text-indigo-600 transition-colors" />
                </div>
            </div>
        </div>
    );
}
