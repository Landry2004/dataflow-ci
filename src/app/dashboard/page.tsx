import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-8">
          Bienvenue, {session.user?.name}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-500">Fichiers traités</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-500">Sources actives</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-500">Taux de succès</p>
            <p className="text-3xl font-bold text-green-600">0%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-500">Erreurs détectées</p>
            <p className="text-3xl font-bold text-red-600">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}