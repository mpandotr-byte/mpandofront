import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { X, FileSpreadsheet, Download, Upload, Check, AlertCircle, RefreshCw, Building2, Layers, DoorOpen } from 'lucide-react';
import { api } from '../../api/client';

const ExcelProjectModal = ({ isOpen, onClose, onImport }) => {
    const [previewData, setPreviewData] = useState([]);
    const [fileName, setFileName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [importResult, setImportResult] = useState(null);
    const [importMode, setImportMode] = useState('full'); // 'simple' | 'full'

    if (!isOpen) return null;

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        setIsProcessing(true);
        setError(null);
        setImportResult(null);

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

                // Auto-detect mode based on columns
                const cols = Object.keys(data[0]);
                const hasBlockCol = cols.some(c => c.match(/blok|block/i));
                if (hasBlockCol) {
                    setImportMode('full');
                } else {
                    setImportMode('simple');
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

    const downloadSimpleTemplate = () => {
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

    const downloadFullTemplate = () => {
        const template = [
            { 'Proje Adı': 'Gül Park Konutları', 'Adres': 'Başakşehir, İstanbul', 'Durum': 'Devam Ediyor', 'Blok': 'A Blok', 'Kat Sayısı': 10, 'Kat No': 1, 'Daire No': 'A-101', 'Daire Tipi': '2+1', 'Cephe': 'Güney', 'Yapı Tipi': 'Konut' },
            { 'Proje Adı': 'Gül Park Konutları', 'Adres': 'Başakşehir, İstanbul', 'Durum': 'Devam Ediyor', 'Blok': 'A Blok', 'Kat Sayısı': 10, 'Kat No': 1, 'Daire No': 'A-102', 'Daire Tipi': '3+1', 'Cephe': 'Kuzey', 'Yapı Tipi': 'Konut' },
            { 'Proje Adı': 'Gül Park Konutları', 'Adres': 'Başakşehir, İstanbul', 'Durum': 'Devam Ediyor', 'Blok': 'A Blok', 'Kat Sayısı': 10, 'Kat No': 2, 'Daire No': 'A-201', 'Daire Tipi': '2+1', 'Cephe': 'Güney', 'Yapı Tipi': 'Konut' },
            { 'Proje Adı': 'Gül Park Konutları', 'Adres': 'Başakşehir, İstanbul', 'Durum': 'Devam Ediyor', 'Blok': 'B Blok', 'Kat Sayısı': 8, 'Kat No': 1, 'Daire No': 'B-101', 'Daire Tipi': '1+1', 'Cephe': 'Doğu', 'Yapı Tipi': 'Dükkan' },
            { 'Proje Adı': 'Yıldız Rezidans', 'Adres': 'Ataşehir, İstanbul', 'Durum': 'Planlanıyor', 'Blok': 'Tek Blok', 'Kat Sayısı': 15, 'Kat No': 1, 'Daire No': '101', 'Daire Tipi': '3+1', 'Cephe': 'Batı', 'Yapı Tipi': 'Konut' },
        ];
        const ws = XLSX.utils.json_to_sheet(template);

        // Sütun genişliklerini ayarla
        ws['!cols'] = [
            { wch: 22 }, { wch: 22 }, { wch: 14 }, { wch: 12 },
            { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 10 },
            { wch: 10 }, { wch: 10 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Projeler');
        XLSX.writeFile(wb, 'Mpando_Toplu_Proje_Sablonu.xlsx');
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

    const handleConfirmImport = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            if (importMode === 'simple') {
                // Eski basit mod: sadece proje bilgisi
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
            } else {
                // Yeni gelişmiş mod: Proje + Blok + Kat + Daire
                const rows = previewData.map(item => ({
                    project_name: item['Proje Adı'] || item['Project Name'] || '',
                    address: item['Adres'] || item['Address'] || '',
                    status: mapStatus(item['Durum'] || item['Status'] || 'PLANNING'),
                    description: item['Açıklama'] || item['Description'] || '',
                    start_date: item['Başlangıç Tarihi'] || item['Start Date'] || null,
                    end_date: item['Bitiş Tarihi'] || item['End Date'] || null,
                    block_name: item['Blok'] || item['Block'] || '',
                    floor_count: item['Kat Sayısı'] || item['Floor Count'] || null,
                    building_type: item['Bina Tipi'] || item['Building Type'] || null,
                    floor_number: item['Kat No'] || item['Floor No'] || item['Floor Number'],
                    unit_number: item['Daire No'] || item['Unit No'] || item['Unit Number'] || '',
                    unit_type: item['Daire Tipi'] || item['Unit Type'] || '',
                    facade: item['Cephe'] || item['Facade'] || '',
                    structure_type: item['Yapı Tipi'] || item['Structure Type'] || '',
                    sales_status: item['Satış Durumu'] || 'AVAILABLE'
                })).filter(r => r.project_name !== '');

                const res = await api.post('/projects/bulk-import', { rows });
                setImportResult(res);
                // Dışarıya da bildir ki proje listesi yenilensin
                if (onImport) onImport([], true);
            }
        } catch (err) {
            setError(err.message || 'Aktarım sırasında bir hata oluştu.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Önizleme için özet hesapla
    const getSummary = () => {
        if (importMode === 'simple') return null;
        const projects = new Set(previewData.map(r => r['Proje Adı'] || r['Project Name']).filter(Boolean));
        const blocks = new Set(previewData.map(r => `${r['Proje Adı']}_${r['Blok'] || r['Block']}`).filter(r => !r.endsWith('_')));
        const units = previewData.filter(r => r['Daire No'] || r['Unit No']).length;
        return { projects: projects.size, blocks: blocks.size, units };
    };

    const summary = getSummary();

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.3)] w-full max-w-5xl max-h-[90vh] overflow-hidden border border-white/20 flex flex-col">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shadow-sm">
                            <FileSpreadsheet size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Toplu Proje Aktarımı</h2>
                            <p className="text-sm text-slate-500 font-medium">Proje, Blok, Kat ve Daire bilgilerini tek Excel'den aktarın.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8">
                    {importResult ? (
                        // Sonuç Ekranı
                        <div className="flex flex-col items-center justify-center py-12 space-y-6">
                            <div className="p-4 bg-emerald-100 rounded-full">
                                <Check size={48} className="text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">Aktarım Tamamlandı!</h3>
                            <div className="grid grid-cols-4 gap-4 w-full max-w-lg">
                                {[
                                    { label: 'Proje', value: importResult.created?.projects, icon: <Building2 size={18} /> },
                                    { label: 'Blok', value: importResult.created?.blocks, icon: <Layers size={18} /> },
                                    { label: 'Kat', value: importResult.created?.floors, icon: <Layers size={18} /> },
                                    { label: 'Daire', value: importResult.created?.units, icon: <DoorOpen size={18} /> },
                                ].map((item, i) => (
                                    <div key={i} className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex justify-center text-emerald-600 mb-2">{item.icon}</div>
                                        <p className="text-2xl font-black text-slate-800">{item.value || 0}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : !fileName ? (
                        <div className="space-y-6">
                            {/* Template Downloads */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={downloadFullTemplate}
                                    className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-emerald-200 rounded-[24px] bg-emerald-50/30 hover:bg-emerald-50 transition-all group"
                                >
                                    <div className="p-3 bg-emerald-100 rounded-xl group-hover:scale-110 transition-transform">
                                        <Building2 size={24} className="text-emerald-700" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-black text-emerald-700">DETAYLI ŞABLON</p>
                                        <p className="text-[10px] text-emerald-600/70 mt-1">Proje + Blok + Kat + Daire</p>
                                    </div>
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-white px-3 py-1.5 rounded-lg border border-emerald-100">
                                        <Download size={12} /> İNDİR
                                    </span>
                                </button>

                                <button
                                    onClick={downloadSimpleTemplate}
                                    className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50/30 hover:bg-slate-50 transition-all group"
                                >
                                    <div className="p-3 bg-slate-100 rounded-xl group-hover:scale-110 transition-transform">
                                        <FileSpreadsheet size={24} className="text-slate-600" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-black text-slate-700">BASİT ŞABLON</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Sadece Proje Bilgisi</p>
                                    </div>
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                                        <Download size={12} /> İNDİR
                                    </span>
                                </button>
                            </div>

                            {/* File Upload */}
                            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50/30 hover:bg-slate-50 transition-colors group cursor-pointer relative">
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
                                <p className="text-sm text-slate-400 mt-1">.xlsx ve .xls formatları desteklenir</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* File Info + Mode Badge */}
                            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm">
                                        <FileSpreadsheet size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-emerald-700">{fileName}</p>
                                        <p className="text-[10px] text-emerald-600/70 uppercase font-bold tracking-widest">
                                            {previewData.length} Satır | {importMode === 'full' ? 'Detaylı Mod' : 'Basit Mod'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setFileName(''); setPreviewData([]); setImportResult(null); }}
                                    className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-slate-600 bg-white px-3 py-2 rounded-lg transition-all"
                                >
                                    <RefreshCw size={12} /> DEĞİŞTİR
                                </button>
                            </div>

                            {/* Summary Cards (Full mode) */}
                            {summary && (
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                                        <p className="text-lg font-black text-blue-700">{summary.projects}</p>
                                        <p className="text-[10px] font-bold text-blue-500 uppercase">Proje</p>
                                    </div>
                                    <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-center">
                                        <p className="text-lg font-black text-orange-700">{summary.blocks}</p>
                                        <p className="text-[10px] font-bold text-orange-500 uppercase">Blok</p>
                                    </div>
                                    <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-center">
                                        <p className="text-lg font-black text-orange-700">{summary.units}</p>
                                        <p className="text-[10px] font-bold text-orange-500 uppercase">Daire</p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-start gap-3">
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
                                                            <th key={key} className="px-4 py-3 font-black text-slate-500 uppercase tracking-tight whitespace-nowrap">{key}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {previewData.slice(0, 8).map((row, i) => (
                                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                            {Object.values(row).map((val, j) => (
                                                                <td key={j} className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">{val}</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {previewData.length > 8 && (
                                            <div className="p-3 bg-slate-50/50 text-center border-t border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">... ve {previewData.length - 8} satır daha</p>
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
                        {importResult ? 'KAPAT' : 'İPTAL'}
                    </button>
                    {!importResult && (
                        <button
                            disabled={!previewData.length || isProcessing || error}
                            onClick={handleConfirmImport}
                            className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-black transition-all shadow-xl ${!previewData.length || isProcessing || error
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {isProcessing ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
                            {importMode === 'full' ? 'TOPLU AKTARIMI BAŞLAT' : 'AKTARIMI BAŞLAT'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExcelProjectModal;
