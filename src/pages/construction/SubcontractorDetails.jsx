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
    CheckSquare
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
            const [subData, jobsData] = await Promise.all([
                api.get(`/companies/${id}`),
                api.get(`/subcontractor_jobs?subcontractor_id=${id}`)
            ]);

            setSubcontractor({
                ...subData,
                expertise: subData.expertise || 'Genel Taşeron',
                activeJobsCount: (jobsData || []).filter(j => j.status !== 'COMPLETED').length,
                balance: subData.balance || 0,
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
            await api.post('/subcontractor_jobs', {
                ...formData,
                subcontractor_id: id,
                status: 'ACTIVE'
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
            // Bulk assignment to the database
            await Promise.all(materials.map(m =>
                api.post('/subcontractor_material_assignments', {
                    subcontractor_id: id,
                    material_id: m.id,
                    quantity: m.quantity,
                    assignment_date: new Date().toISOString()
                })
            ));
            alert("Malzemeler Taşerona Tahsis Edildi!");
            setIsMaterialModalOpen(false);
        } catch (err) {
            console.error("Material assignment error:", err);
            alert("Malzeme tahsisi sırasında bir hata oluştu.");
        }
    };

    const handleApproveJob = async (controlData) => {
        try {
            // 1. Create control record
            await api.post('/subcontractor_job_controls', {
                job_id: selectedJobForControl.id,
                notes: controlData.notes,
                control_date: new Date().toISOString(),
                is_approved: true
            });
            // 2. Update job status
            await api.put(`/subcontractor_jobs/${selectedJobForControl.id}`, {
                status: 'COMPLETED'
            });

            alert("İş Onaylandı ve Tamamlananlara Taşındı!");
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

                        <div className="p-8 md:p-10 flex flex-wrap gap-4">
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
