"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { Database, Plus, Upload, FileJson, ArrowRight, Files } from "lucide-react";

interface Source {
  id: number;
  nom: string;
  description: string;
  separateur: string;
  createdAt: string;
  _count: { fichiers: number };
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSources();
  }, []);

const fetchSources = () => {
  fetch("/api/sources")
    .then((res) => res.json())
    .then((data) => {
      setSources(Array.isArray(data) ? data : []);
      setLoading(false);
    });
};

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage("");

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await fetch("/api/sources/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      if (res.ok) {
        setMessage("Source importée avec succès !");
        fetchSources();
      } else {
        const data = await res.json();
        setMessage(`Erreur : ${data.error}`);
      }
    } catch (error) {
      setMessage("Fichier JSON invalide");
    }

    setImporting(false);
    e.target.value = "";
  };

  return (
    <AppLayout>
      <div className="p-8" style={{ backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sources</h1>
              <p className="text-sm text-gray-500 mt-1">
                Gérez vos sources de données et leurs schémas de validation
              </p>
            </div>
            <div className="flex gap-3">
              <label
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all border"
                style={{ borderColor: "#E2E8F0", backgroundColor: "#FFFFFF", color: "#374151" }}
              >
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                  disabled={importing}
                />
                <FileJson size={16} />
                {importing ? "Import en cours..." : "Importer JSON"}
              </label>
              <Link
                href="/sources/new"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all"
                style={{ backgroundColor: "#2563EB" }}
              >
                <Plus size={16} />
                Nouvelle source
              </Link>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className="p-4 rounded-lg mb-6 text-sm"
              style={{
                backgroundColor: message.includes("Erreur") ? "#FEF2F2" : "#F0FDF4",
                color: message.includes("Erreur") ? "#DC2626" : "#16A34A",
              }}
            >
              {message}
            </div>
          )}

          {/* Contenu */}
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Chargement...</div>
          ) : sources.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#EFF6FF" }}
              >
                <Database size={24} style={{ color: "#2563EB" }} />
              </div>
              <h3 className="text-gray-900 font-semibold mb-2">Aucune source créée</h3>
              <p className="text-gray-400 text-sm mb-6">
                Créez votre première source ou importez un schéma JSON
              </p>
              <div className="flex gap-3 justify-center">
                <label
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border transition-all"
                  style={{ borderColor: "#E2E8F0", color: "#374151" }}
                >
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                  <Upload size={15} />
                  Importer depuis JSON
                </label>
                <Link
                  href="/sources/new"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: "#2563EB" }}
                >
                  <Plus size={15} />
                  Créer manuellement
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {(sources || []).map((source) => (
                <div
                  key={source.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex justify-between items-center hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#EFF6FF" }}
                    >
                      <Database size={18} style={{ color: "#2563EB" }} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">{source.nom}</h2>
                      <p className="text-xs text-gray-400 mt-0.5">{source.description}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span
                          className="text-xs px-2 py-0.5 rounded font-mono"
                          style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}
                        >
                          sep: {source.separateur === "," ? "virgule" : "point-virgule"}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Files size={11} />
                          {source._count.fichiers} fichier{source._count.fichiers > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/sources/${source.id}`}
                    className="flex items-center gap-1 text-sm font-medium transition-colors"
                    style={{ color: "#2563EB" }}
                  >
                    Ouvrir
                    <ArrowRight size={15} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}