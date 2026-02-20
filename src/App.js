import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import DashboardPage from "./modules/dashboard/DashboardPage";
import SalesPage from "./modules/sales/SalesPage";
import ExpensesPage from "./modules/expenses/ExpensesPage";
import ProfileSettings from "./modules/profile/ProfileSettings";
import CounterApp from "./CounterApp";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<AuthLayout />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<CounterApp />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/profile" element={<ProfileSettings />} />
            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
