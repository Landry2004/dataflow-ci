"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

  useEffect(() => {
    fetch("/api/sources")
      .then((res) => res.json())
      .then((data) => {
        setSources(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sources</h1>
            <p className="text-gray-500">Gérez vos sources de données</p>
          </div>
          <Link
            href="/sources/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            + Nouvelle source
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Chargement...</p>
        ) : sources.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-gray-500 mb-4">Aucune source créée</p>
            <Link
              href="/sources/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Créer votre première source
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {sources.map((source) => (
              <div
                key={source.id}
                className="bg-white rounded-lg border p-6 flex justify-between items-center"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {source.nom}
                  </h2>
                  <p className="text-gray-500 text-sm">{source.description}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Séparateur : {source.separateur} · {source._count.fichiers} fichiers
                  </p>
                </div>
                <Link
                  href={`/sources/${source.id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Voir →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}