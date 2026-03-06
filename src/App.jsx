import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Projects from "./pages/construction/Projects";
import ProjectDetails from "./pages/construction/ProjectDetails";
import BlockDetails from "./pages/construction/BlockDetails";
import Customers from "./pages/sales/Customers";
import Sales from "./pages/sales/Sales";
import SecondHandListings from "./pages/sales/SecondHandListings";
import Messages from "./pages/system/Messages";
import Notifications from "./pages/system/Notifications";
import Materials from "./pages/construction/Materials";
import Labors from "./pages/construction/Labors";
import Recipes from "./pages/construction/Recipes";
import RecipeConsole from "./pages/construction/RecipeConsole";
import Purchasing from "./pages/purchasing/Purchasing";
import Stock from "./pages/construction/Stock";
import Subcontractors from "./pages/construction/Subcontractors";
import SubcontractorDetails from "./pages/construction/SubcontractorDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <Projects />
            </PrivateRoute>
          }
        />

        <Route
          path="/projects/:id"
          element={
            <PrivateRoute>
              <ProjectDetails />
            </PrivateRoute>
          }
        />

        <Route
          path="/projects/:projectId/blocks/:blockId"
          element={
            <PrivateRoute>
              <BlockDetails />
            </PrivateRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <PrivateRoute>
              <Customers />
            </PrivateRoute>
          }
        />

        <Route
          path="/sales"
          element={
            <PrivateRoute>
              <Sales />
            </PrivateRoute>
          }
        />

        <Route
          path="/second-hand-listings"
          element={
            <PrivateRoute>
              <SecondHandListings />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          }
        />
        <Route
          path="/materials"
          element={
            <PrivateRoute>
              <Materials />
            </PrivateRoute>
          }
        />
        <Route
          path="/labors"
          element={
            <PrivateRoute>
              <Labors />
            </PrivateRoute>
          }
        />
        <Route
          path="/recipes"
          element={
            <PrivateRoute>
              <Recipes />
            </PrivateRoute>
          }
        />
        <Route
          path="/purchasing"
          element={
            <PrivateRoute>
              <Purchasing />
            </PrivateRoute>
          }
        />
        <Route
          path="/stock"
          element={
            <PrivateRoute>
              <Stock />
            </PrivateRoute>
          }
        />
        <Route
          path="/subcontractors"
          element={
            <PrivateRoute>
              <Subcontractors />
            </PrivateRoute>
          }
        />
        <Route
          path="/subcontractors/:id"
          element={
            <PrivateRoute>
              <SubcontractorDetails />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter >
  );
}

export default App;
