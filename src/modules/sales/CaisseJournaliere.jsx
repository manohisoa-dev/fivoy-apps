import React, { useState, useEffect } from 'react';
import { Wallet, Save, Edit2, Check, X } from 'lucide-react';
import { supabase, isSupabaseReady } from "../../lib/supabaseClient";

const CaisseJournaliere = ({ selectedDate, supabase }) => {
  const [caisse, setCaisse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [montant, setMontant] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Charger les données de la caisse pour la date sélectionnée
  useEffect(() => {
    loadCaisse();
  }, [selectedDate]);

  const loadCaisse = async () => {
    if (!selectedDate || !supabase) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('caisse_journaliere')
        .select('*')
        .eq('date', selectedDate)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur chargement caisse:', error);
        return;
      }

      if (data) {
        setCaisse(data);
        setMontant(data.montant_especes.toString());
        setNotes(data.notes || '');
      } else {
        setCaisse(null);
        setMontant('');
        setNotes('');
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedDate || !montant || !supabase) return;

    setSaving(true);
    try {
      const dataToSave = {
        date: selectedDate,
        montant_especes: parseFloat(montant) || 0,
        notes: notes.trim(),
        updated_at: new Date().toISOString()
      };

      let result;
      if (caisse) {
        // Mise à jour
        result = await supabase
          .from('caisse_journaliere')
          .update(dataToSave)
          .eq('id', caisse.id)
          .select()
          .single();
      } else {
        // Création
        result = await supabase
          .from('caisse_journaliere')
          .insert([dataToSave])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Erreur sauvegarde:', result.error);
        alert('Erreur lors de la sauvegarde');
        return;
      }

      setCaisse(result.data);
      setIsEditing(false);
      alert('Caisse sauvegardée avec succès !');
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (caisse) {
      setMontant(caisse.montant_especes.toString());
      setNotes(caisse.notes || '');
    } else {
      setMontant('');
      setNotes('');
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="animate-pulse flex items-center gap-2">
          <Wallet className="w-5 h-5 text-gray-400" />
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-sm p-4 border border-green-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-green-700" />
          <h3 className="font-semibold text-gray-800">Caisse du jour</h3>
        </div>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-green-300 rounded-lg hover:bg-green-50 text-green-700"
          >
            <Edit2 className="w-4 h-4" />
            {caisse ? 'Modifier' : 'Saisir'}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant en caisse (Espèces)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                autoFocus
              />
              <span className="absolute right-3 top-2.5 text-gray-500 text-sm">Ar</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Remarques sur la caisse..."
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !montant}
              className="flex items-center gap-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enregistrement...
                </>
              ) : (
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
          {caisse ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-700">
                  {parseFloat(caisse.montant_especes).toLocaleString('fr-FR')} Ar
                </span>
              </div>
              {caisse.notes && (
                <p className="text-sm text-gray-600 italic">{caisse.notes}</p>
              )}
              <p className="text-xs text-gray-500">
                Dernière mise à jour : {new Date(caisse.updated_at).toLocaleTimeString('fr-FR')}
              </p>
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

export default CaisseJournaliere;