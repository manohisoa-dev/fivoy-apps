import { useState, useEffect } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import Swal from "sweetalert2";

const emptyStockDraft = {
  is_stockable: false,
};

const ExpenseCategoriesPage = () => {
  const [newCategory, setNewCategory] = useState("");
  const [newColor, setNewColor] = useState("#3B82F6");
  const [newStockDraft, setNewStockDraft] = useState(emptyStockDraft);
  const [activeCategories, setActiveCategories] = useState([]);
  const [inactiveCategories, setInactiveCategories] = useState([]);
  const [editingColors, setEditingColors] = useState({});
  const [stockDrafts, setStockDrafts] = useState({});
  const navigate = useNavigate();

  const loadCategories = async () => {
    const res = await api.get("/expense-categories?with_inactive=1");
    const active = res.data.filter((category) => category.is_active);
    const inactive = res.data.filter((category) => !category.is_active);

    setActiveCategories(active);
    setInactiveCategories(inactive);
    setStockDrafts(
      res.data.reduce((drafts, category) => ({
        ...drafts,
        [category.id]: {
          is_stockable: Boolean(category.is_stockable),
        },
      }), {})
    );
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const stockPayload = (draft) => ({
    is_stockable: Boolean(draft.is_stockable),
  });

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      await api.post("/expense-categories", {
        name: newCategory,
        color: newColor,
        ...stockPayload(newStockDraft),
      });

      setNewCategory("");
      setNewColor("#3B82F6");
      setNewStockDraft(emptyStockDraft);
      loadCategories();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: err.response?.data?.message || "Impossible d'ajouter la categorie",
      });
    }
  };

  const handleSaveColor = async (category) => {
    const color = editingColors[category.id];
    if (!color || color === category.color) return;

    try {
      await api.put(`/expense-categories/${category.id}`, { color });
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveStockConfig = async (category) => {
    const draft = stockDrafts[category.id] || emptyStockDraft;

    try {
      await api.put(`/expense-categories/${category.id}`, stockPayload(draft));
      loadCategories();
      Swal.fire({
        icon: "success",
        title: "Configuration stock enregistree",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible d'enregistrer la configuration stock",
      });
    }
  };

  const handleDisable = async (id) => {
    const confirm = await Swal.fire({
      title: "Desactiver cette categorie ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Annuler",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/expense-categories/${id}`);
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReactivate = async (id) => {
    await api.patch(`/expense-categories/${id}/reactivate`);
    loadCategories();
  };

  const updateStockDraft = (id, field, value) => {
    setStockDrafts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const updateNewStockDraft = (field, value) => {
    setNewStockDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-bold mb-4">
            Gestion des categories de depenses
          </h1>

          <div className="bg-gray-50 border rounded-lg p-4 mb-6">
            <h2 className="text-sm font-semibold mb-3 text-gray-700">
              Ajouter une nouvelle categorie
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-center">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nom de la categorie"
                className="border border-gray-300 rounded-lg px-3 py-2"
              />

              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-12 h-10 border rounded"
              />

              <button
                onClick={handleAddCategory}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={newStockDraft.is_stockable}
                onChange={(e) => updateNewStockDraft("is_stockable", e.target.checked)}
                className="rounded border-gray-300"
              />
              Impacte le stock
            </label>

          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold mb-3">Categories actives</h2>

            <div className="space-y-3 mb-8">
              {activeCategories.map((category) => {
                const draft = stockDrafts[category.id] || emptyStockDraft;

                return (
                  <div key={category.id} className="p-3 bg-white border rounded">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={editingColors[category.id] || category.color || "#3B82F6"}
                          onChange={(e) => setEditingColors((prev) => ({
                            ...prev,
                            [category.id]: e.target.value,
                          }))}
                          className="w-8 h-8 border rounded cursor-pointer"
                        />

                        {editingColors[category.id] && editingColors[category.id] !== category.color && (
                          <button
                            onClick={() => handleSaveColor(category)}
                            className="text-xs bg-primary text-white px-2 py-1 rounded"
                          >
                            OK
                          </button>
                        )}

                        <span>{category.name}</span>
                      </div>

                      <button
                        onClick={() => handleDisable(category.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Desactiver
                      </button>
                    </div>

                    <div className="mt-3 border-t pt-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={Boolean(draft.is_stockable)}
                          onChange={(e) => updateStockDraft(category.id, "is_stockable", e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        Impacte le stock
                      </label>

                      {(draft.is_stockable || category.is_stockable) && (
                        <button
                          onClick={() => handleSaveStockConfig(category)}
                          className="mt-3 bg-primary text-white px-3 py-2 rounded-lg hover:opacity-90"
                        >
                          Enregistrer stock
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <h2 className="text-lg font-semibold mb-3 text-gray-500">
              Categories desactivees
            </h2>

            <div className="space-y-3">
              {inactiveCategories.map((category) => (
                <div key={category.id} className="flex justify-between items-center p-3 bg-gray-100 rounded">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded opacity-50"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-gray-500">{category.name}</span>
                  </div>

                  <button
                    onClick={() => handleReactivate(category.id)}
                    className="text-green-600 hover:text-green-800"
                  >
                    Reactiver
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCategoriesPage;
