import { Outlet, Link } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { PrinterCheck, Clock, ShoppingCart, DollarSign, BarChart3, LogOut } from "lucide-react";
import { User, Building2, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay";

const MainLayout = () => {
  const [open, setOpen] = useState(false);
  const { user, logout, trialDaysRemaining, initialized } = useContext(AuthContext);

  const location = useLocation();
  const isPricingPage = location.pathname === "/pricing";

  const isTrialUser = trialDaysRemaining !== null;
  const isExpired = isTrialUser && trialDaysRemaining < 0;

  const badgeClass = !isTrialUser
    ? ""
    : trialDaysRemaining <= 3
    ? "bg-red-100 text-red-600"
    : trialDaysRemaining <= 7
    ? "bg-orange-100 text-orange-600"
    : "bg-blue-100 text-blue-600";

  const label = !isTrialUser
    ? ""
    : isExpired
    ? "❌ Essai expiré"
    : `⏳ Essai gratuit • ${trialDaysRemaining} jour${trialDaysRemaining !== 1 ? "s" : ""} restant${trialDaysRemaining !== 1 ? "s" : ""}`;

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
  <>
    <LoadingOverlay />
    <div>
      {/* Navbar */}
      <div className="bg-gray-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            {user?.boutique?.logo ? (
              <img src={user?.boutique?.logo_url} className="h-8 w-8 object-contain" alt="logo" />
            ) : (
              <div className="h-8 w-8 bg-violet-600 rounded flex items-center justify-center text-white">
                {user?.boutique?.name?.charAt(0)}
              </div>
            )}

            <h1 className="text-2xl font-bold">
              {user?.boutique?.name || "Fivoy Services"}
            </h1>

            {/* Nombre jours d'esssaie restant, Trial Day Remaining */}
            {trialDaysRemaining !== null && (
              <div
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm ${badgeClass}`}
              >
                {label}
              </div>
            )}

          </div>

          {/* Navigation */}
          <div className="flex items-center gap-8">

            <nav className="flex gap-4">

              <Link to="/" className="hover:text-violet-400 flex items-center gap-1">
                <Clock size={16} /> Compteur
              </Link>

              <Link to="/sales" className="hover:text-violet-400 flex items-center gap-1">
                <ShoppingCart size={16} /> Ventes
              </Link>

              <Link to="/expenses" className="hover:text-violet-400 flex items-center gap-1">
                <DollarSign size={16} /> Dépenses
              </Link>

              <Link to="/posters" className="hover:text-violet-400 flex items-center gap-1">
                <PrinterCheck size={16} /> Posters PDF
              </Link>

              <Link to="/dashboard" className="hover:text-violet-400 flex items-center gap-1">
                <BarChart3 size={16} /> Dashboard
              </Link>
            </nav>

            {/* User section */}
            <div className="relative">
                <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
                >
                    <div className="bg-violet-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown size={16} />
                </button>

                {open && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg text-gray-700 z-50">
                    <div className="p-4 border-b">
                        <p className="font-semibold">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <Link to="/profile" className="text-sm text-violet-600 hover:underline">Paramètres</Link> - {" "}
                        <Link to="/pricing" className="text-sm text-violet-600 hover:text-violet-600 transition">
                          Voir les offres
                        </Link>
                    </div>

                    <div className="p-4 border-b">
                        <div className="flex items-center gap-2 text-sm">
                            <Building2 size={16} />

                            {user?.role === "super_admin" ? (
                            <span className="font-semibold text-purple-600">
                                Super Admin Panel
                            </span>
                            ) : (
                            <span>
                                {user?.boutique?.name}
                            </span>
                            )}

                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2 text-red-600"
                    >
                        <LogOut size={16} />
                        Déconnexion
                    </button>
                    </div>
                )}
                </div>


          </div>
        </div>
      </div>

      {/* Page */}
      <div className="p-6">
        {isExpired && !isPricingPage && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fadeIn">
              
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Votre essai est terminé
              </h2>

              <p className="text-gray-600 mb-6">
                Continuez à utiliser toutes les fonctionnalités de Fivoy en choisissant un plan adapté à votre boutique.
              </p>

              <button
                onClick={() => window.location.href = "/pricing"}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-semibold transition"
              >
                Choisir un plan
              </button>

              <p className="text-xs text-gray-400 mt-4">
                Vos données sont conservées en toute sécurité.
              </p>

            </div>
          </div>
        )}


        <Outlet />
      </div>

      {/* Footer global */}
      <footer className="bg-gray-100 border-t mt-10">
        <div className="max-w-7xl mx-auto py-4 px-6 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Copyright – {" "}
          <a
            href="https://agnaro.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 hover:underline font-medium"
          >
            Agnarö Webcompany
          </a>
           {" "}| Développé par{" "}
          <a
            href="https://manou.agnaro.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 hover:underline font-medium"
          >
            Manou
          </a>
        </div>
      </footer>
    </div>
  </>
  );
};

export default MainLayout;
