"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";

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

export default function NewSourcePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [separateur, setSeparateur] = useState(",");
  const [colonnes, setColonnes] = useState<Colonne[]>([]);

  const ajouterColonne = () => {
    setColonnes([
      ...colonnes,
      {
        nom: "",
        type: "string",
        obligatoire: true,
      },
    ]);
  };

  const supprimerColonne = (index: number) => {
    setColonnes(colonnes.filter((_, i) => i !== index));
  };

  const modifierColonne = (index: number, champ: string, valeur: any) => {
    const nouvelles = [...colonnes];
    nouvelles[index] = {
      ...nouvelles[index],
      [champ]: valeur,
    };
    setColonnes(nouvelles);
  };

  const handleSubmit = async () => {
    if (!nom) {
      setError("Le nom est obligatoire");
      return;
    }

    if (colonnes.length === 0) {
      setError("Ajoutez au moins une colonne");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/sources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nom,
        description,
        separateur,
        colonnes,
      }),
    });

    if (res.ok) {
      router.push("/sources");
    } else {
      setError("Erreur lors de la création");
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto text-gray-900">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nouvelle source
          </h1>

          <p className="text-gray-500 mb-8">
            Définissez votre source et son schéma de validation
          </p>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Informations générales */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations générales
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la source *
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Ventes Orange CI - Hebdo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Description de la source"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Séparateur CSV
                </label>
                <select
                  value={separateur}
                  onChange={(e) => setSeparateur(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value=",">Virgule (,)</option>
                  <option value=";">Point-virgule (;)</option>
                  <option value="|">Pipe (|)</option>
                  <option value="\t">Tabulation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Schéma */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Colonnes du schéma
              </h2>
              <button
                onClick={ajouterColonne}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                + Ajouter une colonne
              </button>
            </div>

            {colonnes.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                Aucune colonne — cliquez sur "Ajouter une colonne"
              </p>
            ) : (
              <div className="space-y-4">
                {colonnes.map((col, index) => (
                  <div
                    key={index}
                    className="border rounded-md p-4 bg-gray-50"
                  >
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom de la colonne
                        </label>
                        <input
                          type="text"
                          value={col.nom}
                          onChange={(e) =>
                            modifierColonne(index, "nom", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: date_vente"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={col.type}
                          onChange={(e) =>
                            modifierColonne(index, "type", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="string">Texte (string)</option>
                          <option value="number">Nombre (number)</option>
                          <option value="date">Date</option>
                          <option value="boolean">Booléen</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        id={`obligatoire-${index}`}
                        checked={col.obligatoire}
                        onChange={(e) =>
                          modifierColonne(index, "obligatoire", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <label
                        htmlFor={`obligatoire-${index}`}
                        className="text-sm text-gray-700"
                      >
                        Champ obligatoire
                      </label>
                    </div>

                    <button
                      onClick={() => supprimerColonne(index)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Supprimer cette colonne
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "Création..." : "Créer la source"}
            </button>

            <button
              onClick={() => router.push("/sources")}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}