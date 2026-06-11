import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type StatutGroup = {
  statut: string;
  _count: { statut: number };
};

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const organisationId = session.user.organisationId;

    const totalFichiers = await prisma.fichier.count({
      where: { organisationId },
    });

    const fichiersParStatut = await prisma.fichier.groupBy({
      by: ["statut"],
      where: { organisationId },
      _count: { statut: true },
    });

    const sourcesActives = await prisma.source.count({
      where: { organisationId },
    });

    const fichiersParSource = await prisma.source.findMany({
      where: { organisationId },
      include: {
        _count: { select: { fichiers: true } },
      },
    });

    const derniersFichiers = await prisma.fichier.findMany({
      where: { organisationId },
      include: {
        source: true,
        rapport: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const succes =
      fichiersParStatut.find((f: StatutGroup) => f.statut === "success")
        ?._count.statut || 0;
    const partial =
      fichiersParStatut.find((f: StatutGroup) => f.statut === "partial")
        ?._count.statut || 0;
    const failed =
      fichiersParStatut.find((f: StatutGroup) => f.statut === "failed")
        ?._count.statut || 0;
    const tauxSucces =
      totalFichiers > 0
        ? Math.round(((succes + partial) / totalFichiers) * 100)
        : 0;

    return NextResponse.json({
      totalFichiers,
      sourcesActives,
      tauxSucces,
      fichiersParStatut: [
        { statut: "Succès", count: succes },
        { statut: "Partiel", count: partial },
        { statut: "Échec", count: failed },
      ],
      fichiersParSource: fichiersParSource.map((s) => ({
        nom: s.nom,
        count: s._count.fichiers,
      })),
      derniersFichiers,
    });
  } catch (error) {
    console.error("Erreur GET /api/dashboard:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}