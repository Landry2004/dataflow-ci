"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Activity, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F8FAFC" }}>
      {/* Panneau gauche */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ backgroundColor: "#0F1729" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#2563EB" }}
          >
            <Activity size={20} color="white" />
          </div>
          <span className="text-white font-semibold text-lg">DataFlow CI</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Validez vos données.<br />
            <span style={{ color: "#2563EB" }}>Automatiquement.</span>
          </h1>
          <p style={{ color: "#94A3B8" }} className="text-lg">
            Plateforme d'ingestion et de validation de fichiers pour DataFlow CI.
          </p>

          <div className="mt-12 space-y-4">
            {[
              "Validation ligne par ligne en temps réel",
              "Rapports d'erreurs détaillés",
              "Export des données valides",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#2563EB" }}
                />
                <span style={{ color: "#CBD5E1" }} className="text-sm">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: "#475569" }} className="text-sm">
          © 2026 DataFlow CI. Tous droits réservés.
        </p>
      </div>

      {/* Panneau droit */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#0F1729" }}
            >
              <Activity size={16} color="white" />
            </div>
            <span className="font-semibold text-gray-900">DataFlow CI</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connexion
          </h2>
          <p className="text-gray-500 mb-8">
            Accédez à votre espace de gestion des données
          </p>

          {error && (
            <div
              className="p-4 rounded-lg mb-6 text-sm flex items-center gap-2"
              style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}
            >
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ "--tw-ring-color": "#2563EB" } as any}
                  placeholder="vous@dataflow-ci.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50"
              style={{ backgroundColor: "#2563EB" }}
            >
              {loading ? "Connexion en cours..." : (
                <>
                  Se connecter
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}