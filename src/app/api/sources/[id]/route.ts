import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

    const source = await prisma.source.findUnique({
      where: { id: Number(id) },
      include: {
        colonnes: {
          where: { schemaVersionId: null }
        },
        schemaVersions: {
          where: { actif: true },
          include: { colonnes: true },
          orderBy: { version: "desc" },
          take: 1,
        }
      },
    });

    if (!source) {
      return NextResponse.json({ error: "Source introuvable" }, { status: 404 });
    }

    // Retourner les colonnes de la version active si elle existe
    const colonnesActives = source.schemaVersions?.[0]?.colonnes?.length > 0
      ? source.schemaVersions[0].colonnes
      : source.colonnes;

    return NextResponse.json({
      ...source,
      colonnes: colonnesActives,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}