import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";

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
    } catch (err) {
      Swal.fire({
        title: "Erreur de connexion",
        text: "Veuillez vérifier vos identifiants.",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">

      {/* Center content */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

          {/* Logo / Branding */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Fivoy
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              La solution SaaS pour gérer votre boutique efficacement
            </p>
          </div>

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
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
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
        </div>
      </div>

      {/* Footer global */}
      <footer className="text-center text-gray-400 text-sm py-4">
        © {new Date().getFullYear()} Copyright – Fivoy | Développé par{" "}
        <a
          href="https://ton-site.com"
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