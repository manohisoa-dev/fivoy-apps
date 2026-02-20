import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import AuthLayout from "./layouts/AuthLayout";
import RegisterPage from "./pages/RegisterPage";

import MainLayout from "./layouts/MainLayout";
import DashboardPage from "./modules/dashboard/DashboardPage";
import SalesPage from "./modules/sales/SalesPage";
import ExpensesPage from "./modules/expenses/ExpensesPage";
import ProfileSettings from "./modules/profile/ProfileSettings";
import CounterApp from "./CounterApp";
import PosterGenerator from "./PosterGenerator";

import PricingPage from "./pages/PricingPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<AuthLayout />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<CounterApp />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/posters" element={<PosterGenerator />} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/pricing" element={<PricingPage />} />
            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
