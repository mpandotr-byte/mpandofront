import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { X, ChevronRight, LayoutGrid, Box, Users, Wallet, Hammer, Truck, HardHat, Construction, Settings, Search, HelpCircle, MessageSquare } from "lucide-react";

/**
 * MPANDO Akıllı Navigasyon Sistemi (Sidebar)
 * 
 * Bu bileşen, kullanıcının departmanlar arası geçiş yapmasını sağlar. 
 * Modüler yapısı sayesinde her departman (Satış, İnşaat, Muhasebe vb.) kendi alt menülerine sahiptir.
 * Sidebar, hem geniş (masaüstü) hem de dar (mobil/collapsed) modları destekler.
 */

// İkon ve navigasyon verilerinin merkezi yönetimi
const icons = {
  Dashboard: <LayoutGrid className="w-5 h-5" />,
  Projects: <Box className="w-5 h-5" />,
  Personnel: <Users className="w-5 h-5" />,
  Sales: <Wallet className="w-5 h-5" />,
  Materials: <Truck className="w-5 h-5" />,
  Hammer: <Hammer className="w-5 h-5" />,
  Construction: <Construction className="w-5 h-5" />,
  Accounting: <Wallet className="w-5 h-5" />,
  HR: <HardHat className="w-5 h-5" />,
  Settings: <Settings className="w-5 h-5" />,
  Help: <HelpCircle className="w-4 h-4" />,
  Messages: <MessageSquare className="w-4 h-4" />,
  Inventory: <Box className="w-5 h-5" />,
  Documents: <Box className="w-5 h-5" />
};

// Departman bazlı menü yapısı
const navigationModules = {
  sales: {
    title: "Satış & Müşteri",
    group: "Ticari",
    icon: icons.Sales,
    items: [
      { name: "Müşteriler", icon: icons.Personnel, href: "/customers" },
      { name: "Satış Kayıtları", icon: icons.Sales, href: "/sales" },
      { name: "2. El İlanlar", icon: icons.Dashboard, href: "/second-hand-listings" },
    ],
  },
  construction: {
    title: "Üretim & Saha",
    group: "Operasyon",
    icon: icons.Construction,
    items: [
      { name: "Mühendis Paneli", icon: icons.Settings, href: "/engineer-console" },
      { name: "Projeler", icon: icons.Projects, href: "/projects" },
      { name: "Saha Raporları", icon: icons.Construction, href: "/daily-reports" },
      { name: "İş Programı", icon: icons.Settings, href: "/planning" },
    ],
  },
  supply: {
    title: "Tedarik & Stok",
    group: "Operasyon",
    icon: icons.Materials,
    items: [
      { name: "Satın Alma", icon: icons.Sales, href: "/purchasing" },
      { name: "Tedarikçiler", icon: icons.Personnel, href: "/suppliers" },
      { name: "Malzeme Kataloğu", icon: icons.Materials, href: "/materials" },
      { name: "Saha Envanteri", icon: icons.Inventory, href: "/stock" },
    ],
  },
  hr: {
    title: "İK & Puantaj",
    group: "Operasyon",
    icon: icons.HR,
    items: [
      { name: "İşçi Havuzu", icon: icons.Personnel, href: "/employees" },
      { name: "Günlük Puantaj", icon: icons.Settings, href: "/attendance" },
    ],
  },
  accounting: {
    title: "Muhasebe & Finans",
    group: "Ticari",
    icon: icons.Accounting,
    items: [
      { name: "Finans Özeti", icon: icons.Dashboard, href: "/accounting" },
      { name: "Gelir-Gider", icon: icons.Sales, href: "/accounting/income" },
      { name: "Merkezi Arşiv", icon: icons.Dashboard, href: "/documents" },
    ],
  },
  subcontractor: {
    title: "Taşeron Paneli",
    group: "Dış Panel",
    icon: icons.Hammer,
    items: [
      { name: "Ana Sayfa", icon: icons.Dashboard, href: "/sub-panel" },
      { name: "Tekliflerim", icon: icons.Sales, href: "/sub-panel/bids" },
      { name: "İşlerim", icon: icons.Hammer, href: "/sub-panel/jobs" },
      { name: "Stok & Zimmet", icon: icons.Materials, href: "/sub-panel/stock" },
      { name: "Puantaj", icon: icons.HR, href: "/sub-panel/attendance" },
      { name: "Hakedişlerim", icon: icons.Accounting, href: "/sub-panel/payments" },
      { name: "Muhasebe", icon: icons.Wallet, href: "/sub-panel/accounting" },
    ],
  },
  supplier: {
    title: "Tedarikçi Paneli",
    group: "Dış Panel",
    icon: icons.Materials,
    items: [
      { name: "Ana Sayfa", icon: icons.Dashboard, href: "/supp-panel" },
      { name: "Malzeme Kartlarım", icon: icons.Materials, href: "/supp-panel/materials" },
      { name: "Siparişler", icon: icons.Sales, href: "/supp-panel/orders" },
      { name: "Stok Takibi", icon: icons.Inventory, href: "/supp-panel/stock" },
      { name: "Tekliflerim", icon: icons.Sales, href: "/supp-panel/offers" },
      { name: "Muhasebe", icon: icons.Wallet, href: "/supp-panel/accounting" },
    ],
  }
};

