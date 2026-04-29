import { Outlet, Link } from "react-router-dom";
import { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { PrinterCheck, Clock, ShoppingCart,History , DollarSign, BarChart3, LogOut, ReceiptText, ClipboardList, Package } from "lucide-react";
import { User, Building2, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay";

const MainLayout = () => {
  const [open, setOpen] = useState(false);
  const { user, logout, trialDaysRemaining, initialized } = useContext(AuthContext);

  const location = useLocation();
  const isPOS = location.pathname === "/pos";
  const isPricingPage = location.pathname === "/pricing";

  const isTrialUser = trialDaysRemaining !== null;
  const isExpired = isTrialUser && trialDaysRemaining < 0;

  const badgeClass = !isTrialUser
    ? ""
    : trialDaysRemaining <= 3
    ? "bg-red-100 text-red-600"
    : trialDaysRemaining <= 7
    ? "bg-orange-100 text-orange-600"
    : "bg-blue-100 text-primary";

  const label = !isTrialUser
    ? ""
    : isExpired
    ? "❌ Essai expiré"
    : `⏳ Essai gratuit • ${trialDaysRemaining} jour${trialDaysRemaining !== 1 ? "s" : ""} restant${trialDaysRemaining !== 1 ? "s" : ""}`;

  {/* UX Dropdown : click outside non géré*/}
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  {/* FIN UX Dropdown : click outside non géré*/}

  {/* Gestion des coulurs dynamique selon les chart du boutique client */}
  useEffect(() => {
    if (user?.boutique?.primary_color) {
      const primary = user.boutique.primary_color;

      document.documentElement.style.setProperty(
        "--primary-color",
        primary
      );

      document.documentElement.style.setProperty(
        "--primary-color-hover",
        darkenColor(primary, 12) // 12% plus foncé
      );
    }
  }, [user]);

  function darkenColor(hex, percent) {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;

    return (
      "#" +
      (
        0x1000000 +
        (R < 0 ? 0 : R) * 0x10000 +
        (G < 0 ? 0 : G) * 0x100 +
        (B < 0 ? 0 : B)
      )
        .toString(16)
        .slice(1)
    );
  }

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const menus = [
    {
      label: "Opérations",
      items: [
        { to: "/pos", label: "Caisse", icon: ShoppingCart },
        { to: "/orders", label: "Commandes", icon: ClipboardList },
        { to: "/", label: "Compteur", icon: Clock },
      ]
    },
    {
      label: "Finances",
      items: [
        { to: "/sales-history", label: "Ventes", icon: History },
        { to: "/expenses", label: "Dépenses", icon: DollarSign },
        { to: "/credits", label: "Avoir - Créances", icon: ReceiptText },
      ]
    },
    {
      label: "Clients & contenu",
      items: [
        { to: "/clients", label: "Clients", icon: User },
        { to: "/posters", label: "Posters", icon: PrinterCheck },
      ]
    },
    {
      label: "Analyse",
      items: [
        { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
        { to: "/stock", label: "Stock", icon: Package },
      ]
    }
  ];

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
  <>
    <LoadingOverlay />
    <div>
      {/* Navbar */}
      <div className="bg-gray-800 text-white p-4 relative">
        {mobileOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white text-gray-800 shadow-lg z-50">

            {menus.map((menu, i) => (
              <div key={i} className="border-b">

                <div className="px-4 py-2 font-semibold">
                  {menu.label}
                </div>

                {menu.items.map((item, j) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={j}
                      to={item.to}
                      onClick={()=>setMobileOpen(false)}
                      className="flex items-center gap-2 px-6 py-2 hover:bg-gray-100"
                    >
                      <Icon size={16} />
                      {item.label}
                    </Link>
                  );
                })}

              </div>
            ))}

          </div>
        )}

        
        <div className={isPOS ? "flex justify-between items-center px-0" : "max-w-7xl mx-auto flex justify-between items-center"}>
          {mobileOpen ? (
            <button
              onClick={() => setMobileOpen(false)}
            >
              ✕
            </button>
          ) : (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden"
            >
            ☰
          </button>
          )}
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            {user?.boutique?.logo ? (
              <img 
                src={`https://api.agnaro.io/api/logo/${user.boutique.logo}`}
                className="h-8 w-8 object-contain" alt="logo" 
              />
            ) : (
              <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white">
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

            <nav className="hidden md:flex items-center gap-4">

              {menus.map((menu, i) => (
                <div key={i} className="relative group">

                  <button className="flex items-center gap-1 hover-text-primary">
                    {menu.label}
                    <ChevronDown size={14} />
                  </button>

                  <div className="absolute top-full left-0 mt-2 w-56 bg-white text-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">

                    {menu.items.map((item, j) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.to;

                      return (
                        <Link
                          key={j}
                          to={item.to}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                        >
                          <Icon size={16} />
                          {item.label}
                        </Link>
                      );
                    })}

                  </div>
                </div>
              ))}

            </nav>

            {/* User section */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
                >
                    <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown size={16} />
                </button>

                {open && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg text-gray-700 z-50">
                    <div className="p-4 border-b">
                        <p className="font-semibold">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <Link to="/profile" className="text-sm text-primary hover:underline">Paramètres</Link> - {" "}
                        <Link to="/pricing" className="text-sm text-primary hover:text-primary transition">
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
                        onClick={handleLogout}
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
                className="w-full bg-primary border-primary text-white py-3 rounded-lg font-semibold transition"
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
            className="text-primary hover:underline font-medium"
          >
            Agnarö Webcompany
          </a>
           {" "}| Développé par{" "}
          <a
            href="https://manou.agnaro.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
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
