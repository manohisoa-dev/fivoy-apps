import { useState, useContext } from "react";
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

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">

      {/* LEFT SIDE BRANDING */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 px-20 text-white">
        <h1 className="text-5xl font-bold mb-6">
          Fivoy
        </h1>

        <p className="text-lg text-gray-300 mb-8">
          Gérez votre boutique de films simplement, rapidement et intelligemment.
        </p>

        <div className="space-y-4 text-gray-300">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-violet-500" />
            <span>Gestion des ventes et dépenses</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="text-violet-500" />
            <span>Générateur de posters PDF intégré</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="text-violet-500" />
            <span>Statistiques et suivi en temps réel</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE LOGIN */}
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-fadeIn">

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
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-violet-500 outline-none"
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-violet-500 outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg flex items-center justify-center transition disabled:opacity-50"
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
              className="text-violet-600 hover:underline font-medium"
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