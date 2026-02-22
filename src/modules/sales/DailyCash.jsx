import React, { useState, useEffect } from "react";
import { Wallet, Edit2, Check, X } from "lucide-react";
import api from "../../api/api";

const DailyCash = ({ selectedDate }) => {
  const [cash, setCash] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [montant, setMontant] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      loadCash();
    }
  }, [selectedDate]);

  const loadCash = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      const response = await api.get("/cash", {
        params: { date: selectedDate }
      });

      const { cash } = response.data;

      if (cash) {
        setCash(cash);
        setMontant(cash.cash_amount.toString());
        setNotes(cash.notes || "");
      } else {
        setCash(null);
        setMontant("");
        setNotes("");
      }

    } catch (err) {
      console.error("Erreur chargement cash:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleSave = async () => {
    if (!selectedDate || !montant) return;

    setSaving(true);

    try {
      const payload = {
        date: selectedDate,
        cash_amount: parseFloat(montant) || 0,
        notes: notes.trim(),
      };

      const response = await api.post("/cash", payload);

      setCash(response.data);
      setIsEditing(false);

    } catch (err) {
      console.error("Erreur sauvegarde cash:", err);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };


  const handleCancel = () => {
    if (cash) {
      setMontant(cash.montant_especes?.toString() || "");
      setNotes(cash.notes || "");
    } else {
      setMontant("");
      setNotes("");
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        Chargement...
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-sm p-4 border border-green-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-green-700" />
          <h3 className="font-semibold text-gray-800">Cash du jour</h3>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-green-300 rounded-lg hover:bg-green-50 text-green-700"
          >
            <Edit2 className="w-4 h-4" />
            {cash ? "Modifier" : "Saisir"}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant en cash (Espèces)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <span className="absolute right-3 top-2.5 text-gray-500 text-sm">
                Ar
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !montant}
              className="flex items-center gap-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : (
                <>
                  <Check className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {cash ? (
            <>
              <div className="text-2xl font-bold text-green-700">
                {parseFloat(cash.cash_amount).toLocaleString("fr-FR")} Ar
              </div>
              {cash.notes && (
                <p className="text-sm text-gray-600 italic">
                  {cash.notes}
                </p>
              )}
            </>
          ) : (
            <div className="text-gray-500 text-sm py-2">
              Aucun montant saisi pour cette date
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyCash;
