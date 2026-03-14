import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
    ArrowUpRight, ArrowDownRight, Wallet, CreditCard, Receipt,
    Building2, FileText, ArrowRight, RefreshCw, Repeat, BadgeCheck,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FinanceAdvanced() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [summary, setSummary] = useState(null);
    const [paymentPlans, setPaymentPlans] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [balanceSheet, setBalanceSheet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBarterModalOpen, setIsBarterModalOpen] = useState(false);
    const [isChequeModalOpen, setIsChequeModalOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const results = await Promise.allSettled([
                    api.get('/finance/summary'),
                    api.get('/finance/payment-plans'),
                    api.get('/projects')
                ]);
                if (results[0].status === 'fulfilled') setSummary(results[0].value);
                if (results[1].status === 'fulfilled') setPaymentPlans(Array.isArray(results[1].value) ? results[1].value : []);
                if (results[2].status === 'fulfilled') {
                    const projs = Array.isArray(results[2].value) ? results[2].value : [];
                    setProjects(projs);
                    if (projs.length > 0) setSelectedProject(projs[0]);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        if (!selectedProject) return;
        const fetchBalance = async () => {
            try {
                const data = await api.get(`/finance/projects/${selectedProject.id}/balance-sheet`);
                setBalanceSheet(data);
            } catch (err) { console.error(err); setBalanceSheet(null); }
        };
        fetchBalance();
    }, [selectedProject]);

    const handleBarter = async (formData) => {
        try {
            await api.post('/finance/barters', formData);
            setIsBarterModalOpen(false);
        } catch (err) { console.error(err); }
    };

    const handleEndorseCheque = async (formData) => {
        try {
            await api.post('/finance/cheques/endorse', formData);
            setIsChequeModalOpen(false);
        } catch (err) { console.error(err); }
    };

    const fmt = (n) => (Number(n) || 0).toLocaleString('tr-TR');

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Ileri Finans" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">
                    {/* Back button */}
                    <button onClick={() => navigate('/accounting')} className="flex items-center gap-2 text-slate-400 hover:text-[#0A1128] text-[10px] font-black uppercase tracking-widest group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Muhasebe Paneline Don
                    </button>

                    {/* Summary Cards */}
                    {summary && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aylik Tahsilat</span>
                                <div className="text-xl font-black text-emerald-600 mt-2">{fmt(summary.monthly_collection || summary.monthlyCollection)} TL</div>
                            </div>
                            <div className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aylik Odeme</span>
                                <div className="text-xl font-black text-red-600 mt-2">{fmt(summary.monthly_payment || summary.monthlyPayment)} TL</div>
                            </div>
                            <div className="p-6 rounded-[32px] bg-[#0A1128] border border-transparent shadow-xl">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Net Nakit</span>
                                <div className="text-xl font-black text-white mt-2">{fmt(summary.net_cash_flow || summary.netCash)} TL</div>
                            </div>
                            <div className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alinan Cekler</span>
                                <div className="text-xl font-black text-orange-600 mt-2">{fmt(summary.received_cheques || summary.totalChecks)} TL</div>
                            </div>
                            <div className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toplam Borc</span>
                                <div className="text-xl font-black text-orange-600 mt-2">{fmt(summary.total_debt || summary.totalDebt)} TL</div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <button onClick={() => setIsBarterModalOpen(true)} className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all text-left">
                            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-6"><Repeat size={28} /></div>
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">Takas (Barter)</h3>
                            <p className="text-slate-400 text-xs font-medium">Gayrimenkul takas islemleri kaydin</p>
                        </button>
                        <button onClick={() => setIsChequeModalOpen(true)} className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all text-left">
                            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-orange-500 to-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-6"><CreditCard size={28} /></div>
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">Cek Ciro</h3>
                            <p className="text-slate-400 text-xs font-medium">Cek cirola tedarikci ve taserona</p>
                        </button>
                        <button onClick={() => navigate('/accounting/cash-flow')} className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all text-left">
                            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-6"><Wallet size={28} /></div>
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">Nakit Akis Merkezi</h3>
                            <p className="text-slate-400 text-xs font-medium">Detayli cek ve nakit akis analizi</p>
                        </button>
                    </div>

                    {/* Project Balance Sheet */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Proje Bilancosu</h2>
                        <div className="flex flex-wrap gap-3 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                            {projects.map(p => (
                                <button key={p.id} onClick={() => setSelectedProject(p)}
                                    className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${selectedProject?.id === p.id ? 'bg-[#0A1128] text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                                    {p.name || p.project_name}
                                </button>
                            ))}
                        </div>
                        {balanceSheet && (
                            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                                    <div><div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Toplam Satis</div><div className="text-lg font-black text-slate-800 mt-1">{fmt(balanceSheet.total_sales)} TL</div></div>
                                    <div><div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Toplam Maliyet</div><div className="text-lg font-black text-slate-800 mt-1">{fmt(balanceSheet.total_cost)} TL</div></div>
                                    <div><div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Kar</div><div className="text-lg font-black text-emerald-600 mt-1">{fmt(balanceSheet.net_profit)} TL</div></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Plans */}
                    {paymentPlans.length > 0 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Odeme Planlari</h2>
                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead><tr className="border-b border-slate-100">
                                            <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest p-6">Musteri</th>
                                            <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest p-6">Tutar</th>
                                            <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest p-6">Vade</th>
                                            <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest p-6">Durum</th>
                                        </tr></thead>
                                        <tbody>
                                            {paymentPlans.slice(0, 10).map((pp, i) => (
                                                <tr key={pp.id || i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                    <td className="p-6 text-sm font-bold text-slate-800">{pp.company_name || pp.customer_name || '-'}</td>
                                                    <td className="p-6 text-sm font-bold text-slate-800">{fmt(pp.amount)} TL</td>
                                                    <td className="p-6 text-sm text-slate-600">{pp.due_date ? new Date(pp.due_date).toLocaleDateString('tr-TR') : '-'}</td>
                                                    <td className="p-6"><span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${pp.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{pp.status || 'PENDING'}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Barter Modal */}
                    {isBarterModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                            <div className="bg-white rounded-[40px] w-full max-w-lg p-8 shadow-2xl space-y-6">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Takas (Barter) Kaydi</h3>
                                <form onSubmit={(e) => { e.preventDefault(); handleBarter(Object.fromEntries(new FormData(e.target).entries())); }} className="space-y-4">
                                    <input name="description" placeholder="Aciklama" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                    <input name="amount" type="number" placeholder="Tutar (TL)" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                    <input name="counterparty" placeholder="Karsi Taraf" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                    <textarea name="notes" placeholder="Notlar" rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none resize-none" />
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => setIsBarterModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold">Iptal</button>
                                        <button type="submit" className="flex-1 py-3 bg-[#0A1128] text-white rounded-2xl text-sm font-bold">Kaydet</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Cheque Endorse Modal */}
                    {isChequeModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                            <div className="bg-white rounded-[40px] w-full max-w-lg p-8 shadow-2xl space-y-6">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Cek Ciro Et</h3>
                                <form onSubmit={(e) => { e.preventDefault(); handleEndorseCheque(Object.fromEntries(new FormData(e.target).entries())); }} className="space-y-4">
                                    <input name="cheque_id" placeholder="Cek ID" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                    <input name="endorsed_to" placeholder="Ciro Edilecek Firma" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none" />
                                    <textarea name="notes" placeholder="Notlar" rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none resize-none" />
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => setIsChequeModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold">Iptal</button>
                                        <button type="submit" className="flex-1 py-3 bg-[#0A1128] text-white rounded-2xl text-sm font-bold">Ciro Et</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
