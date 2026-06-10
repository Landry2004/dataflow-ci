import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const organisationId = (session.user as any).organisationId;

        // Total fichiers
        const totalFichiers = await prisma.fichier.count({
            where: { organisationId },
        });

        // Fichiers par statut
        const fichiersParStatut = await prisma.fichier.groupBy({
            by: ["statut"],
            where: { organisationId },
            _count: { statut: true },
        });

        // Sources actives
        const sourcesActives = await prisma.source.count({
            where: { organisationId },
        });

        // Fichiers par source
        const fichiersParSource = await prisma.source.findMany({
            where: { organisationId },
            include: {
                _count: { select: { fichiers: true } },
            },
        });

        // Derniers fichiers
        const derniersFichiers = await prisma.fichier.findMany({
            where: { organisationId },
            include: {
                source: true,
                rapport: true,
            },
            orderBy: { createdAt: "desc" },
            take: 5,
        });

        // Taux de succès
        const succes = fichiersParStatut.find((f: any) => f.statut === "success")?._count.statut || 0;
        const partial = fichiersParStatut.find((f: any) => f.statut === "partial")?._count.statut || 0;
        const failed = fichiersParStatut.find((f: any) => f.statut === "failed")?._count.statut || 0;
        const tauxSucces = totalFichiers > 0 ? Math.round(((succes + partial) / totalFichiers) * 100) : 0;

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
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}