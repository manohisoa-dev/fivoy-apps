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

  const [salesTotal, setSalesTotal] = useState(0);
  const [difference, setDifference] = useState(null);

  const formatAr = (value) => {
    if (value === null || value === undefined) return "0";
    return Number(value).toLocaleString("fr-FR");
  };

  const status =
  difference === null
    ? null
    : difference === 0
    ? "balanced"
    : difference > 0
    ? "surplus"
    : "deficit";

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

      const { cash, sales_total, difference } = response.data;

      setSalesTotal(sales_total || 0);
      setDifference(difference);

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
    <div className="relative overflow-hidden rounded-2xl shadow-lg p-5 border border-green-200 bg-gradient-to-br from-green-50 via-white to-emerald-50 transition-all duration-300">
      {status && (
        <div
          className={`absolute left-0 top-0 h-full w-1 ${
            status === "balanced"
              ? "bg-gray-400"
              : status === "surplus"
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        />
      )}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-green-700" />
          <h3 className="font-semibold text-gray-800">Cash du jour</h3>
        </div>

        {status && !isEditing && (
          <div
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              status === "balanced"
                ? "bg-gray-200 text-gray-700"
                : status === "surplus"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {status === "balanced" && "✔ Caisse équilibrée"}
            {status === "surplus" && "▲ Excédent"}
            {status === "deficit" && "▼ Manque"}
          </div>
        )}
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
              <div className="text-3xl font-extrabold tracking-tight text-green-700">
                {formatAr(cash.cash_amount)} Ar
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total ventes</span>
                  <span className="font-semibold text-gray-800">
                    {formatAr(salesTotal)} Ar
                  </span>
                </div>

                {difference !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Écart</span>
                    <span
                      className={`font-semibold ${
                        difference === 0
                          ? "text-gray-800"
                          : difference > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {difference > 0 ? "+" : ""}
                      {formatAr(difference)} Ar
                    </span>
                  </div>
                )}
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
