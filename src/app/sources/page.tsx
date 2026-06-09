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
    const [importing, setImporting] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchSources();
    }, []);

    const fetchSources = () => {
        fetch("/api/sources")
            .then((res) => res.json())
            .then((data) => {
                setSources(data);
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
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Sources</h1>
                        <p className="text-gray-500">Gérez vos sources de données</p>
                    </div>
                    <div className="flex gap-3">
                        <label className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition cursor-pointer">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImportJSON}
                                className="hidden"
                                disabled={importing}
                            />
                            {importing ? "Import en cours..." : "📥 Importer JSON"}
                        </label>
                        <Link
                            href="/sources/new"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                        >
                            + Nouvelle source
                        </Link>
                    </div>
                </div>

                {message && (
                    <div className={`p-3 rounded mb-4 text-sm ${message.includes("Erreur") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                        {message}
                    </div>
                )}

                {loading ? (
                    <p className="text-gray-500">Chargement...</p>
                ) : sources.length === 0 ? (
                    <div className="bg-white rounded-lg border p-12 text-center">
                        <p className="text-gray-500 mb-4">Aucune source créée</p>
                        <div className="flex gap-3 justify-center">
                            <label className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition cursor-pointer">
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImportJSON}
                                    className="hidden"
                                />
                                📥 Importer depuis JSON
                            </label>
                            <Link
                                href="/sources/new"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                            >
                                Créer manuellement
                            </Link>
                        </div>
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