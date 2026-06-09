"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";

interface Rapport {
  id: number;
  totalLignes: number;
  lignesValides: number;
  lignesInvalides: number;
  erreurs: {
    id: number;
    numeroLigne: number;
    colonne: string;
    valeurRecue: string;
    raison: string;
  }[];
}

interface Fichier {
  id: number;
  nom: string;
  statut: string;
  taille: number;
  createdAt: string;
  source: {
    nom: string;
    id: number;
  };
  rapport: Rapport;
}

export default function RapportPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [fichier, setFichier] = useState<Fichier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/fichiers/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setFichier(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8">Chargement...</div>
      </AppLayout>
    );
  }

  if (!fichier) {
    return (
      <AppLayout>
        <div className="p-8">Fichier introuvable</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          {/* Fil d'Ariane */}
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/sources"
              className="text-gray-500 hover:text-gray-700"
            >
              Sources
            </Link>

            <span className="text-gray-400">→</span>

            <Link
              href={`/sources/${fichier.source?.id}`}
              className="text-gray-500 hover:text-gray-700"
            >
              {fichier.source?.nom}
            </Link>

            <span className="text-gray-400">→</span>

            <span className="text-gray-900">{fichier.nom}</span>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4 text-center">
              <p className="text-sm text-gray-500">Total lignes</p>
              <p className="text-3xl font-bold text-gray-900">
                {fichier.rapport?.totalLignes || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg border p-4 text-center">
              <p className="text-sm text-gray-500">Lignes valides</p>
              <p className="text-3xl font-bold text-green-600">
                {fichier.rapport?.lignesValides || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg border p-4 text-center">
              <p className="text-sm text-gray-500">Lignes invalides</p>
              <p className="text-3xl font-bold text-red-600">
                {fichier.rapport?.lignesInvalides || 0}
              </p>
            </div>
          </div>

          {/* Export CSV */}
          {fichier.rapport?.lignesValides > 0 && (
            <div className="bg-white rounded-lg border p-4 mb-6 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">
                  Télécharger les lignes valides
                </p>

                <p className="text-sm text-gray-500">
                  {fichier.rapport.lignesValides} lignes prêtes à être exportées
                </p>
              </div>

              <a
                href={`/api/fichiers/${id}/export`}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                download
              >
                ⬇️ Exporter CSV
              </a>
            </div>
          )}

          {/* Tableau des erreurs */}
          {fichier.rapport?.erreurs?.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">
                Détail des erreurs ({fichier.rapport.erreurs.length})
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 text-gray-500">
                        Ligne
                      </th>
                      <th className="text-left py-2 px-3 text-gray-500">
                        Colonne
                      </th>
                      <th className="text-left py-2 px-3 text-gray-500">
                        Valeur reçue
                      </th>
                      <th className="text-left py-2 px-3 text-gray-500">
                        Raison
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {fichier.rapport.erreurs.map((erreur) => (
                      <tr
                        key={erreur.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-2 px-3 text-gray-600">
                          {erreur.numeroLigne}
                        </td>

                        <td className="py-2 px-3 font-medium text-red-600">
                          {erreur.colonne}
                        </td>

                        <td className="py-2 px-3 text-gray-600">
                          {erreur.valeurRecue}
                        </td>

                        <td className="py-2 px-3 text-gray-500">
                          {erreur.raison}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Aucun erreur */}
          {fichier.rapport?.lignesInvalides === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-green-700 font-medium">
                ✅ Tous les enregistrements sont valides !
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}