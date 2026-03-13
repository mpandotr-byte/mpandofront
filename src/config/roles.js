/**
 * MPANDO Rol Bazli Yetkilendirme Yapisi
 *
 * Her rol icin:
 * - label: Turkce gorunen isim
 * - modules: Gorebilecegi sidebar modulleri
 * - allowedPaths: Erisebilecegi route path'leri (prefix match)
 * - defaultPath: Login sonrasi yonlendirilecegi sayfa
 */

export const ROLE_CONFIG = {
  CORP_ADMIN: {
    label: 'Sirket Yoneticisi',
    modules: ['sales', 'construction', 'accounting', 'subcontractor', 'supplier'],
    allowedPaths: ['*'], // Her yere erisim (user-management dahil)
    defaultPath: '/dashboard',
  },
  PROJECT_MANAGER: {
    label: 'Proje Muduru',
    modules: ['construction', 'accounting', 'subcontractor'],
    allowedPaths: [
      '/dashboard', '/projects', '/engineer-console', '/daily-reports', '/planning',
      '/attendance', '/purchasing', '/suppliers', '/stock', '/materials',
      '/construction/files', '/tenders', '/dwg-manager', '/quantity-summary', '/recipes',
      '/subcontractors', '/accounting', '/documents', '/sub-panel',
      '/employees', '/labors', '/messages', '/notifications', '/announcements',
    ],
    defaultPath: '/dashboard',
  },
  SITE_ENGINEER: {
    label: 'Saha Muhendisi',
    modules: ['construction'],
    allowedPaths: [
      '/dashboard', '/projects', '/engineer-console', '/daily-reports', '/planning',
      '/attendance', '/materials', '/stock', '/construction/files',
      '/dwg-manager', '/quantity-summary', '/recipes', '/subcontractors',
      '/messages', '/notifications', '/announcements',
    ],
    defaultPath: '/dashboard',
  },
  ACCOUNTANT: {
    label: 'Muhasebeci',
    modules: ['accounting'],
    allowedPaths: [
      '/dashboard', '/accounting', '/documents',
      '/messages', '/notifications', '/announcements',
    ],
    defaultPath: '/accounting',
  },
  SALES_REP: {
    label: 'Satis Danismani',
    modules: ['sales'],
    allowedPaths: [
      '/dashboard', '/sales', '/customers', '/emlak',
      '/messages', '/notifications', '/announcements',
    ],
    defaultPath: '/sales/projects',
  },
  SUB_OWNER: {
    label: 'Taseron Sahibi',
    modules: ['subcontractor'],
    allowedPaths: [
      '/dashboard', '/sub-panel', '/employees', '/labors',
      '/messages', '/notifications', '/announcements',
    ],
    defaultPath: '/sub-panel',
  },
  SUB_SUPERVISOR: {
    label: 'Taseron Amiri',
    modules: ['subcontractor'],
    allowedPaths: [
      '/dashboard', '/sub-panel', '/employees', '/labors',
      '/messages', '/notifications', '/announcements',
    ],
    defaultPath: '/sub-panel',
  },
  SUPP_MANAGER: {
    label: 'Tedarikci Muduru',
    modules: ['supplier'],
    allowedPaths: [
      '/dashboard', '/supp-panel',
      '/messages', '/notifications', '/announcements',
    ],
    defaultPath: '/supp-panel',
  },
  SUPP_LOGISTICS: {
    label: 'Tedarikci Lojistik',
    modules: ['supplier'],
    allowedPaths: [
      '/dashboard', '/supp-panel',
      '/messages', '/notifications', '/announcements',
    ],
    defaultPath: '/supp-panel',
  },
};

/**
 * Kullanicinin belirli bir path'e erisim yetkisi var mi?
 */
export function hasAccess(role, path) {
  const config = ROLE_CONFIG[role];
  if (!config) return false;
  if (config.allowedPaths.includes('*')) return true;
  return config.allowedPaths.some(allowed => path === allowed || path.startsWith(allowed + '/'));
}

/**
 * Kullanicinin gorebilecegi sidebar modullerini dondurur
 */
export function getAllowedModules(role) {
  const config = ROLE_CONFIG[role];
  if (!config) return [];
  return config.modules;
}

/**
 * Kullanicinin login sonrasi yonlendirilecegi varsayilan path
 */
export function getDefaultPath(role) {
  const config = ROLE_CONFIG[role];
  return config?.defaultPath || '/dashboard';
}

/**
 * Kullanicinin user-management erisimi var mi? (Sadece CORP_ADMIN)
 */
export function canManageUsers(role) {
  return role === 'CORP_ADMIN';
}
