import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { X } from "lucide-react";

const icons = {
  Dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Projects: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  Personnel: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Sales: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  House: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10" />
    </svg>
  ),
  SecondHandListings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10.5L12 3l9 7.5M5 9.5V20a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 21a6 6 0 0010-3M19 14v4h-4" />
    </svg>
  ),
  Help: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  ChevronDown: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Search: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Close: (
    <X className="w-6 h-6" />
  ),
  Messages: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
};

const navigationGroups = [
  {
    title: "GENEL İŞLEMLER",
    items: [
      { name: "Dashboard", icon: icons.Dashboard, href: "/dashboard" },
      { name: "Projeler", icon: icons.Projects, href: "/projects" },
      { name: "Müşteriler", icon: icons.Personnel, href: "/customers" },
      { name: "Satış Kayıtları", icon: icons.Sales, href: "/sales" },
      {
        name: "Emlak",
        icon: icons.House,
        type: "dropdown",
        children: [
          { name: "2. El İlanlar", icon: icons.SecondHandListings, href: "/second-hand-listings" },
        ],
      },
      { name: "Mesajlar", icon: icons.Messages, href: "/messages" },
    ],
  },
];

export default function Sidebar({ isMobileMenuOpen, closeMobileMenu }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const toggleDesktopCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const location = useLocation();
  const { user } = useAuth();

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
          <nav className="space-y-6 pb-6">
            {navigationGroups.map((group, groupIdx) => (
              <div key={groupIdx}>
                {!isSidebarCollapsed && (
                  <p className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em] mb-2 mt-2">
                    {group.title}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {group.items.map((item, itemIdx) => {
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
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="relative mt-auto border-t border-white/[0.06] p-3">
          <ul className="space-y-1">
            <li>
              <Link
                to="/help"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 transition-all
                  ${isSidebarCollapsed ? "justify-center" : ""}`}
                onClick={closeMobileMenu}
              >
                <span>{icons.Help}</span>
                {!isSidebarCollapsed && <span className="text-sm font-medium">Destek ve Yardım</span>}
              </Link>
            </li>
          </ul>

          {/* User Card */}
          {!isSidebarCollapsed && (
            <div className="mt-2 mx-1 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A1128] to-[#1E293B] flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-black/20">
                  {user?.full_name?.charAt(0) || 'M'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-300 truncate">{user?.full_name || 'Mpando User'}</p>
                  <p className="text-[10px] text-slate-600 truncate uppercase tracking-tighter">Premium Plan</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}