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
import AppLayout from "@/components/layout/AppLayout";
import { FileCheck, Database, TrendingUp, AlertCircle, Plus } from "lucide-react";

interface DashboardData {
  totalFichiers: number;
  sourcesActives: number;
  tauxSucces: number;
  fichiersParStatut: { statut: string; count: number }[];
  fichiersParSource: { nom: string; count: number }[];
  derniersFichiers: any[];
}

const COLORS = ["#16A34A", "#F59E0B", "#DC2626"];

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}) => (
  <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm text-gray-500">{label}</p>
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case "success":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: "#F0FDF4", color: "#16A34A" }}>
          Succès
        </span>
      );
    case "partial":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: "#FFFBEB", color: "#D97706" }}>
          Partiel
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}>
          Échec
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: "#EFF6FF", color: "#2563EB" }}>
          En cours
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: "#F8FAFC", color: "#64748B" }}>
          En attente
        </span>
      );
  }
};

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

  if (loading)
    return (
      <AppLayout>
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="text-gray-400 text-sm">Chargement...</div>
        </div>
      </AppLayout>
    );

  if (!data)
    return (
      <AppLayout>
        <div className="p-8">Erreur de chargement</div>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="p-8" style={{ backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Vue globale de l'activité d'ingestion
              </p>
            </div>
            <Link
              href="/sources/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all"
              style={{ backgroundColor: "#2563EB" }}
            >
              <Plus size={16} />
              Nouvelle source
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <StatCard
              label="Fichiers traités"
              value={data.totalFichiers}
              icon={FileCheck}
              color="#2563EB"
            />
            <StatCard
              label="Sources actives"
              value={data.sourcesActives}
              icon={Database}
              color="#7C3AED"
            />
            <StatCard
              label="Taux de succès"
              value={`${data.tauxSucces}%`}
              icon={TrendingUp}
              color="#16A34A"
            />
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-6">
                Fichiers par source
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.fichiersParSource} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="nom"
                    tick={{ fontSize: 11, fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} name="Fichiers" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-6">
                Répartition par statut
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                   data={(data.fichiersParStatut || []).filter((f) => f.count > 0)}
                    dataKey="count"
                    nameKey="statut"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {(data.fichiersParStatut || []).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Derniers fichiers */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                Derniers fichiers traités
              </h2>
              <Link
                href="/sources"
                className="text-xs text-blue-600 hover:underline"
              >
                Voir toutes les sources →
              </Link>
            </div>

           {(data.derniersFichiers || []).length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-400">Aucun fichier traité pour le moment</p>
                <Link
                  href="/sources"
                  className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                >
                  Commencer par créer une source
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC" }}>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Fichier</th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Source</th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Statut</th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Lignes</th>
                    <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                 {(data.derniersFichiers || []).map((fichier) => (
                    <tr key={fichier.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{fichier.nom}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{fichier.source?.nom}</span>
                      </td>
                      <td className="px-6 py-4">{getStatutBadge(fichier.statut)}</td>
                      <td className="px-6 py-4">
                        {fichier.rapport ? (
                          <span className="text-sm text-gray-500">
                            <span className="text-green-600 font-medium">{fichier.rapport.lignesValides}</span>
                            {" / "}
                            {fichier.rapport.totalLignes}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400">
                          {new Date(fichier.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}