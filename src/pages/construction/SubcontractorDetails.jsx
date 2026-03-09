import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { api } from '../../api/client';
import {
    Users,
    Hammer,
    Wallet,
    Calendar,
    Plus,
    ArrowLeft,
    CheckCircle2,
    Clock,
    ClipboardList,
    Package,
    FileText,
    Camera,
    Search,
    CheckSquare,
    Phone,
    Mail,
    MapPin,
    User,
    Hash
} from 'lucide-react';
import JobOrderModal from '../../modals/subcontractors/JobOrderModal';
import MaterialAssignmentModal from '../../modals/subcontractors/MaterialAssignmentModal';
import JobControlModal from '../../modals/subcontractors/JobControlModal';

const SubcontractorDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [subcontractor, setSubcontractor] = useState(null);
    const [activeJobs, setActiveJobs] = useState([]);
    const [completedJobs, setCompletedJobs] = useState([]);
    const [activeTab, setActiveTab] = useState('active');

    // Modal states
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [isControlModalOpen, setIsControlModalOpen] = useState(false);
    const [selectedJobForControl, setSelectedJobForControl] = useState(null);

    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subDataResponse, summaryResponse, jobsDataResponse] = await Promise.all([
                api.get(`/companies/${id}`), // Fetches from companies directly just in case /subcontractors/:id isn't fully propagated, works identically
                api.get(`/subcontractors/summary/${id}`).catch(() => ({})), // Try to get the summary for calculated fields
                api.get(`/subcontractors/jobs?subcontractor_id=${id}`)
            ]);

            const subData = Array.isArray(subDataResponse) ? subDataResponse[0] : subDataResponse;
            const summary = summaryResponse || {};
            const jobsData = Array.isArray(jobsDataResponse) ? jobsDataResponse : (jobsDataResponse?.data || jobsDataResponse || []);

            // Make sure we parse category tags into a string representation for expertise
            const expertiseTags = subData?.category_tags && subData.category_tags.length > 0
                ? subData.category_tags.join(', ') : 'Genel Taşeron';

            setSubcontractor({
                ...subData,
                expertise: subData.expertise || expertiseTags,
                activeJobsCount: summary.active_jobs_count ?? jobsData.filter(j => j.status !== 'COMPLETED').length,
                balance: summary.balance ?? subData.balance ?? 0,
                rating: subData.rating || '5.0'
            });

            const jobs = jobsData || [];
            setActiveJobs(jobs.filter(j => j.status !== 'COMPLETED'));
            setCompletedJobs(jobs.filter(j => j.status === 'COMPLETED'));
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddJob = async (formData) => {
        try {
            await api.post('/subcontractors/jobs', {
                ...formData,
                subcontractor_id: id
            });
            alert("İş Emri Başarıyla Oluşturuldu!");
            setIsJobModalOpen(false);
            fetchData();
        } catch (err) {
            console.error("Job add error:", err);
            alert("İş emri oluşturulurken bir hata oluştu: " + err.message);
        }
    };

    const handleAssignMaterials = async (materials) => {
        try {
            // Material allocation using the new backend endpoint
            // Since the endpoint requires a Job ID, and the modal might not give one,
            // we will allocate to the first active job or handle it. 
            // In the provided UI, there's no way to select which job yet, so we'll use activeJobs[0] for now if available.
            const targetJobId = activeJobs[0]?.id;

            if (!targetJobId) {
                alert("Önce aktif bir iş emri oluşturmalısınız.");
                return;
            }

            await Promise.all(materials.map(m =>
                api.post(`/subcontractors/jobs/${targetJobId}/allocate-materials`, {
                    material_id: m.id,
                    quantity: m.quantity,
                    notes: "Toplu ekleme"
                })
            ));
            alert("Malzemeler Taşerona Zimmetlendi!");
            setIsMaterialModalOpen(false);
            fetchData();
        } catch (err) {
            console.error("Material assignment error:", err);
            alert("Malzeme tahsisi sırasında bir hata oluştu.");
        }
    };

    const handleApproveJob = async (controlData) => {
        try {
            // Hit the new complete endpoint
            await api.post(`/subcontractors/jobs/${selectedJobForControl.id}/complete`, {
                control_notes: controlData.notes,
                photo_urls: [] // Assuming photo handling could be added later
            });

            alert("İş Onaylandı ve Tamamlandı!");
            setIsControlModalOpen(false);
            fetchData();
        } catch (err) {
            console.error("Job approval error:", err);
            alert("İş onaylama sırasında bir hata oluştu.");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={closeMobileMenu} />
            <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 relative">
                <Navbar title="Taşeron Detayı" toggleMobileMenu={toggleMobileMenu} />

                <div className="px-4 sm:px-6 md:px-8 pb-12 pt-4 md:pt-6 space-y-6">

                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/subcontractors')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm"
                    >
                        <ArrowLeft size={18} />
                        GERİ DÖN
                    </button>

                    {/* 1. TAŞERON / USTA KİMLİK KARTI (Üst Panel) */}
                    <div className="bg-white rounded-[40px] border border-white shadow-xl shadow-slate-200/40 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-gradient-to-r from-[#0A1128] to-[#1E293B] p-8 md:p-10 text-white relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D36A47]/10 rounded-full blur-[80px]" />

                            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl font-black border border-white/20 shadow-inner">
                                        {subcontractor?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-black tracking-tight">{subcontractor?.name}</h1>
                                        <div className="flex flex-wrap gap-4 mt-2 text-white/50 text-xs font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg">
                                                <Hammer size={14} className="text-[#D36A47]" /> {subcontractor?.expertise}
                                            </span>
                                            <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg">
                                                <Clock size={14} className="text-blue-400" /> {subcontractor?.activeJobsCount} Aktif Görev
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#D36A47] mb-1">Bakiye Durumu</p>
                                        <p className="text-xl md:text-2xl font-black leading-none">
                                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(subcontractor?.balance)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-10 bg-slate-50/50 border-t border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div className="flex flex-wrap gap-8 w-full max-w-4xl">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5"><User size={14} className="text-[#D36A47]" /> Yetkili Kişi</p>
                                    <p className="text-sm font-black text-slate-800">{subcontractor?.authorized_person || 'Bilgi Yok'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5"><Phone size={14} className="text-indigo-500" /> Telefon</p>
                                    <p className="text-sm font-black text-slate-800">{subcontractor?.phone || 'Bilgi Yok'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5"><Mail size={14} className="text-emerald-500" /> E-Posta</p>
                                    <p className="text-sm font-black text-slate-800">{subcontractor?.email || 'Bilgi Yok'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5"><Hash size={14} className="text-blue-500" /> Vergi No</p>
                                    <p className="text-sm font-black text-slate-800">{subcontractor?.tax_number || 'Bilgi Yok'}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 shrink-0">
                                {/* 2. İŞ EKLE BUTONU */}
                                <button
                                    onClick={() => setIsJobModalOpen(true)}
                                    className="flex items-center gap-3 text-sm font-black text-white bg-[#0A1128] hover:bg-slate-800 shadow-xl shadow-[#0A1128]/20 px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95"
                                >
                                    <Plus size={20} />
                                    <span>İŞ EKLE</span>
                                </button>

                                {/* 2.-1 MALZEME EKLE BUTONU */}
                                <button
                                    onClick={() => setIsMaterialModalOpen(true)}
                                    className="flex items-center gap-3 text-sm font-black text-[#D36A47] bg-[#D36A47]/10 hover:bg-[#D36A47]/20 px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95"
                                >
                                    <Package size={20} />
                                    <span>MALZEME EKLE</span>
                                </button>
                            </div>
                        </div>
                        {subcontractor?.address && (
                            <div className="px-8 pb-8 md:px-10 md:pb-10 pt-4 bg-slate-50/50">
                                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Firma Adresi</p>
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed">{subcontractor.address}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 p-1 bg-slate-200/50 rounded-2xl w-fit">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-[#0A1128] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Aktif İşler ({activeJobs.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'completed' ? 'bg-[#0A1128] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Tamamlanan İşler ({completedJobs.length})
                        </button>
                    </div>

                    {/* 4. TAŞERONUN AKTİF İŞ LİSTESİ */}
                    {activeTab === 'active' ? (
                        <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeJobs.map((job) => (
                                <div key={job.id} className="bg-white rounded-[32px] p-6 border border-white shadow-sm hover:shadow-xl transition-all group">
                                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                                        <div className="flex gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#D36A47]">
                                                <Hammer size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{job.type}</h4>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                                    <ClipboardList size={14} /> {job.location}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Metraj</p>
                                                <p className="text-sm font-black text-slate-800">{job.quantity}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Birim Fiyat</p>
                                                <p className="text-sm font-black text-slate-800">{job.unitPrice}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Toplam Bedel</p>
                                                <p className="text-sm font-black text-indigo-600 font-mono">{job.totalPrice}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Hedef Tarih</p>
                                                <p className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-slate-400" /> {job.deadline}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => { setSelectedJobForControl(job); setIsControlModalOpen(true); }}
                                                className="flex-1 lg:flex-none px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                                            >
                                                KONTROL ET & ONAYLA
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {activeJobs.length === 0 && (
                                <div className="bg-white rounded-[32px] p-20 text-center border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold">Herhangi bir aktif iş bulunmuyor.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {completedJobs.map((job) => (
                                <div key={job.id} className="bg-white rounded-[32px] p-6 border border-white shadow-sm hover:shadow-xl transition-all opacity-80 hover:opacity-100">
                                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                                        <div className="flex gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                                <CheckCircle2 size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{job.type}</h4>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                                    <ClipboardList size={14} /> {job.location}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Metraj</p>
                                                <p className="text-sm font-black text-slate-800">{job.quantity}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Toplam Bedel</p>
                                                <p className="text-sm font-black text-slate-800">{job.totalPrice}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tamamlama</p>
                                                <p className="text-sm font-black text-slate-800">{job.completedDate}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">ONAYLANDI</span>
                                                <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors" title="Raporu Gör">
                                                    <FileText size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </main>

            <JobOrderModal
                isOpen={isJobModalOpen}
                onClose={() => setIsJobModalOpen(false)}
                onAdd={handleAddJob}
                subcontractorId={id}
            />

            <MaterialAssignmentModal
                isOpen={isMaterialModalOpen}
                onClose={() => setIsMaterialModalOpen(false)}
                onAssign={handleAssignMaterials}
                jobId={null} // Can be generalized or specific to a job
                subcontractorName={subcontractor?.name}
            />

            <JobControlModal
                isOpen={isControlModalOpen}
                onClose={() => setIsControlModalOpen(false)}
                onApprove={handleApproveJob}
                job={selectedJobForControl}
            />
        </div>
    );
};

export default SubcontractorDetails;