export default function Sidebar({ isMobileMenuOpen, closeMobileMenu }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const location = useLocation();
  const { user } = useAuth();
  const unreadMessagesCount = 3;

  // Mevcut URL'e göre aktif olan departmanı otomatik tespit et
  React.useEffect(() => {
    const path = location.pathname;
    // Auto-detect module from path
    if (path.startsWith('/projects') || path.startsWith('/engineer') || path.startsWith('/daily-reports') || path.startsWith('/planning')) setActiveModule('construction');
    else if (path.startsWith('/customers') || path.startsWith('/sales') || path.startsWith('/second-hand')) setActiveModule('sales');
    else if (path.startsWith('/materials') || path.startsWith('/stock') || path.startsWith('/purchasing') || path.startsWith('/suppliers')) setActiveModule('supply');
    else if (path.startsWith('/employees') || path.startsWith('/attendance')) setActiveModule('hr');
    else if (path.startsWith('/accounting') || path.startsWith('/documents')) setActiveModule('accounting');
    else if (path.startsWith('/sub-panel')) setActiveModule('subcontractor');
    else if (path.startsWith('/supp-panel')) setActiveModule('supplier');
  }, [location.pathname]);

  const sidebarWidthClass = isSidebarCollapsed ? "w-20" : "w-[280px]";

  const isActivePath = (href) => location.pathname === href;

  return (
    <>
      {/* Mobil Cihazlar İçin Karartma Perdesi */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={closeMobileMenu} />
      )}

      {/* Ana Sidebar Gövdesi */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 flex flex-col ${sidebarWidthClass} bg-[#0A1128] border-r border-white/5 transition-all duration-500 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        {/* Logo ve Başlık Alanı */}
        <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#D36A47] rounded-xl flex items-center justify-center shadow-lg shadow-[#D36A47]/20 group-hover:scale-110 transition-transform">
              <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain brightness-0 invert" />
            </div>
            {!isSidebarCollapsed && (
              <div>
                <span className="text-white font-black text-lg tracking-tighter block leading-none">MPANDO</span>
                <span className="text-[#D36A47] text-[8px] font-black uppercase tracking-[0.3em]">Core Engine</span>
              </div>
            )}
          </Link>
          {/* Sidebar Daraltma Butonu */}
          {!isSidebarCollapsed && (
            <button onClick={() => setIsSidebarCollapsed(true)} className="p-2 text-slate-500 hover:text-white rounded-lg lg:block hidden"><ChevronRight className="rotate-180" /></button>
          )}
          {isSidebarCollapsed && (
            <button onClick={() => setIsSidebarCollapsed(false)} className="absolute -right-3 top-8 w-6 h-6 bg-[#D36A47] text-white rounded-full flex items-center justify-center lg:flex hidden"><ChevronRight size={14} /></button>
          )}
        </div>

        {/* Departman ve Menü Listesi */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-hide">
          {!activeModule ? (
            /* BAŞLANGIÇ EKRANI: Departman Kartları */
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Ana Departmanlar</p>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(navigationModules).map(([key, mod]) => (
                  <button key={key} onClick={() => setActiveModule(key)} className="flex items-center gap-4 p-4 bg-white/5 hover:bg-[#D36A47]/10 border border-white/5 hover:border-[#D36A47]/20 rounded-[20px] group transition-all text-left">
                    <div className="w-10 h-10 rounded-xl bg-[#0A1128] border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-[#D36A47] transition-colors">{mod.icon}</div>
                    {!isSidebarCollapsed && (
                      <div className="flex-1">
                        <p className="text-white font-black text-[11px] uppercase tracking-wide leading-none">{mod.title}</p>
                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">{mod.group}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* DETAY EKRANI: Seçili Departmanın Alt Menüsü */
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <button onClick={() => setActiveModule(null)} className="flex items-center gap-2 text-[10px] font-black text-[#D36A47] uppercase tracking-widest hover:translate-x-1 transition-transform mb-4">
                <ChevronRight className="rotate-180" size={14} /> Geri Dön
              </button>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-4">{navigationModules[activeModule].title}</p>
                <div className="space-y-1">
                  {navigationModules[activeModule].items.map((item, i) => (
                    <Link key={i} to={item.href} onClick={closeMobileMenu} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActivePath(item.href) ? 'bg-[#D36A47] text-white shadow-lg shadow-[#D36A47]/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                      <div className={`${isActivePath(item.href) ? 'text-white' : 'text-slate-500'} transition-colors`}>{item.icon}</div>
                      {!isSidebarCollapsed && <span className="text-[12px] font-black uppercase tracking-wide">{item.name}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Alt Alanı (Mesajlar ve Profil) */}
        <div className="p-4 bg-black/20 border-t border-white/5">
          <div className="space-y-2 mb-6">
            <Link to="/messages" className="flex items-center gap-4 p-3 rounded-xl text-slate-500 hover:text-white transition-all relative">
              {icons.Messages}
              {!isSidebarCollapsed && <span className="text-[11px] font-black uppercase tracking-widest">Mesajlar</span>}
              {unreadMessagesCount > 0 && <span className="absolute top-2 left-6 w-2 h-2 bg-[#D36A47] rounded-full border-2 border-[#0A1128]" />}
            </Link>
            <Link to="/help" className="flex items-center gap-4 p-3 rounded-xl text-slate-500 hover:text-white transition-all">
              {icons.Help}
              {!isSidebarCollapsed && <span className="text-[11px] font-black uppercase tracking-widest">Destek</span>}
            </Link>
          </div>

          {/* Kullanıcı Bilgi Kartı */}
          {!isSidebarCollapsed && (
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D36A47] to-[#A35235] text-white font-black text-xs flex items-center justify-center uppercase">{user?.full_name?.charAt(0) || 'M'}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[11px] font-black uppercase truncate tracking-tighter leading-none">{user?.full_name || 'Mustafa Karataş'}</p>
                  <p className="text-[#D36A47] text-[9px] font-bold uppercase truncate mt-1">{user?.role || 'Admin'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}