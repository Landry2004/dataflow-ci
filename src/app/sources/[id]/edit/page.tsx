"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { ChevronRight, Plus, Trash2 } from "lucide-react";

interface Colonne {
  nom: string;
  type: string;
  obligatoire: boolean;
  formatDate?: string;
  valeurMin?: number;
  valeurMax?: number;
  longueurMin?: number;
  longueurMax?: number;
  valeursAutorisees?: string[];
  formatRegex?: string;
  pasDansLeFutur?: boolean;
  description?: string;
}

interface Source {
  id: number;
  nom: string;
  version: number;
  colonnes: Colonne[];
}

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400";

const selectClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function EditSchemaPage() {
  const params = useParams();
  const router = useRouter();
  const [source, setSource] = useState<Source | null>(null);
  const [colonnes, setColonnes] = useState<Colonne[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/sources/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setSource(data);
        setColonnes(data.colonnes || []);
        setLoading(false);
      });
  }, [params.id]);

  const ajouterColonne = () => {
    setColonnes([...colonnes, { nom: "", type: "string", obligatoire: true }]);
  };

  const supprimerColonne = (index: number) => {
    setColonnes(colonnes.filter((_, i) => i !== index));
  };

  const modifierColonne = (index: number, champ: string, valeur: any) => {
    const nouvelles = [...colonnes];
    nouvelles[index] = { ...nouvelles[index], [champ]: valeur };
    setColonnes(nouvelles);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    const res = await fetch(`/api/sources/${params.id}/schema`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colonnes }),
    });

    if (res.ok) {
      setMessage("Nouvelle version créée avec succès !");
      setTimeout(() => router.push(`/sources/${params.id}`), 1500);
    } else {
      setMessage("Erreur lors de la sauvegarde");
    }

    setSaving(false);
  };

  if (loading)
    return (
      <AppLayout>
        <div className="p-8 text-gray-400 text-sm">Chargement...</div>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="p-8" style={{ backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
        <div className="max-w-3xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm">
            <Link href="/sources" className="text-gray-400 hover:text-gray-600">
              Sources
            </Link>
            <ChevronRight size={14} className="text-gray-300" />
            <Link href={`/sources/${params.id}`} className="text-gray-400 hover:text-gray-600">
              {source?.nom}
            </Link>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-gray-900 font-medium">Modifier le schéma</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-xl font-bold text-gray-900">Modifier le schéma</h1>
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: "#FFF7ED", color: "#EA580C" }}
              >
                Créera la version {(source?.version || 0) + 1}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              La version actuelle sera conservée dans l'historique.
            </p>
          </div>

          {message && (
            <div
              className="p-4 rounded-lg mb-6 text-sm font-medium"
              style={{
                backgroundColor: message.includes("Erreur") ? "#FEF2F2" : "#F0FDF4",
                color: message.includes("Erreur") ? "#DC2626" : "#16A34A",
              }}
            >
              {message}
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Colonnes</h2>
              <button
                onClick={ajouterColonne}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-medium"
                style={{ backgroundColor: "#2563EB" }}
              >
                <Plus size={13} />
                Ajouter une colonne
              </button>
            </div>

            <div className="space-y-4">
              {colonnes.map((col, index) => (
                <div
                  key={index}
                  className="border rounded-xl p-4"
                  style={{ borderColor: "#E2E8F0", backgroundColor: "#FAFAFA" }}
                >
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
                      <input
                        type="text"
                        value={col.nom}
                        onChange={(e) => modifierColonne(index, "nom", e.target.value)}
                        className={inputClass}
                        placeholder="ex: montant_fcfa"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                      <select
                        value={col.type}
                        onChange={(e) => modifierColonne(index, "type", e.target.value)}
                        className={selectClass}
                      >
                        <option value="string">Texte</option>
                        <option value="integer">Entier</option>
                        <option value="float">Décimal</option>
                        <option value="date">Date</option>
                        <option value="enum">Enum</option>
                        <option value="boolean">Booléen</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={col.obligatoire}
                        onChange={(e) => modifierColonne(index, "obligatoire", e.target.checked)}
                        className="rounded accent-blue-600"
                      />
                      Obligatoire
                    </label>
                    {col.type === "date" && (
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={col.pasDansLeFutur || false}
                          onChange={(e) => modifierColonne(index, "pasDansLeFutur", e.target.checked)}
                          className="rounded accent-blue-600"
                        />
                        Pas dans le futur
                      </label>
                    )}
                  </div>

                  {col.type === "date" && (
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Format de date</label>
                      <select
                        value={col.formatDate || "YYYY-MM-DD"}
                        onChange={(e) => modifierColonne(index, "formatDate", e.target.value)}
                        className={selectClass}
                      >
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      </select>
                    </div>
                  )}

                  {(col.type === "integer" || col.type === "float") && (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Minimum</label>
                        <input
                          type="number"
                          value={col.valeurMin ?? ""}
                          onChange={(e) => modifierColonne(index, "valeurMin", Number(e.target.value))}
                          className={inputClass}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Maximum</label>
                        <input
                          type="number"
                          value={col.valeurMax ?? ""}
                          onChange={(e) => modifierColonne(index, "valeurMax", Number(e.target.value))}
                          className={inputClass}
                          placeholder="9999"
                        />
                      </div>
                    </div>
                  )}

                  {col.type === "string" && (
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Format regex</label>
                      <input
                        type="text"
                        value={col.formatRegex || ""}
                        onChange={(e) => modifierColonne(index, "formatRegex", e.target.value)}
                        className={`${inputClass} font-mono`}
                        placeholder="ex: ^AG-[A-Z]{3}-\d{4}$"
                      />
                    </div>
                  )}

                  {col.type === "enum" && (
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Valeurs autorisées (séparées par des virgules)
                      </label>
                      <input
                        type="text"
                        value={(col.valeursAutorisees || []).join(",")}
                        onChange={(e) =>
                          modifierColonne(index, "valeursAutorisees", e.target.value.split(",").map((v) => v.trim()))
                        }
                        className={inputClass}
                        placeholder="ex: Abidjan,Bouaké,Daloa"
                      />
                    </div>
                  )}

                  <button
                    onClick={() => supprimerColonne(index)}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors mt-1"
                  >
                    <Trash2 size={12} />
                    Supprimer
                  </button>
                </div>
              ))}

              {colonnes.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-400">
                  Aucune colonne — cliquez sur "Ajouter une colonne" pour commencer.
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: "#2563EB" }}
            >
              {saving ? "Sauvegarde..." : "Créer une nouvelle version"}
            </button>
            <Link
              href={`/sources/${params.id}`}
              className="px-6 py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: "#E2E8F0", color: "#374151" }}
            >
              Annuler
            </Link>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}