import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { X, FileSpreadsheet, Download, Upload, Check, AlertCircle, RefreshCw } from 'lucide-react';

const ExcelProjectModal = ({ isOpen, onClose, onImport }) => {
    const [previewData, setPreviewData] = useState([]);
    const [fileName, setFileName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        setIsProcessing(true);
        setError(null);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    setError('Yüklediğiniz Excel dosyası boş görünüyor.');
                    setIsProcessing(false);
                    return;
                }

                setPreviewData(data);
                setIsProcessing(false);
            } catch (err) {
                console.error(err);
                setError('Excel dosyası okunurken bir hata oluştu. Lütfen formatı kontrol edin.');
                setIsProcessing(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const downloadTemplate = () => {
        const template = [
            {
                'Proje Adı': 'Örnek Proje 1',
                'Adres': 'İstanbul, Türkiye',
                'Durum': 'Devam Ediyor',
                'Açıklama': 'Proje detayları buraya gelecek',
                'Başlangıç Tarihi': '2024-03-01',
                'Bitiş Tarihi': '2025-03-01'
            }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'Mpando_Proje_Sablonu.xlsx');
    };

    const handleConfirmImport = () => {
        // Map the Excel columns to our project schema
        const mappedData = previewData.map(item => ({
            name: item['Proje Adı'] || item['Name'] || item['Project Name'] || '',
            address: item['Adres'] || item['Address'] || '',
            status: mapStatus(item['Durum'] || item['Status'] || 'PLANNING'),
            description: item['Açıklama'] || item['Description'] || '',
            start_date: item['Başlangıç Tarihi'] || item['Start Date'] || null,
            end_date: item['Bitiş Tarihi'] || item['End Date'] || null
        })).filter(p => p.name !== '');

        onImport(mappedData);
        onClose();
    };

    const mapStatus = (statusStr) => {
        const s = String(statusStr).toUpperCase();
        if (s.includes('DEVAM') || s.includes('IN_PROGRESS')) return 'IN_PROGRESS';
        if (s.includes('TAMAM') || s.includes('COMPLETED')) return 'COMPLETED';
        if (s.includes('PLAN') || s.includes('PLANNING')) return 'PLANNING';
        if (s.includes('GECİK') || s.includes('DELAYED')) return 'DELAYED';
        if (s.includes('BİTİYOR') || s.includes('FINISHING')) return 'FINISHING';
        return 'PLANNING';
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.3)] w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20 flex flex-col">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shadow-sm">
                            <FileSpreadsheet size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Excel ile Proje Aktar</h2>
                            <p className="text-sm text-slate-500 font-medium">Toplu proje girişi için Excel dosyanızı yükleyin.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8">
                    {!fileName ? (
                        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50/30 hover:bg-slate-50 transition-colors group cursor-pointer relative">
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                <Upload size={32} className="text-[#0A1128]" />
                            </div>
                            <p className="text-base font-bold text-slate-700">Excel Dosyasını Sürükleyin veya Seçin</p>
                            <p className="text-sm text-slate-400 mt-1">Sadece .xlsx ve .xls formatları desteklenir.</p>
                            <button
                                onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}
                                className="mt-8 flex items-center gap-2 text-xs font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all z-10"
                            >
                                <Download size={14} /> ÖRNEK ŞABLON İNDİR
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* File Info */}
                            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm">
                                        <FileSpreadsheet size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-emerald-700">{fileName}</p>
                                        <p className="text-[10px] text-emerald-600/70 uppercase font-bold tracking-widest">{previewData.length} Satır Bulundu</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setFileName(''); setPreviewData([]); }}
                                    className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-slate-600 bg-white px-3 py-2 rounded-lg transition-all"
                                >
                                    <RefreshCw size={12} /> DOSYAYI DEĞİŞTİR
                                </button>
                            </div>

                            {error && (
                                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-start gap-3">
                                    <AlertCircle size={20} className="mt-0.5" />
                                    <p className="text-sm font-semibold">{error}</p>
                                </div>
                            )}

                            {/* Preview Table */}
                            {!error && previewData.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Veri Önizleme</p>
                                    <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-100">
                                                        {Object.keys(previewData[0]).map(key => (
                                                            <th key={key} className="px-4 py-3 font-black text-slate-500 uppercase tracking-tight">{key}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {previewData.slice(0, 5).map((row, i) => (
                                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                            {Object.values(row).map((val, j) => (
                                                                <td key={j} className="px-4 py-3 text-slate-600 font-medium">{val}</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {previewData.length > 5 && (
                                            <div className="p-3 bg-slate-50/50 text-center border-t border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">... ve {previewData.length - 5} satır daha</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-[32px]">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-black text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-widest"
                    >
                        İPTAL
                    </button>
                    <button
                        disabled={!previewData.length || isProcessing || error}
                        onClick={handleConfirmImport}
                        className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-black transition-all shadow-xl ${!previewData.length || isProcessing || error
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                    >
                        {isProcessing ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
                        AKTARIMI BAŞLAT
                    </button>
                </div>
            </div>
        </div >
    );
};

export default ExcelProjectModal;
