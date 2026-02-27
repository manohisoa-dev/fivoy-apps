import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import Swal from "sweetalert2";

const ExpenseCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const navigate = useNavigate();
  const [newColor, setNewColor] = useState("#3B82F6");
  const debounceRef = useRef(null);
  const [editingColors, setEditingColors] = useState({});

  const [activeCategories, setActiveCategories] = useState([]);
    const [inactiveCategories, setInactiveCategories] = useState([]);

    const loadCategories = async () => {
    const res = await api.get("/expense-categories?with_inactive=1");

    const active = res.data.filter(c => c.is_active);
    const inactive = res.data.filter(c => !c.is_active);

    setActiveCategories(active);
    setInactiveCategories(inactive);
    };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
        await api.post("/expense-categories", {
        name: newCategory,
        color: newColor
        });

        setNewCategory("");
        setNewColor("#3B82F6");
        loadCategories();
    } catch (err) {
        console.error(err);

        Swal.fire({
        icon: "error",
        title: "Erreur",
        text: err.response?.data?.message || "Impossible d'ajouter la catégorie"
        });
    }
  };

  const handleColorChange = (id, color) => {
    // Met à jour localement immédiatement
    setCategories(prev =>
      prev.map(cat =>
        cat.id === id ? { ...cat, color } : cat
      )
    );

    // Debounce API
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        await api.put(`/expense-categories/${id}`, { color });
      } catch (err) {
        console.error(err);
      }
    }, 600);
  };

  const handleDisable = async (id) => {
    const confirm = await Swal.fire({
      title: "Désactiver cette catégorie ?",
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

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4">

        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-bold mb-4">
            Gestion des catégories de dépenses
          </h1>

          <div className="bg-gray-50 border rounded-lg p-4 mb-6">
            <h2 className="text-sm font-semibold mb-3 text-gray-700">
                Ajouter une nouvelle catégorie
            </h2>

            <div className="flex gap-3 items-center">
                <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nom de la catégorie"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                />

                <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-12 h-10 border rounded"
                />

                <button
                onClick={handleAddCategory}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2"
                >
                <Plus className="w-4 h-4" />
                Ajouter
                </button>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold mb-3">Catégories actives</h2>

            <div className="space-y-3 mb-8">
            {activeCategories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-3 bg-white border rounded">
                <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={editingColors[cat.id] || cat.color}
                      onChange={(e) => {
                        const newColor = e.target.value;

                        setEditingColors(prev => ({
                          ...prev,
                          [cat.id]: newColor
                        }));
                      }}
                      className="w-8 h-8 border rounded cursor-pointer"
                    />
                    {editingColors[cat.id] && editingColors[cat.id] !== cat.color && (
                    <button
                      onClick={async () => {
                        const newColor = editingColors[cat.id];

                        try {
                          await api.put(`/expense-categories/${cat.id}`, {
                            color: newColor
                          });

                          // Met à jour categories
                          setCategories(prev =>
                            prev.map(c =>
                              c.id === cat.id ? { ...c, color: newColor } : c
                            )
                          );

                          // ⚠️ IMPORTANT : on garde la nouvelle valeur dans editingColors
                          setEditingColors(prev => ({
                            ...prev,
                            [cat.id]: newColor
                          }));

                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="text-xs bg-primary text-white px-2 py-1 rounded"
                    >
                      💾
                    </button>
                  )}
                    <span>{cat.name}</span>
                </div>

                <button
                    onClick={() => handleDisable(cat.id)}
                    className="text-red-600 hover:text-red-800"
                >
                    Désactiver
                </button>
                </div>
            ))}
            </div>

            <h2 className="text-lg font-semibold mb-3 text-gray-500">
            Catégories désactivées
            </h2>

            <div className="space-y-3">
            {inactiveCategories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-100 rounded">
                <div className="flex items-center gap-3">
                    <div
                    className="w-4 h-4 rounded opacity-50"
                    style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-gray-500">{cat.name}</span>
                </div>

                <button
                    onClick={() => handleReactivate(cat.id)}
                    className="text-green-600 hover:text-green-800"
                >
                    Réactiver
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