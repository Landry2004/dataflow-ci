import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validerFichierCSV, RegleColonne } from "@/lib/validation/validator";
import { parseExcel } from "@/lib/parsers/excel";
import type { Source, SchemaColonne } from "@prisma/client";

type SourceAvecColonnes = Source & {
  colonnes: SchemaColonne[];
};

// Convertit une SchemaColonne Prisma (null) en RegleColonne (undefined)
const mapColonne = (c: SchemaColonne): RegleColonne => ({
  nom: c.nom,
  type: c.type,
  obligatoire: c.obligatoire,
  formatDate: c.formatDate ?? undefined,
  valeurMin: c.valeurMin ?? undefined,
  valeurMax: c.valeurMax ?? undefined,
  longueurMin: c.longueurMin ?? undefined,
  longueurMax: c.longueurMax ?? undefined,
  valeursAutorisees: c.valeursAutorisees,
  formatRegex: c.formatRegex ?? undefined,
  pasDansLeFutur: c.pasDansLeFutur,
});

const isExcel = (file: File): boolean =>
  file.name.endsWith(".xlsx") ||
  file.name.endsWith(".xls") ||
  file.type ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const sourceId = formData.get("sourceId") as string;

    if (!file || !sourceId) {
      return NextResponse.json(
        { error: "Fichier et source obligatoires" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 10MB)" },
        { status: 400 }
      );
    }

    const source = await prisma.source.findUnique({
      where: { id: Number(sourceId) },
      include: {
        colonnes: {
          where: { schemaVersionId: null },
        },
      },
    });

    if (!source) {
      return NextResponse.json(
        { error: "Source introuvable" },
        { status: 404 }
      );
    }

    const fichier = await prisma.fichier.create({
      data: {
        nom: file.name,
        taille: file.size / 1024 / 1024,
        statut: "pending",
        sourceId: source.id,
        organisationId: (session.user as { organisationId: number })
          .organisationId,
        uploadePar: Number((session.user as { id: string }).id),
      },
    });

    validerEnArrierePlan(fichier.id, file, source);

    return NextResponse.json({
      message: "Fichier reçu, validation en cours...",
      fichierId: fichier.id,
    });
  } catch (error) {
    console.error("Erreur POST /api/fichiers:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

async function validerEnArrierePlan(
  fichierId: number,
  file: File,
  source: SourceAvecColonnes
) {
  try {
    await prisma.fichier.update({
      where: { id: fichierId },
      data: { statut: "processing" },
    });

    // Lire le contenu selon le type de fichier
    let contenuBrut: string;
    if (isExcel(file)) {
      const buffer = await file.arrayBuffer();
     contenuBrut = parseExcel(buffer, source.separateur);
    } else {
      contenuBrut = await file.text();
    }

    console.log("Séparateur utilisé:", source.separateur);
    console.log("Premières lignes:", contenuBrut.substring(0, 200));

    const contenu = contenuBrut.replace(/\0/g, "");

    await prisma.fichier.update({
      where: { id: fichierId },
      data: { contenu },
    });

    const versionActive = await prisma.schemaVersion.findFirst({
      where: { sourceId: source.id, actif: true },
      include: { colonnes: true },
      orderBy: { version: "desc" },
    });

    const colonnesActives: RegleColonne[] =
      versionActive?.colonnes && versionActive.colonnes.length > 0
        ? versionActive.colonnes.map(mapColonne)
        : source.colonnes.map(mapColonne);

    const resultat = validerFichierCSV(
      contenu,
      colonnesActives,
      source.separateur
    );

    let statut = "success";
    if (resultat.lignesInvalides > 0 && resultat.lignesValides === 0) {
      statut = "failed";
    } else if (resultat.lignesInvalides > 0) {
      statut = "partial";
    }

    const rapport = await prisma.rapport.create({
      data: {
        totalLignes: resultat.totalLignes,
        lignesValides: resultat.lignesValides,
        lignesInvalides: resultat.lignesInvalides,
        fichierId,
      },
    });

    if (resultat.erreurs.length > 0) {
      await prisma.erreur.createMany({
        data: resultat.erreurs.map((e) => ({
          numeroLigne: e.numeroLigne,
          colonne: e.colonne,
          valeurRecue: e.valeurRecue,
          raison: e.raison,
          rapportId: rapport.id,
        })),
      });
    }

    // Mettre à jour le statut et lier à la version du schéma
    await prisma.fichier.update({
      where: { id: fichierId },
      data: {
        statut,
        schemaVersionId: versionActive?.id ?? null,
      },
    });

    // Créer la notification
    const fichierInfo = await prisma.fichier.findUnique({
      where: { id: fichierId },
      select: { nom: true, uploadePar: true },
    });

    if (fichierInfo) {
      const messageStatut =
        statut === "success"
          ? `✅ "${fichierInfo.nom}" — ${resultat.lignesValides} lignes valides`
          : statut === "partial"
          ? `⚠️ "${fichierInfo.nom}" — ${resultat.lignesValides} valides, ${resultat.lignesInvalides} invalides`
          : `❌ "${fichierInfo.nom}" — validation échouée`;

      await prisma.notification.create({
        data: {
          message: messageStatut,
          lue: false,
          userId: fichierInfo.uploadePar,
          fichierId,
        },
      });
    }
  } catch (error) {
    console.error("Erreur validation:", error);
    await prisma.fichier.update({
      where: { id: fichierId },
      data: { statut: "failed" },
    });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get("sourceId");

    const fichiers = await prisma.fichier.findMany({
      where: {
        organisationId: (session.user as { organisationId: number })
          .organisationId,
        ...(sourceId ? { sourceId: Number(sourceId) } : {}),
      },
      include: {
        rapport: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(fichiers);
  } catch (error) {
    console.error("Erreur GET /api/fichiers:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}