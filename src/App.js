import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import AuthLayout from "./layouts/AuthLayout";
import RegisterPage from "./pages/RegisterPage";

import MainLayout from "./layouts/MainLayout";
import DashboardPage from "./modules/dashboard/DashboardPage";
import SalesPage from "./modules/sales/SalesPage";
import ExpensesPage from "./modules/expenses/ExpensesPage";
import ExpenseCategoriesPage from "./modules/expenses/ExpenseCategoriesPage";
import ProfileSettings from "./modules/profile/ProfileSettings";
import CounterApp from "./CounterApp";
import PosterGenerator from "./PosterGenerator";
import ProductsPage from "./modules/products/ProductsPage";
import { Toaster } from "react-hot-toast";

import PricingPage from "./pages/PricingPage";
import POSPage from "./modules/pos/POSPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
      
        <Routes>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
            
          <Route element={<AuthLayout />}>

            {/* Layout normal */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<CounterApp />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/sales-history" element={<SalesPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/expense-categories" element={<ExpenseCategoriesPage />} />
              <Route path="/posters" element={<PosterGenerator />} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/products" element={<ProductsPage />} />

              <Route path="/pos" element={<POSPage />} />
            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
