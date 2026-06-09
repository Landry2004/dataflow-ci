"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DashboardData {
  totalFichiers: number;
  sourcesActives: number;
  tauxSucces: number;
  fichiersParStatut: { statut: string; count: number }[];
  fichiersParSource: { nom: string; count: number }[];
  derniersFichiers: any[];
}

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;
  if (!data) return <div className="p-8">Erreur de chargement</div>;

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Vue globale de l'activité DataFlow CI</p>
          </div>
          <Link
            href="/sources"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Gérer les sources
          </Link>
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-500">Fichiers traités</p>
            <p className="text-4xl font-bold text-gray-900">{data.totalFichiers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-500">Sources actives</p>
            <p className="text-4xl font-bold text-blue-600">{data.sourcesActives}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-500">Taux de succès</p>
            <p className="text-4xl font-bold text-green-600">{data.tauxSucces}%</p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Graphique 1 — Fichiers par source */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Fichiers par source</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.fichiersParSource}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nom" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Fichiers" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Graphique 2 — Répartition statuts */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Répartition par statut</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.fichiersParStatut.filter((f) => f.count > 0)}
                  dataKey="count"
                  nameKey="statut"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {data.fichiersParStatut.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Derniers fichiers */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Derniers fichiers traités</h2>
          {data.derniersFichiers.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun fichier traité</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-gray-500">Fichier</th>
                  <th className="text-left py-2 px-3 text-gray-500">Source</th>
                  <th className="text-left py-2 px-3 text-gray-500">Statut</th>
                  <th className="text-left py-2 px-3 text-gray-500">Lignes</th>
                  <th className="text-left py-2 px-3 text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.derniersFichiers.map((fichier) => (
                  <tr key={fichier.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">{fichier.nom}</td>
                    <td className="py-2 px-3 text-gray-500">{fichier.source?.nom}</td>
                    <td className="py-2 px-3">{getStatutBadge(fichier.statut)}</td>
                    <td className="py-2 px-3 text-gray-500">
                      {fichier.rapport ? (
                        <span>
                          <span className="text-green-600">{fichier.rapport.lignesValides}</span>
                          {" / "}
                          {fichier.rapport.totalLignes}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="py-2 px-3 text-gray-400">
                      {new Date(fichier.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}