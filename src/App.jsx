import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";

import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Profile from "./pages/auth/Profile";
import Dashboard from "./pages/dashboard/Dashboard";
import Projects from "./pages/construction/Projects";
import ProjectDetails from "./pages/construction/ProjectDetails";
import BlockDetails from "./pages/construction/BlockDetails";
import Customers from "./pages/sales/Customers";
import Sales from "./pages/sales/Sales";
import Offers from "./pages/sales/Offers";
import SecondHandListings from "./pages/sales/SecondHandListings";
import Messages from "./pages/system/Messages";
import Notifications from "./pages/system/Notifications";
import Materials from "./pages/construction/Materials";
import Labors from "./pages/construction/Labors";
import Recipes from "./pages/construction/Recipes";
import RecipeConsole from "./pages/construction/RecipeConsole";
import Purchasing from "./pages/purchasing/Purchasing";
import Suppliers from "./pages/purchasing/Suppliers";
import SupplierDetails from "./pages/purchasing/SupplierDetails";
import Stock from "./pages/construction/Stock";
import Subcontractors from "./pages/construction/Subcontractors";
import SubcontractorDetails from "./pages/construction/SubcontractorDetails";
import Employees from "./pages/hr/Employees";
import EmployeeDetails from "./pages/hr/EmployeeDetails";
import Attendance from "./pages/hr/Attendance";
import EngineerConsole from "./pages/construction/EngineerConsole";
import DailyReports from "./pages/construction/DailyReports";
import SiteLogs from "./pages/construction/SiteLogs";
import Planning from "./pages/construction/Planning";
import ConstructionFiles from "./pages/construction/ConstructionFiles";

import AccountingDashboard from "./pages/accounting/AccountingDashboard";
import IncomeManagement from "./pages/accounting/IncomeManagement";
import ExpenseManagement from "./pages/accounting/ExpenseManagement";
import SubcontractorPersonnel from "./pages/accounting/SubcontractorPersonnel";
import CashFlowCentre from "./pages/accounting/CashFlowCentre";
import Documents from "./pages/accounting/Documents";

import SubDashboard from "./pages/subcontractor/SubDashboard";
import SubBids from "./pages/subcontractor/SubBids";
import SubJobs from "./pages/subcontractor/SubJobs";
import SubStock from "./pages/subcontractor/SubStock";
import SubAttendance from "./pages/subcontractor/SubAttendance";
import SubPayments from "./pages/subcontractor/SubPayments";
import SubAccounting from "./pages/subcontractor/SubAccounting";

import SuppDashboard from "./pages/supplier/SuppDashboard";
import SuppMaterials from "./pages/supplier/SuppMaterials";
import SuppOrders from "./pages/supplier/SuppOrders";
import SuppStock from "./pages/supplier/SuppStock";
import SuppOffers from "./pages/supplier/SuppOffers";
import SuppAccounting from "./pages/supplier/SuppAccounting";

// Tenders ve DwgManager kaldırıldı - DWG/PDF yükleme İnşaat Projeler sayfasına taşındı
import Announcements from "./pages/system/Announcements";
import UserManagement from "./pages/system/UserManagement";
import ActivityLogs from "./pages/system/ActivityLogs";
import FinanceAdvanced from "./pages/accounting/FinanceAdvanced";
import QuantitySummary from "./pages/construction/QuantitySummary";
import SalesProjects from "./pages/sales/SalesProjects";
import SalesProjectDetails from "./pages/sales/SalesProjectDetails";
import SalesBlockDetails from "./pages/sales/SalesBlockDetails";

