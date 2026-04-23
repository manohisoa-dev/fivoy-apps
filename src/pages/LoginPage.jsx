import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import Swal from "sweetalert2";
import { Loader2, CheckCircle } from "lucide-react";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const doodles = [
    "/images/login-1.png",
    "/images/login-2.png",
    "/images/login-3.png",
    "/images/login-4.png",
    "/images/login-5.png",
  ];
  const [currentDoodle, setCurrentDoodle] = useState(0);
  const messages = [
    "Boost tes ventes facilement",
    "Gagne du temps chaque jour",
    "Analyse ton business en temps réel",
    "Fini les erreurs de cahier",
    "Tout est simple et rapide",
  ];

  const [showPassword, setShowPassword] = useState(false);

  const [step, setStep] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      setLoading(true);
      setStep("Connexion...");

      await login(email, password);

      setStep("Chargement des données...");

      await Promise.all([
        api.get("/pos/stats/today"),
        api.get("/sales"),
      ]);

      navigate("/");
    } catch {
      Swal.fire({
        title: "Connexion échouée",
        text: "Vérifiez vos identifiants.",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-black from-gray-900 via-gray-800 to-gray-900">

      {/* LEFT SIDE BRANDING */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 px-20 text-white relative overflow-hidden">

        {/* Background glow */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-violet-600 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-800 opacity-30 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
            Fivoy
          </h1>

          <h1 className="text-5xl font-extrabold mb-6">
            Votre boutique peut vendre <span className="text-primary">2x plus</span>.
          </h1>

          <p className="text-gray-300 mb-8 text-lg">
            Fivoy analyse vos ventes, recommande quoi vendre et contrôle chaque Ariary.
          </p>

          <div className="space-y-4 text-gray-300">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-violet-500" />
              <span>Suivi des ventes en temps réel</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-violet-500" />
              <span>Gestion automatique des dépenses</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-violet-500" />
              <span>Statistiques claires et exploitables</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">

            <div className="bg-white/5 p-4 rounded-xl text-center">
              <div className="text-xl font-bold text-primary">+32%</div>
              <div className="text-xs text-gray-400">Ventes moyennes</div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl text-center">
              <div className="text-xl font-bold text-primary">5s</div>
              <div className="text-xs text-gray-400">Par vente</div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl text-center">
              <div className="text-xl font-bold text-primary">0 erreur</div>
              <div className="text-xs text-gray-400">Caisse fiable</div>
            </div>

          </div>

          <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3 animate-fadeIn hover:scale-[1.02] transition">

            <div className="text-sm text-gray-300">🔥 En ce moment</div>

            <div className="flex justify-between text-sm">
              <span>12 ventes aujourd’hui</span>
              <span className="text-green-400">+85 000 Ar</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Fast & Furious 10</span>
              <span className="text-primary">Top 1</span>
            </div>

          </div>

          <div className="flex gap-6 mt-10 text-xs text-gray-400">
            <span>📶 Fonctionne offline</span>
            <span>⚡ Ultra rapide</span>
            <span>🇲🇬 Pensé pour Madagascar</span>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE LOGIN */}
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 animate-fadeIn border border-gray-100">

          <h2 className="text-2xl font-bold text-gray-500 mb-6 text-center">
            Connexion à votre espace
          </h2>
          <p className="text-gray-500 text-center text-md mb-4">
            Suivez vos ventes, contrôlez votre caisse et découvrez ce qui se vend vraiment.
          </p>
          <p className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs mb-4">
            ⚠️ La plupart des boutiques perdent de l'argent sans le savoir.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-gray-50"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary  focus:border-transparent outline-none transition bg-gray-50"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-600 transition"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 hover:scale-[1.02] active:scale-[0.98] text-white py-3 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  {step}
                </>
              ) : (
                "Accéder à mon business"
              )}
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              🔒 Données sécurisées • Fonctionne même avec une connexion faible
            </p>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Pas encore de compte ?{" "}
            <Link
              to="/register"
              className="text-purple-600 hover:underline font-medium"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="absolute bottom-4 w-full text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Fivoy | Développé par{" "}
        <a
          href="https://manou.agnaro.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 hover:underline"
        >
          Manou
        </a>
      </footer>
    </div>
  );
}

export default LoginPage;