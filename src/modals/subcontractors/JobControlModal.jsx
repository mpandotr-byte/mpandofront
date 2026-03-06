import React, { useState } from 'react';
import {
    X,
    CheckCircle2,
    Camera,
    FileText,
    AlertTriangle,
    Image as ImageIcon,
    ChevronRight,
    Info,
    Plus
} from 'lucide-react';

const JobControlModal = ({
    isOpen,
    onClose,
    onApprove,
    job
}) => {
    const [notes, setNotes] = useState('');
    const [photos, setPhotos] = useState([]);

    if (!isOpen || !job) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-emerald-600 text-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">İş Kontrol ve Onay</h2>
                        <p className="text-xs font-bold text-white/70 mt-1 uppercase tracking-widest leading-none">Mühendis Saha Denetimi</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">

                    {/* Job Summary Card */}
                    <div className="bg-slate-50 border border-slate-200/50 rounded-[28px] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kontrol Edilen İş</span>
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-500 uppercase">ID: #{job.id}</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">{job.type}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 mb-4">{job.location}</p>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/60">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hesaplanan Miktar</p>
                                <p className="text-sm font-black text-slate-800">{job.quantity}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Toplam Bedel</p>
                                <p className="text-sm font-black text-emerald-600 font-mono">{job.totalPrice}</p>
                            </div>
                        </div>
                    </div>

                    {/* Photo Upload Section */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                            <Camera size={14} className="text-[#D36A47]" /> Saha Fotoğrafları (Opsiyonel)
                        </h3>

                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2].map(i => (
                                <div key={i} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer group">
                                    <Plus size={24} className="group-hover:scale-110 transition-transform" />
                                </div>
                            ))}
                            <div className="aspect-square bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300 gap-1 opacity-50">
                                <ImageIcon size={20} />
                                <span className="text-[8px] font-black uppercase">FOTO EKLE</span>
                            </div>
                        </div>
                    </div>

                    {/* Control Notes */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <FileText size={14} className="text-[#D36A47]" /> Denetim Notları
                            </h3>
                            <span className="text-[9px] font-bold text-slate-300 italic">Maks. 500 karakter</span>
                        </div>
                        <textarea
                            rows="4"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-700 resize-none outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                            placeholder="İşin kalitesi, eksikler veya saha durumu hakkında not giriniz..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 text-blue-700">
                        <Info size={20} className="flex-shrink-0" />
                        <p className="text-[10px] font-bold">Bu onay ile iş 'TAMAMLANDI' statüsüne geçecek ve taşeron hakedişine dahil edilecektir.</p>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-100 bg-white flex items-center justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={() => onApprove({ notes })}
                        className="flex items-center gap-3 px-10 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <CheckCircle2 size={18} />
                        İŞİ TAMAMLA VE ONAYLA
                    </button>
                </div>

            </div>
        </div>
    );
};

export default JobControlModal;
