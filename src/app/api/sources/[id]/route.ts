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
            include: { colonnes: true },
        });

        if (!source) {
            return NextResponse.json({ error: "Source introuvable" }, { status: 404 });
        }

        return NextResponse.json(source);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}