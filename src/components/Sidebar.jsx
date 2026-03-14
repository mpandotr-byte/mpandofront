import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { X, ChevronRight, ChevronDown, LayoutGrid, Box, Users, Wallet, Hammer, Truck, HardHat, Construction, Settings, Search, HelpCircle, MessageSquare } from "lucide-react";
import { getAllowedModules, canManageUsers, ROLE_CONFIG } from "../config/roles";

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
  Documents: <Box className="w-5 h-5" />,
  ChevronDown: <ChevronDown className="w-4 h-4" />,
  Search: <Search className="w-4 h-4" />,
  Close: <X className="w-6 h-6" />
};

const navigationModules = {
  sales: {
    title: "Satış Bölümü",
    icon: icons.Sales,
    items: [
      { name: "Genel Bakış", icon: icons.Dashboard, href: "/dashboard?tab=sales" },
      { name: "Projeler", icon: icons.Projects, href: "/sales/projects" },
      { name: "Müşteriler", icon: icons.Personnel, href: "/customers" },
      { name: "Satış Kayıtları", icon: icons.Sales, href: "/sales" },
      { name: "Müşteri Teklifleri", icon: icons.MessageSquare, href: "/sales/offers" },
      { name: "EMLAK", icon: icons.Dashboard, href: "/emlak" },
    ],
  },
  construction: {
    title: "İnşaat Bölümü",
    icon: icons.Construction,
    items: [
      { name: "Genel Bakış", icon: icons.Dashboard, href: "/dashboard?tab=construction" },
      { name: "Mühendis Paneli", icon: icons.Settings, href: "/engineer-console" },
      { name: "Projeler", icon: icons.Projects, href: "/projects" },
      { name: "İnşaat Dosyalarım", icon: icons.Documents, href: "/construction/files" },
      { name: "Malzemeler", icon: icons.Materials, href: "/materials" },
      { name: "Stok Yönetimi", icon: icons.Materials, href: "/stock" },
      { name: "Satın Alma", icon: icons.Sales, href: "/purchasing" },
      { name: "Tedarikçiler", icon: icons.Personnel, href: "/suppliers" },
      { name: "Taşeron Yönetimi", icon: icons.Personnel, href: "/subcontractors" },
      { name: "Reçeteler (Analizler)", icon: icons.Dashboard, href: "/recipes" },
      { name: "Metraj Özeti", icon: icons.Dashboard, href: "/quantity-summary" },
      { name: "İhaleler", icon: icons.Sales, href: "/tenders" },
      { name: "DWG Yönetimi", icon: icons.Documents, href: "/dwg-manager" },
      { name: "Günlük Puantaj", icon: icons.Settings, href: "/attendance" },
    ],
  },
  accounting: {
    title: "Muhasebe",
    icon: icons.Accounting,
    items: [
      { name: "Genel Bakış", icon: icons.Dashboard, href: "/dashboard?tab=accounting" },
      { name: "Finans Özeti", icon: icons.Dashboard, href: "/accounting" },
      { name: "Gelir-Gider", icon: icons.Sales, href: "/accounting/income" },
      { name: "Nakit Akışı", icon: icons.Accounting, href: "/accounting/cash-flow" },
      { name: "Gelişmiş Finans", icon: icons.Dashboard, href: "/accounting/finance-advanced" },
      { name: "Merkezi Arşiv", icon: icons.Dashboard, href: "/documents" },
    ],
  },
  subcontractor: {
    title: "Taşeron Paneli",
    icon: icons.Hammer,
    items: [
      { name: "Ana Sayfa", icon: icons.Dashboard, href: "/sub-panel" },
      { name: "İşçi Havuzu", icon: icons.Personnel, href: "/employees" },
      { name: "İşçilik Kartları", icon: icons.Hammer, href: "/labors" },
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
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [activeModule, setActiveModule] = useState(null); // 'sales', 'construction', 'accounting'
  const toggleDesktopCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const location = useLocation();
  const { user } = useAuth();
  const unreadMessagesCount = 3; // Placeholder for now

  React.useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/projects') || path.startsWith('/engineer') || path.startsWith('/daily-reports') || path.startsWith('/planning') || path.startsWith('/attendance') || path.startsWith('/purchasing') || path.startsWith('/suppliers') || path.startsWith('/stock') || path.startsWith('/materials') || path.startsWith('/construction/files') || path.startsWith('/tenders') || path.startsWith('/dwg-manager') || path.startsWith('/quantity-summary') || path.startsWith('/recipes')) {
      setActiveModule('construction');
    } else if (path.startsWith('/accounting') || path.startsWith('/documents') || path.startsWith('/finance')) {
      setActiveModule('accounting');
    } else if (path.startsWith('/sub-panel') || path.startsWith('/employees') || path.startsWith('/labors') || path.startsWith('/subcontractors')) {
      setActiveModule('subcontractor');
    } else if (path.startsWith('/supp-panel')) {
      setActiveModule('supplier');
    } else if (path.startsWith('/sales') || path.startsWith('/customers') || path.startsWith('/emlak')) {
      setActiveModule('sales');
    }
  }, [location.pathname]);

  const sidebarWidthClass = isSidebarCollapsed
    ? "w-[280px] lg:w-20"
    : "w-[280px] lg:w-[280px]";

  const toggleDropdown = (dropdownName) => {
    setOpenDropdowns((prev) => ({ ...prev, [dropdownName]: !prev[dropdownName] }));
  };

  const isActivePath = (href) => location.pathname === href;

  const isDropdownParentActive = (item) => {
    if (item.type === "dropdown") {
      return openDropdowns[item.name] || item.children.some((child) => isActivePath(child.href));
    }
    return false;
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-45 md:hidden transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col ${sidebarWidthClass}
          bg-[#0A1128] border-r border-white/[0.06]
          transform transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) 
          lg:relative lg:translate-x-0 
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#D36A47]/[0.05] via-transparent to-black/20 pointer-events-none" />

        {/* Header */}
        <div className={`relative flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between px-5"} h-16 mb-1`}>
          <Link
            to="/dashboard"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
          >
            <div className={`rounded-xl flex items-center justify-center transition-all duration-300 ${isSidebarCollapsed ? "w-10 h-10" : "w-10 h-10 p-0"}`}>
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain brightness-0 invert group-hover:scale-110 transition-transform" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <span className="text-white font-black text-lg tracking-tight leading-none">MPANDO</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Construction</span>
              </div>
            )}
          </Link>

          <button
            className="lg:hidden p-1 text-slate-500 hover:text-white transition-colors"
            onClick={closeMobileMenu}
          >
            {icons.Close}
          </button>

          {!isSidebarCollapsed && (
            <button
              className="hidden lg:block p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              onClick={toggleDesktopCollapse}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}

          {isSidebarCollapsed && (
            <button
              className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-[#1e293b] border border-white/10 rounded-full items-center justify-center text-slate-400 shadow-lg hover:text-white hover:bg-indigo-600 hover:border-indigo-600 hover:scale-110 transition-all"
              onClick={toggleDesktopCollapse}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Search */}
        {!isSidebarCollapsed && (
          <div className="relative px-4 pb-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#D36A47] transition-colors">
                {icons.Search}
              </div>
              <input
                type="text"
                placeholder="Ara..."
                className="w-full pl-9 pr-3 py-2 bg-white/[0.03] border border-white/[0.06] focus:bg-white/[0.08] focus:border-[#D36A47]/30 rounded-xl text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#D36A47]/10 transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="relative flex-1 overflow-y-auto overflow-x-hidden px-3 scrollbar-hide">
          <nav className="space-y-4 pb-6">
            {!activeModule ? (
              <div className="space-y-2 mt-2">
                {!isSidebarCollapsed && (
                  <p className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em] mb-4">
                    Bölüm Seçiniz
                  </p>
                )}
                {Object.entries(navigationModules).filter(([key]) => {
                  const allowedModules = getAllowedModules(user?.role);
                  return allowedModules.includes(key);
                }).map(([key, module]) => (
                  <button
                    key={key}
                    onClick={() => setActiveModule(key)}
                    className={`group flex items-center gap-3 px-3 py-4 rounded-2xl transition-all duration-300 w-full bg-white/[0.03] border border-white/[0.05] hover:bg-[#D36A47]/10 hover:border-[#D36A47]/30
                      ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                    title={isSidebarCollapsed ? module.title : undefined}
                  >
                    <span className="text-slate-400 group-hover:text-[#D36A47] transition-colors">
                      {module.icon}
                    </span>
                    {!isSidebarCollapsed && (
                      <div className="flex flex-col items-start overflow-hidden">
                        <span className="text-[11px] font-black text-white leading-none mb-1 uppercase tracking-wide truncate w-full">{module.title}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-300">
                <button
                  onClick={() => setActiveModule(null)}
                  className={`flex items-center gap-2 mb-4 px-3 py-1 text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-wider transition-colors
                    ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {!isSidebarCollapsed && "GERİ DÖN"}
                </button>

                {!isSidebarCollapsed && (
                  <p className="px-3 text-[10px] font-bold text-[#D36A47] uppercase tracking-[0.15em] mb-3">
                    {navigationModules[activeModule].title}
                  </p>
                )}

                <ul className="space-y-0.5">
                  {navigationModules[activeModule].items.map((item, itemIdx) => {
                    if (item.type !== "dropdown") {
                      const isActive = isActivePath(item.href);
                      return (
                        <li key={itemIdx}>
                          <Link
                            to={item.href}
                            onClick={closeMobileMenu}
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ease-out relative
                              ${isSidebarCollapsed ? "justify-center px-0 py-3" : ""}
                              ${isActive
                                ? "bg-[#D36A47]/10 text-white"
                                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                              }`}
                            title={isSidebarCollapsed ? item.name : undefined}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3.5px] h-6 bg-[#D36A47] rounded-r-full" />
                            )}
                            <span className={`transition-all duration-200 ${isActive ? "text-[#D36A47]" : "text-slate-500 group-hover:text-slate-300"}`}>
                              {item.icon}
                            </span>
                            {!isSidebarCollapsed && (
                              <span className={`text-[13px] ${isActive ? "font-bold" : "font-medium"}`}>{item.name}</span>
                            )}
                            {isActive && !isSidebarCollapsed && (
                              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D36A47] shadow-sm shadow-[#D36A47]/50" />
                            )}
                          </Link>
                        </li>
                      );
                    } else {
                      const isDropdownOpen = openDropdowns[item.name];
                      const isActive = isDropdownParentActive(item);
                      return (
                        <li key={itemIdx}>
                          <button
                            type="button"
                            onClick={() => toggleDropdown(item.name)}
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ease-out w-full
                              ${isSidebarCollapsed ? "justify-center px-0 py-3" : ""}
                              ${isActive
                                ? "bg-[#D36A47]/10 text-white"
                                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                              }`}
                            title={isSidebarCollapsed ? item.name : undefined}
                            aria-expanded={isDropdownOpen}
                          >
                            <span className={`transition-all duration-200 ${isActive ? "text-[#D36A47]" : "text-slate-500 group-hover:text-slate-300"}`}>
                              {item.icon}
                            </span>
                            {!isSidebarCollapsed && (
                              <>
                                <span className={`text-[13px] mr-auto text-left ${isActive ? "font-semibold" : "font-medium"}`}>
                                  {item.name}
                                </span>
                                <span className={`transition-transform duration-200 text-slate-500 ${isDropdownOpen ? "rotate-180" : ""}`}>
                                  {icons.ChevronDown}
                                </span>
                              </>
                            )}
                          </button>

                          {isDropdownOpen && !isSidebarCollapsed && (
                            <ul className="ml-4 mt-1 space-y-0.5 border-l border-white/[0.06] pl-3">
                              {item.children.map((child, childIdx) => {
                                const isChildActive = isActivePath(child.href);
                                return (
                                  <li key={childIdx}>
                                    <Link
                                      to={child.href}
                                      onClick={closeMobileMenu}
                                      className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ease-out
                                        ${isChildActive
                                          ? "bg-[#D36A47]/10 text-white"
                                          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                                        }`}
                                    >
                                      <span className={`transition-all duration-200 ${isChildActive ? "text-[#D36A47]" : "text-slate-500 group-hover:text-slate-300"}`}>
                                        {child.icon}
                                      </span>
                                      <span className={`text-[13px] ${isChildActive ? "font-bold" : "font-medium"}`}>
                                        {child.name}
                                      </span>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    }
                  })}
                </ul>
              </div>
            )}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="relative mt-auto border-t border-white/[0.06] p-3">
          <ul className="space-y-1 mb-2">
            <li>
              <Link
                to="/messages"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 transition-all relative
                  ${isSidebarCollapsed ? "justify-center" : ""}
                  ${isActivePath("/messages") ? "bg-[#D36A47]/10 text-white" : ""}`}
                onClick={closeMobileMenu}
              >
                <span className={isActivePath("/messages") ? "text-[#D36A47]" : "text-slate-500"}>{icons.Messages}</span>
                {!isSidebarCollapsed && <span className="text-sm font-semibold">Mesajlar</span>}
                {unreadMessagesCount > 0 && (
                  <span className={`absolute ${isSidebarCollapsed ? "top-2 right-4" : "right-3 top-3"} flex h-5 w-5 items-center justify-center rounded-full bg-[#D36A47] text-[10px] font-black text-white shadow-lg shadow-[#D36A47]/30 ring-2 ring-[#0A1128]`}>
                    {unreadMessagesCount}
                  </span>
                )}
              </Link>
            </li>
            <li>
              <Link
                to="/announcements"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 transition-all
                  ${isSidebarCollapsed ? "justify-center" : ""}
                  ${isActivePath("/announcements") ? "bg-[#D36A47]/10 text-white" : ""}`}
                onClick={closeMobileMenu}
              >
                <span className={isActivePath("/announcements") ? "text-[#D36A47]" : ""}>{icons.Help}</span>
                {!isSidebarCollapsed && <span className="text-sm font-medium">Duyurular</span>}
              </Link>
            </li>
            {canManageUsers(user?.role) && (
            <li>
              <Link
                to="/user-management"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 transition-all
                  ${isSidebarCollapsed ? "justify-center" : ""}
                  ${isActivePath("/user-management") ? "bg-[#D36A47]/10 text-white" : ""}`}
                onClick={closeMobileMenu}
              >
                <span className={isActivePath("/user-management") ? "text-[#D36A47]" : ""}>{icons.Personnel}</span>
                {!isSidebarCollapsed && <span className="text-sm font-medium">Kullanıcı Yönetimi</span>}
              </Link>
            </li>
            )}
            <li>
              <Link
                to="/activity-logs"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 transition-all
                  ${isSidebarCollapsed ? "justify-center" : ""}
                  ${isActivePath("/activity-logs") ? "bg-[#D36A47]/10 text-white" : ""}`}
                onClick={closeMobileMenu}
              >
                <span className={isActivePath("/activity-logs") ? "text-[#D36A47]" : ""}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                </span>
                {!isSidebarCollapsed && <span className="text-sm font-medium">Aktivite Kayitlari</span>}
              </Link>
            </li>
          </ul>

          {/* User Card */}
          {!isSidebarCollapsed && (
            <div className="mt-2 mx-1 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D36A47] to-[#A35235] flex items-center justify-center text-white text-xs font-black shadow-lg shadow-[#D36A47]/20 group-hover:scale-105 transition-transform">
                  {user?.full_name?.charAt(0) || 'M'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-white truncate leading-tight uppercase tracking-tight">{user?.full_name || 'Mustafa KARATAŞ'}</p>
                  <p className="text-[10px] text-slate-500 truncate font-bold mt-0.5">
                    {user?.company_name || 'İSKAR İnşaat'} - {ROLE_CONFIG[user?.role]?.label || user?.role || 'yönetici'}
                  </p>
                </div>
              </div>
            </div>
          )}
          {isSidebarCollapsed && (
            <div className="flex justify-center py-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D36A47] to-[#A35235] flex items-center justify-center text-white text-xs font-black shadow-lg shadow-[#D36A47]/20">
                {user?.full_name?.charAt(0) || 'M'}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}