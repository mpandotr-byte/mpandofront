import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import {
    Users,
    Hammer,
    CreditCard,
    CheckCircle2,
    Plus,
    Search,
    FileText,
    ArrowRight,
    MapPin,
    Calendar,
    Receipt,
    Activity,
    Upload,
    MoreHorizontal
} from 'lucide-react';

export default function SubcontractorPersonnel() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [view, setView] = useState('subcontractors'); // subcontractors, personnel
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [activeTab, setActiveTab] = useState('progress'); // progress (hakediş), payments, personnel_list

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Taşeron & Personel Maliyet Yönetimi" toggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-8">

                    {/* View Switcher & Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-stretch gap-6">
                        <div className="bg-white p-1.5 rounded-[28px] border border-slate-100 shadow-sm flex grow max-w-sm">
                            <button
                                onClick={() => { setView('subcontractors'); setSelectedEntity(null); }}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${view === 'subcontractors' ? 'bg-amber-500 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Users size={18} /> TAŞERONLAR
                            </button>
                            <button
                                onClick={() => { setView('personnel'); setSelectedEntity(null); }}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${view === 'personnel' ? 'bg-amber-500 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Hammer size={18} /> PERSONEL
                            </button>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-10 py-5 bg-[#0A1128] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">
                                {view === 'subcontractors' ? 'HAKEDİŞ ONAYI VER' : 'MAAŞLARI HESAPLA'}
                            </button>
                        </div>
                    </div>

                    {/* Entities Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {view === 'subcontractors' ? (
                            [
                                { id: 1, name: 'Aras Betonarme Ltd.', tasks: 'Kalıp, Demir, Beton', totalProgress: 12500000, paid: 8400000, balance: 4100000 },
                                { id: 2, name: 'Sancak Tesisat', tasks: 'Elektrik, Mekanik', totalProgress: 4200000, paid: 2100000, balance: 2100000 }
                            ].map(sub => (
                                <EntityCard key={sub.id} entity={sub} type="sub" onClick={() => setSelectedEntity(sub)} isSelected={selectedEntity?.id === sub.id} />
                            ))
                        ) : (
                            [
                                { id: 1, name: 'Mehmet Ali Bir', task: 'Kalıp Ustası', site: 'Aksu Projesi', dailyWage: 1200, balance: 4500 },
                                { id: 2, name: 'Caner Aksu', task: 'Sıva Ekipbaşı', site: 'Batı Vista', dailyWage: 1500, balance: 12000 }
                            ].map(pers => (
                                <EntityCard key={pers.id} entity={pers} type="pers" onClick={() => setSelectedEntity(pers)} isSelected={selectedEntity?.id === pers.id} />
                            ))
                        )}
                    </div>

                    {/* Detail Console */}
                    {selectedEntity && (
                        <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden animate-scale-in">
                            <div className="bg-amber-500 p-10 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 rounded-[28px] bg-white/10 flex items-center justify-center backdrop-blur-md">
                                        {view === 'subcontractors' ? <Users size={40} /> : <Hammer size={40} />}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black uppercase tracking-tight">{selectedEntity.name}</h2>
                                        <p className="text-white/40 text-[11px] font-black uppercase tracking-widest mt-1">
                                            {view === 'subcontractors' ? `İş Kalemi: ${selectedEntity.tasks}` : `Görev: ${selectedEntity.task} | Şantiye: ${selectedEntity.site}`}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedEntity(null)} className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">PANELİ KAPAT</button>
                            </div>

                            {/* Details Tabs */}
                            <div className="flex bg-slate-50 p-2 border-b border-slate-200">
                                <button onClick={() => setActiveTab('progress')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'progress' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <FileText size={18} /> {view === 'subcontractors' ? 'Hakediş Raporları' : 'Hesap Özeti'}
                                </button>
                                {view === 'subcontractors' && (
                                    <button onClick={() => setActiveTab('personnel_list')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'personnel_list' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                        <Users size={18} /> Bağlı Personel
                                    </button>
                                )}
                                <button onClick={() => setActiveTab('payments')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'payments' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <CreditCard size={18} /> Ödeme Kayıtları
                                </button>
                            </div>

                            <div className="p-10">
                                {activeTab === 'progress' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-8">
                                            <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">{view === 'subcontractors' ? 'Tasdikli Metraj ve Hakediş' : 'Maaş ve Puantaj Detayı'}</h4>
                                            <button className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-4 py-2 rounded-xl">
                                                {view === 'subcontractors' ? '+ HAKEDİŞ OLUŞTUR' : 'EK ÖDEME EKLE'}
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {[1, 2].map(i => (
                                                <div key={i} className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] flex flex-col md:flex-row justify-between items-center gap-6">
                                                    <div className="flex items-center gap-10">
                                                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400"><FileText size={24} /></div>
                                                        <div>
                                                            <div className="text-sm font-black text-slate-800 uppercase tracking-tight">Hakediş #{i + 1} - Aksu Projesi</div>
                                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">20 Şub - 05 Mart Aralığı</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-12">
                                                        <div className="text-right">
                                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mühendis Onayı</div>
                                                            <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase">
                                                                <CheckCircle2 size={12} /> ONAYLANDI
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Hakediş Tutarı</div>
                                                            <div className="text-lg font-black text-slate-800">1.450.000 ₺</div>
                                                        </div>
                                                        <button className="p-4 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-amber-500 transition-all shadow-sm">
                                                            <ArrowRight size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'payments' && (
                                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-[40px]">
                                        <div className="w-20 h-20 rounded-[32px] bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                                            <CreditCard size={40} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Ödeme Geçmişi</h3>
                                        <p className="max-w-md text-slate-400 text-sm font-medium mt-4 leading-relaxed text-center italic">
                                            Bu taraf için banka transferi veya çek ile yapılan tüm ödeme dökümüne buradan ulaşabilirsiniz.
                                        </p>
                                    </div>
                                )}

                                {activeTab === 'personnel_list' && (
                                    <div className="bg-slate-50 rounded-[40px] p-10 border border-slate-100">
                                        <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Bu Taşerona Bağlı Ekipler</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 font-bold text-xs">P{i}</div>
                                                    <div>
                                                        <div className="text-[12px] font-black text-slate-700 uppercase">Ekip Üyesi {i}</div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase">Giriş: 15.01.2026</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function EntityCard({ entity, type, onClick, isSelected }) {
    return (
        <div
            onClick={onClick}
            className={`p-8 bg-white rounded-[40px] border shadow-sm transition-all cursor-pointer hover:shadow-2xl ${isSelected ? 'border-amber-500 ring-4 ring-amber-50' : 'border-slate-100 hover:border-slate-200'}`}
        >
            <div className="flex items-start justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isSelected ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                    {type === 'sub' ? <Users size={28} /> : <Hammer size={28} />}
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kalan Borç</div>
                    <div className="text-xl font-black text-rose-500">{entity.balance.toLocaleString('tr-TR')} ₺</div>
                </div>
            </div>

            <h3 className="text-[15px] font-black text-slate-800 uppercase tracking-tight leading-none mb-2">{entity.name}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{type === 'sub' ? entity.tasks : entity.task}</p>

            {type === 'sub' && (
                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                    <div>
                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 text-left">Hakediş</div>
                        <div className="text-xs font-black text-slate-700">{entity.totalProgress.toLocaleString('tr-TR')} ₺</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Ödenen</div>
                        <div className="text-xs font-black text-slate-700">{entity.paid.toLocaleString('tr-TR')} ₺</div>
                    </div>
                </div>
            )}

            {type === 'pers' && (
                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                    <div>
                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 text-left">Günlük Ücret</div>
                        <div className="text-xs font-black text-slate-700">{entity.dailyWage.toLocaleString('tr-TR')} ₺</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg">{entity.site}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
