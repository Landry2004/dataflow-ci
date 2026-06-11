import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type ColonneInput = {
  nom: string;
  type: string;
  obligatoire: boolean;
  formatDate?: string;
  valeurMin?: number;
  valeurMax?: number;
  longueurMin?: number;
  longueurMax?: number;
  valeursAutorisees?: string[];
  formatRegex?: string;
  pasDansLeFutur?: boolean;
  description?: string;
};

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const sources = await prisma.source.findMany({
      where: {
        organisationId: session.user.organisationId,
      },
      include: {
        colonnes: true,
        _count: {
          select: { fichiers: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sources);
  } catch (error) {
    console.error("Erreur GET /api/sources:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { nom, description, separateur, colonnes } = body;

    const source = await prisma.source.create({
      data: {
        sourceId: nom.toLowerCase().replace(/\s+/g, "-"),
        nom,
        description,
        separateur,
        organisationId: session.user.organisationId,
        colonnes: {
          create: colonnes.map((col: ColonneInput) => ({
            nom: col.nom,
            type: col.type,
            obligatoire: col.obligatoire,
            formatDate: col.formatDate,
            valeurMin: col.valeurMin,
            valeurMax: col.valeurMax,
            longueurMin: col.longueurMin,
            longueurMax: col.longueurMax,
            valeursAutorisees: col.valeursAutorisees || [],
            formatRegex: col.formatRegex,
            pasDansLeFutur: col.pasDansLeFutur || false,
            description: col.description,
          })),
        },
      },
      include: { colonnes: true },
    });

    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/sources:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}