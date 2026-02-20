import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [boutiqueName, setBoutiqueName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/register", {
        boutique_name: boutiqueName,
        name,
        email,
        password
      });

      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);

      navigate("/");
    } catch (err) {
      Swal.fire({
        title: "Erreur inscription",
        text: err.response?.data?.message || "Une erreur est survenue.",
        icon: "error",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-fadeIn">

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Créer votre compte Fivoy
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            placeholder="Nom de la boutique"
            value={boutiqueName}
            onChange={(e) => setBoutiqueName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-violet-500 outline-none"
          />

          <input
            type="text"
            placeholder="Votre nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-violet-500 outline-none"
          />

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
                Création...
              </>
            ) : (
              "Créer mon compte"
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            Essai gratuit 14 jours • Sans engagement
          </p>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Déjà un compte ?{" "}
          <Link
            to="/login"
            className="text-violet-600 hover:underline font-medium"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;