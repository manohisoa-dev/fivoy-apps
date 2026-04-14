import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { Loader2, CheckCircle } from "lucide-react";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDoodle((prev) => (prev + 1) % doodles.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [doodles.length]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">

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

          <p 
            key={currentDoodle}
            className="text-xl text-gray-300 mb-8 leading-relaxed transition-all duration-500">
            {messages[currentDoodle]}

            <div className="flex gap-2 mt-4">
              {messages.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 animate-pulse ${
                    index === currentDoodle
                      ? "w-6 bg-violet-500"
                      : "w-2 bg-gray-500"
                  }`}
                />
              ))}
            </div>
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

          {/* Illustration */}
          <div className="mt-8">
            <img
              key={currentDoodle}
              src={doodles[currentDoodle]}
              alt="Illustration Fivoy"
              className="w-full max-w-lg drop-shadow-2xl animate-fadeIn transition-all duration-700"
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE LOGIN */}
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-8 animate-fadeIn border border-gray-100">

          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Connexion à votre espace
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition bg-gray-50"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition bg-gray-50"
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
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
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