"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import {
  Upload,
  FileCheck,
  AlertCircle,
  Clock,
  ChevronRight,
  FileX,
  Pencil,
} from "lucide-react";

interface Source {
  id: number;
  nom: string;
  description: string;
  separateur: string;
  version: number;
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

interface SchemaVersion {
  id: number;
  version: number;
  actif: boolean;
  createdAt: string;
  colonnes: any[];
}

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case "success":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: "#F0FDF4", color: "#16A34A" }}>
          <FileCheck size={11} /> Succès
        </span>
      );
    case "partial":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: "#FFFBEB", color: "#D97706" }}>
          <AlertCircle size={11} /> Partiel
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}>
          <FileX size={11} /> Échec
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: "#EFF6FF", color: "#2563EB" }}>
          <Clock size={11} /> En cours
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: "#F8FAFC", color: "#64748B" }}>
          <Clock size={11} /> En attente
        </span>
      );
  }
};

export default function SourceDetailPage() {
  const params = useParams();
  const [source, setSource] = useState<Source | null>(null);
  const [fichiers, setFichiers] = useState<Fichier[]>([]);
  const [versions, setVersions] = useState<SchemaVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => {
    fetch(`/api/sources/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setSource(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetchFichiers();

    fetch(`/api/sources/${params.id}/schema`)
      .then((res) => res.json())
      .then((data) => setVersions(Array.isArray(data) ? data : []));
  }, [params.id]);

  const fetchFichiers = () => {
    fetch(`/api/fichiers?sourceId=${params.id}`)
      .then((res) => res.json())
      .then((data) => setFichiers(Array.isArray(data) ? data : []));
  };

  const handleUpload = async (file: File) => {
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
      setMessage("Fichier reçu — validation en cours...");
      const interval = setInterval(() => {
        fetchFichiers();
      }, 2000);
      setTimeout(() => clearInterval(interval), 30000);
    } else {
      setMessage(data.error || "Erreur lors de l'upload");
    }

    setUploading(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  if (loading)
    return (
      <AppLayout>
        <div className="p-8 text-gray-400 text-sm">Chargement...</div>
      </AppLayout>
    );

  if (!source)
    return (
      <AppLayout>
        <div className="p-8 text-gray-400 text-sm">Source introuvable</div>
      </AppLayout>
    );

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
            <span className="text-gray-900 font-medium">{source.nom}</span>
          </div>

          {/* Info source */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">{source.nom}</h1>
                <p className="text-sm text-gray-500">{source.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-xs px-3 py-1.5 rounded-lg font-mono"
                  style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}
                >
                  séparateur : {source.separateur === "," ? "virgule (,)" : "point-virgule (;)"}
                </span>
                <span
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: "#EFF6FF", color: "#2563EB" }}
                >
                  {source.colonnes?.length || 0} colonnes
                </span>
                <Link
                  href={`/sources/${params.id}/edit`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={{ borderColor: "#E2E8F0", color: "#374151" }}
                >
                  <Pencil size={12} />
                  Modifier le schéma
                </Link>
              </div>
            </div>
          </div>

          {/* Zone upload */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Uploader un fichier</h2>
            <label
              className="block w-full border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all"
              style={{
                borderColor: isDragging ? "#2563EB" : "#E2E8F0",
                backgroundColor: isDragging ? "#EFF6FF" : "#FAFAFA",
              }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
                disabled={uploading}
              />
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: "#EFF6FF" }}
              >
                <Upload size={22} style={{ color: "#2563EB" }} />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {uploading ? "Upload en cours..." : "Glissez votre fichier ici"}
              </p>
              <p className="text-xs text-gray-400">
                CSV ou Excel · Maximum 10 MB
              </p>
            </label>
            {message && (
              <p
                className="mt-3 text-sm px-4 py-2 rounded-lg"
                style={{ backgroundColor: "#EFF6FF", color: "#2563EB" }}
              >
                {message}
              </p>
            )}
          </div>

          {/* Liste fichiers */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                Fichiers uploadés
              </h2>
            </div>

            {fichiers.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm text-gray-400">Aucun fichier uploadé sur cette source</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {fichiers.map((fichier) => (
                  <div key={fichier.id} className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{fichier.nom}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">
                          {fichier.taille?.toFixed(2)} MB
                        </span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">
                          {new Date(fichier.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                        {fichier.rapport && (
                          <>
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs" style={{ color: "#16A34A" }}>
                              {fichier.rapport.lignesValides} valides
                            </span>
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs" style={{ color: "#DC2626" }}>
                              {fichier.rapport.lignesInvalides} invalides
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatutBadge(fichier.statut)}
                      <Link
                        href={`/fichiers/${fichier.id}`}
                        className="flex items-center gap-1 text-xs font-medium transition-colors"
                        style={{ color: "#2563EB" }}
                      >
                        Rapport
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historique des versions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-6">
            <div
              className="flex items-center justify-between px-6 py-4 cursor-pointer"
              onClick={() => setShowVersions(!showVersions)}
            >
              <h2 className="text-sm font-semibold text-gray-900">
                Historique du schéma
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#EFF6FF", color: "#2563EB" }}
                >
                  v{source.version}
                </span>
                <ChevronRight
                  size={16}
                  className="text-gray-400 transition-transform"
                  style={{ transform: showVersions ? "rotate(90deg)" : "rotate(0deg)" }}
                />
              </div>
            </div>

            {showVersions && (
              <div className="border-t border-gray-100">
                {versions.length === 0 ? (
                  <div className="px-6 py-4 text-sm text-gray-400">
                    Aucune version enregistrée — les versions sont créées quand vous modifiez le schéma.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {versions.map((v) => (
                      <div key={v.id} className="px-6 py-4 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              Version {v.version}
                            </span>
                            {v.actif && (
                              <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: "#F0FDF4", color: "#16A34A" }}
                              >
                                Actuelle
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {v.colonnes.length} colonnes · Créée le{" "}
                            {new Date(v.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}