/**
 * MPANDO Ana Uygulama Yapılandırması (v2.7)
 * 
 * Bu dosya projenin ana giriş noktasıdır ve tüm sayfa yönlendirmelerini (Routing) yönetir. 
 * Güvenlik için PrivateRoute bileşeni kullanılarak yetkisiz erişimler engellenmiştir.
 * Tüm sayfalar mantıksal klasör yapısına göre (auth, accounting, construction, hr, purchasing, subcontractor, supplier) ayrılmıştır.
 */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- KİMLİK DOĞRULAMA (Login) --- */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* --- ANA KOMUTA MERKEZİ --- */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* --- PROJE VE ŞANTİYE YÖNETİMİ --- */}
        <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
        <Route path="/projects/:id" element={<PrivateRoute><ProjectDetails /></PrivateRoute>} />
        <Route path="/projects/:projectId/blocks/:blockId" element={<PrivateRoute><BlockDetails /></PrivateRoute>} />
        <Route path="/construction/files" element={<PrivateRoute><ConstructionFiles /></PrivateRoute>} />
        <Route path="/quantity-summary" element={<PrivateRoute><QuantitySummary /></PrivateRoute>} />

        {/* --- SATIŞ VE MÜŞTERİ YÖNETİMİ --- */}
        <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
        <Route path="/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
        <Route path="/sales/projects" element={<PrivateRoute><SalesProjects /></PrivateRoute>} />
        <Route path="/sales/projects/:id" element={<PrivateRoute><SalesProjectDetails /></PrivateRoute>} />
        <Route path="/sales/projects/:projectId/blocks/:blockId" element={<PrivateRoute><SalesBlockDetails /></PrivateRoute>} />
        <Route path="/sales/offers" element={<PrivateRoute><Offers /></PrivateRoute>} />
        <Route path="/emlak" element={<PrivateRoute><SecondHandListings /></PrivateRoute>} />

        {/* --- SİSTEM VE İLETİŞİM --- */}
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
        <Route path="/announcements" element={<PrivateRoute><Announcements /></PrivateRoute>} />
        <Route path="/user-management" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
        <Route path="/activity-logs" element={<PrivateRoute><ActivityLogs /></PrivateRoute>} />

        {/* --- ÜRETİM, MALZEME VE TEKNİK --- */}
        <Route path="/materials" element={<PrivateRoute><Materials /></PrivateRoute>} />
        <Route path="/labors" element={<PrivateRoute><Labors /></PrivateRoute>} />
        <Route path="/recipes" element={<PrivateRoute><Recipes /></PrivateRoute>} />
        <Route path="/recipes/console" element={<PrivateRoute><RecipeConsole /></PrivateRoute>} />
        <Route path="/purchasing" element={<PrivateRoute><Purchasing /></PrivateRoute>} />
        <Route path="/suppliers" element={<PrivateRoute><Suppliers /></PrivateRoute>} />
        <Route path="/suppliers/:id" element={<PrivateRoute><SupplierDetails /></PrivateRoute>} />
        <Route path="/stock" element={<PrivateRoute><Stock /></PrivateRoute>} />
        <Route path="/subcontractors" element={<PrivateRoute><Subcontractors /></PrivateRoute>} />
        <Route path="/subcontractors/:id" element={<PrivateRoute><SubcontractorDetails /></PrivateRoute>} />
        <Route path="/engineer-console" element={<PrivateRoute><EngineerConsole /></PrivateRoute>} />
        <Route path="/daily-reports" element={<PrivateRoute><DailyReports /></PrivateRoute>} />
        <Route path="/site-logs" element={<PrivateRoute><SiteLogs /></PrivateRoute>} />
        <Route path="/planning" element={<PrivateRoute><Planning /></PrivateRoute>} />
        {/* Tenders ve DWG Manager kaldırıldı */}

        {/* --- İNSAN KAYNAKLARI (İK) VE PUANTAJ --- */}
        <Route path="/employees" element={<PrivateRoute><Employees /></PrivateRoute>} />
        <Route path="/employees/:id" element={<PrivateRoute><EmployeeDetails /></PrivateRoute>} />
        <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />

        {/* --- MUHASEBE VE FİNANS KURGUSU --- */}
        <Route path="/accounting" element={<PrivateRoute><AccountingDashboard /></PrivateRoute>} />
        <Route path="/accounting/income" element={<PrivateRoute><IncomeManagement /></PrivateRoute>} />
        <Route path="/accounting/expense" element={<PrivateRoute><ExpenseManagement /></PrivateRoute>} />
        <Route path="/accounting/subcontractors" element={<PrivateRoute><SubcontractorPersonnel /></PrivateRoute>} />
        <Route path="/accounting/cash-flow" element={<PrivateRoute><CashFlowCentre /></PrivateRoute>} />
        <Route path="/accounting/finance-advanced" element={<PrivateRoute><FinanceAdvanced /></PrivateRoute>} />
        <Route path="/documents" element={<PrivateRoute><Documents /></PrivateRoute>} />

        {/* --- TAŞERON PANELİ (Harici Erişim) --- */}
        <Route path="/sub-panel" element={<PrivateRoute><SubDashboard /></PrivateRoute>} />
        <Route path="/sub-panel/bids" element={<PrivateRoute><SubBids /></PrivateRoute>} />
        <Route path="/sub-panel/jobs" element={<PrivateRoute><SubJobs /></PrivateRoute>} />
        <Route path="/sub-panel/stock" element={<PrivateRoute><SubStock /></PrivateRoute>} />
        <Route path="/sub-panel/attendance" element={<PrivateRoute><SubAttendance /></PrivateRoute>} />
        <Route path="/sub-panel/payments" element={<PrivateRoute><SubPayments /></PrivateRoute>} />
        <Route path="/sub-panel/accounting" element={<PrivateRoute><SubAccounting /></PrivateRoute>} />

        {/* --- TEDARİKÇİ PANELİ (Harici Erişim) --- */}
        <Route path="/supp-panel" element={<PrivateRoute><SuppDashboard /></PrivateRoute>} />
        <Route path="/supp-panel/materials" element={<PrivateRoute><SuppMaterials /></PrivateRoute>} />
        <Route path="/supp-panel/orders" element={<PrivateRoute><SuppOrders /></PrivateRoute>} />
        <Route path="/supp-panel/stock" element={<PrivateRoute><SuppStock /></PrivateRoute>} />
        <Route path="/supp-panel/offers" element={<PrivateRoute><SuppOffers /></PrivateRoute>} />
        <Route path="/supp-panel/accounting" element={<PrivateRoute><SuppAccounting /></PrivateRoute>} />
      </Routes>
    </BrowserRouter >
  );
}

export default App;
