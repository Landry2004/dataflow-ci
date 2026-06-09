"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";

interface Source {
  id: number;
  nom: string;
  description: string;
  separateur: string;
  colonnes: any[];
}

interface Fichier {
  id: number;
  nom: string;
  statut: string;
  taille: number;
  createdAt: string;
  rapport?: {
    totalLignes: number;
    lignesValides: number;
    lignesInvalides: number;
  };
}

export default function SourceDetailPage() {
  const params = useParams();
  const [source, setSource] = useState<Source | null>(null);
  const [fichiers, setFichiers] = useState<Fichier[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/sources/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setSource(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetchFichiers();
  }, [params.id]);

  const fetchFichiers = () => {
    fetch(`/api/fichiers?sourceId=${params.id}`)
      .then((res) => res.json())
      .then((data) => setFichiers(data));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sourceId", String(params.id));

    const res = await fetch("/api/fichiers", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Fichier reçu, validation en cours...");
      const interval = setInterval(() => {
        fetchFichiers();
      }, 2000);
      setTimeout(() => clearInterval(interval), 30000);
    } else {
      setMessage(data.error || "Erreur lors de l'upload");
    }

    setUploading(false);
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "success":
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">✅ Succès</span>;
      case "partial":
        return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">⚠️ Partiel</span>;
      case "failed":
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">❌ Échec</span>;
      case "processing":
        return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">🔄 En cours</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">⏳ En attente</span>;
    }
  };

  if (loading) return <AppLayout><div className="p-8">Chargement...</div></AppLayout>;
  if (!source) return <AppLayout><div className="p-8">Source introuvable</div></AppLayout>;

  return (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/sources" className="text-gray-500 hover:text-gray-700">
              Sources
            </Link>
            <span className="text-gray-400">→</span>
            <span className="text-gray-900">{source.nom}</span>
          </div>

          <div className="bg-white rounded-lg border p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{source.nom}</h1>
            <p className="text-gray-500 mb-4">{source.description}</p>
            <p className="text-sm text-gray-400">
              Séparateur : <code className="bg-gray-100 px-1 rounded">{source.separateur}</code> ·{" "}
              {source.colonnes?.length || 0} colonnes
            </p>
          </div>

          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Uploader un fichier</h2>
            <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
              <p className="text-gray-500">
                {uploading
                  ? "Upload en cours..."
                  : "Cliquez ou glissez un fichier CSV ou Excel (max 10MB)"}
              </p>
            </label>
            {message && (
              <p className="mt-3 text-sm text-blue-600">{message}</p>
            )}
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Fichiers uploadés</h2>
            {fichiers.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucun fichier uploadé</p>
            ) : (
              <div className="space-y-3">
                {fichiers.map((fichier) => (
                  <div
                    key={fichier.id}
                    className="flex justify-between items-center border rounded-md p-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{fichier.nom}</p>
                      <p className="text-xs text-gray-400">
                        {fichier.taille?.toFixed(2)} MB ·{" "}
                        {new Date(fichier.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                      {fichier.rapport && (
                        <p className="text-xs text-gray-500 mt-1">
                          {fichier.rapport.totalLignes} lignes ·{" "}
                          <span className="text-green-600">{fichier.rapport.lignesValides} valides</span>
                          {" · "}
                          <span className="text-red-600">{fichier.rapport.lignesInvalides} invalides</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatutBadge(fichier.statut)}
                      <Link
                        href={`/fichiers/${fichier.id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Voir rapport →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}