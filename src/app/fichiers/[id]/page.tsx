"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import {
  ChevronRight,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

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
  source: { nom: string; id: number };
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
      });
  }, [id]);

  if (loading)
    return (
      <AppLayout>
        <div className="p-8 text-gray-400 text-sm">Chargement...</div>
      </AppLayout>
    );

  if (!fichier)
    return (
      <AppLayout>
        <div className="p-8 text-gray-400 text-sm">Fichier introuvable</div>
      </AppLayout>
    );

  const tauxValidite = fichier.rapport
    ? Math.round((fichier.rapport.lignesValides / fichier.rapport.totalLignes) * 100)
    : 0;

  return (
    <AppLayout>
      <div className="p-8" style={{ backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
        <div className="max-w-5xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm">
            <Link href="/sources" className="text-gray-400 hover:text-gray-600 transition-colors">
              Sources
            </Link>
            <ChevronRight size={14} className="text-gray-300" />
            <Link
              href={`/sources/${fichier.source?.id}`}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {fichier.source?.nom}
            </Link>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-gray-900 font-medium">{fichier.nom}</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-5 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-400 mb-1">Total lignes</p>
              <p className="text-3xl font-bold text-gray-900">
                {fichier.rapport?.totalLignes || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-400 mb-1">Lignes valides</p>
              <p className="text-3xl font-bold" style={{ color: "#16A34A" }}>
                {fichier.rapport?.lignesValides || 0}
              </p>
              <p className="text-xs mt-1" style={{ color: "#16A34A" }}>
                {tauxValidite}% du total
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-400 mb-1">Lignes invalides</p>
              <p className="text-3xl font-bold" style={{ color: "#DC2626" }}>
                {fichier.rapport?.lignesInvalides || 0}
              </p>
              <p className="text-xs mt-1" style={{ color: "#DC2626" }}>
                {100 - tauxValidite}% du total
              </p>
            </div>
          </div>

  {/* Export */}
{fichier.rapport?.lignesValides > 0 && (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 flex justify-between items-center">
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: "#F0FDF4" }}
      >
        <CheckCircle size={20} style={{ color: "#16A34A" }} />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-900">
          Exporter les lignes valides
        </p>
        <p className="text-xs text-gray-400">
          {fichier.rapport.lignesValides} lignes prêtes à être téléchargées
        </p>
      </div>
    </div>

    <a
      href={`/api/fichiers/${id}/export`}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all"
      style={{ backgroundColor: "#16A34A" }}
      download
    >
      <Download size={15} />
      Télécharger CSV
    </a>
  </div>
)}

          {/* Erreurs */}
          {fichier.rapport?.erreurs?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                <XCircle size={16} style={{ color: "#DC2626" }} />
                <h2 className="text-sm font-semibold text-gray-900">
                  Détail des erreurs
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}
                >
                  {fichier.rapport.erreurs.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "#F8FAFC" }}>
                      <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Ligne</th>
                      <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Colonne</th>
                      <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Valeur reçue</th>
                      <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Raison</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {fichier.rapport.erreurs.map((erreur) => (
                      <tr key={erreur.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3">
                          <span
                            className="text-xs font-mono px-2 py-1 rounded"
                            style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}
                          >
                            L{erreur.numeroLigne}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-sm font-medium" style={{ color: "#DC2626" }}>
                            {erreur.colonne}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-sm font-mono text-gray-600">
                            {erreur.valeurRecue || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-sm text-gray-500">{erreur.raison}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Succès total */}
          {fichier.rapport?.lignesInvalides === 0 && (
            <div
              className="rounded-xl p-8 text-center"
              style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}
            >
              <CheckCircle size={32} className="mx-auto mb-3" style={{ color: "#16A34A" }} />
              <p className="font-semibold" style={{ color: "#15803D" }}>
                Tous les enregistrements sont valides
              </p>
              <p className="text-sm mt-1" style={{ color: "#16A34A" }}>
                Le fichier est conforme au schéma de la source
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}