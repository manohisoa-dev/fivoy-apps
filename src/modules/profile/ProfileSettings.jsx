import { useState, useContext } from "react";
import api from "../../api/api";
import { AuthContext } from "../../context/AuthContext";
import { useLoadingStore } from '../../store/loading';
import Swal from 'sweetalert2';   

const ProfileSettings = () => {
  const { user, setUser } = useContext(AuthContext);
  const { loading, withLoading } = useLoadingStore();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [logoutAll, setLogoutAll] = useState(false);

  const [boutiqueName, setBoutiqueName] = useState(user?.boutique?.name || "");
  const [logoFile, setLogoFile] = useState(null);
  const [preview, setPreview] = useState(null);


  const handleProfileUpdate = async () => {
    try {
      await withLoading(async () => {
        await api.put("/profile", { name, email });

        Swal.fire({
          title: "Profil mis à jour !",
          text: "Votre profil a bien été mis à jour.",
          icon: "success",
          confirmButtonText: "OK",
        });
      });
    } catch (err) {
      Swal.fire({
        title: "Erreur mise à jour profil.",
        text: `Une erreur s'est produite lors de la mise à jour de votre profil`,
        icon: "error",
        confirmButtonText: "OK",
        cancelButtonText: "Annuler",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      await api.put("/profile", {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
        logout_all_devices: logoutAll
      });

      Swal.fire({
        title: "Mot de passe mis à jour. !",
        text: `Votre mot de passe a bien été mise à jour avec succès`,
        icon: "success",
        confirmButtonText: "OK",
      });
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setLogoutAll(false);

    } catch (err) {
      Swal.fire({
        title: "Erreur mise à jour du mot de passe.",
        text: err.response?.data?.message || "Erreur mot de passe.",
        icon: "error",
        confirmButtonText: "OK",
        cancelButtonText: "Annuler",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const handleBoutiqueUpdate = async () => {
    const formData = new FormData();
    formData.append("name", boutiqueName);

    if (logoFile) {
      formData.append("logo", logoFile);
    }

    formData.append("_method", "PUT");

    await api.post("/boutique", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    await withLoading(async () => {
      Swal.fire({
        title: "Boutique mise à jour !",
        icon: "success",
        confirmButtonText: "OK",
      });

      const refreshedUser = await api.get("/me");
      setUser(refreshedUser.data);
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Bloc Infos personnelles */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Informations personnelles</h2>

        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nom"
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border px-3 py-2 rounded"
          />
          
          <button 
            onClick={handleProfileUpdate} 
            disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* Bloc Mot de passe */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Changer le mot de passe</h2>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="Mot de passe actuel"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="password"
            placeholder="Confirmer nouveau mot de passe"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={logoutAll}
              onChange={() => setLogoutAll(!logoutAll)}
            />
            Déconnecter tous les appareils
          </label>

          <button
            onClick={handlePasswordUpdate}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Modifier mot de passe
          </button>
        </div>
      </div>

      {/* Bloc Paramètres Boutique */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">
          Paramètres Boutique
        </h2>

        {/* Nom boutique */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Nom de la boutique
          </label>
          <input
            type="text"
            value={boutiqueName}
            onChange={(e) => setBoutiqueName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Upload logo */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Logo
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              setLogoFile(file);
              setPreview(URL.createObjectURL(file));
            }}
            className="w-full"
          />

          {/* Preview nouveau logo */}
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="h-16 mt-3 rounded object-contain"
            />
          )}

          {/* Logo actuel si pas de preview */}
          {!preview && user?.boutique?.logo && (
            <img
              src={`https://api.agnaro.io/storage/${user.boutique.logo}`}
              alt="Logo actuel"
              className="h-16 mt-3 rounded object-contain"
            />
          )}
        </div>

        <button
          onClick={handleBoutiqueUpdate}
          className="px-4 py-2 bg-violet-600 text-white rounded"
        >
          Enregistrer Boutique
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
