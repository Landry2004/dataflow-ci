import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Récupérer toutes les versions du schéma
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

    const versions = await prisma.schemaVersion.findMany({
      where: { sourceId: Number(id) },
      include: { colonnes: true },
      orderBy: { version: "desc" },
    });

    return NextResponse.json(versions);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// Créer une nouvelle version du schéma
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { colonnes } = body;

    // Désactiver la version actuelle
    await prisma.schemaVersion.updateMany({
      where: { sourceId: Number(id), actif: true },
      data: { actif: false },
    });

    // Récupérer le numéro de la dernière version
    const derniereVersion = await prisma.schemaVersion.findFirst({
      where: { sourceId: Number(id) },
      orderBy: { version: "desc" },
    });

    const nouvelleVersion = (derniereVersion?.version || 0) + 1;

    // Créer la nouvelle version
    const schemaVersion = await prisma.schemaVersion.create({
      data: {
        version: nouvelleVersion,
        actif: true,
        sourceId: Number(id),
        colonnes: {
          create: colonnes.map((col: any) => ({
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
            sourceId: Number(id),
          })),
        },
      },
      include: { colonnes: true },
    });

    // Mettre à jour la version dans Source
    await prisma.source.update({
      where: { id: Number(id) },
      data: { version: nouvelleVersion },
    });

    return NextResponse.json(schemaVersion, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}