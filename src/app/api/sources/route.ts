import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const sources = await prisma.source.findMany({
            where: {
                organisationId: (session.user as any).organisationId,
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
        const { nom, description, separateur, formatDate, colonnes } = body;

        const source = await prisma.source.create({
            data: {
                sourceId: nom.toLowerCase().replace(/\s+/g, "-"),
                nom,
                description,
                separateur,
                organisationId: (session.user as any).organisationId,
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
                    })),
                },
            },
            include: { colonnes: true },
        });

        return NextResponse.json(source, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}