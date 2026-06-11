import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Papa from "papaparse";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const fichier = await prisma.fichier.findUnique({
      where: { id: Number(id) },
      include: {
        source: true,
        rapport: {
          include: { erreurs: true },
        },
      },
    });

    if (!fichier || !fichier.contenu) {
      return NextResponse.json(
        { error: "Fichier introuvable" },
        { status: 404 }
      );
    }

    const lignesInvalides = new Set(
      fichier.rapport?.erreurs.map((e) => e.numeroLigne) || []
    );

    const result = Papa.parse<Record<string, string>>(fichier.contenu, {
      header: true,
      delimiter: fichier.source.separateur,
      skipEmptyLines: true,
    });

    const lignesValides = result.data.filter(
      (_, index) => !lignesInvalides.has(index + 2)
    );

    const csvValide = Papa.unparse(lignesValides);

    return new NextResponse(csvValide, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="valides-${fichier.nom}"`,
      },
    });
  } catch (error) {
    console.error("Erreur GET /api/fichiers/[id]/export:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}