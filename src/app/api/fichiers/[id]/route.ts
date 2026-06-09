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

    const fichier = await prisma.fichier.findUnique({
      where: { id: Number(id) },
      include: {
        source: true,
        rapport: {
          include: {
            erreurs: {
              orderBy: { numeroLigne: "asc" },
            },
          },
        },
      },
    });

    if (!fichier) {
      return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
    }

    return NextResponse.json(fichier);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}