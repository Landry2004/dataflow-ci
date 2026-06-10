import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validerFichierCSV } from "@/lib/validation/validator";

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

    // Vérifier la taille (10MB max)
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
      where: { schemaVersionId: null }
    }
  },
});
    if (!source) {
      return NextResponse.json({ error: "Source introuvable" }, { status: 404 });
    }

    // Créer le fichier en base avec statut "pending"
    const fichier = await prisma.fichier.create({
      data: {
        nom: file.name,
        taille: file.size / 1024 / 1024,
        statut: "pending",
        sourceId: source.id,
        organisationId: (session.user as any).organisationId,
        uploadePar: Number((session.user as any).id),
      },
    });

    // Lancer la validation en arrière-plan
    validerEnArrierePlan(fichier.id, file, source);

    return NextResponse.json({
      message: "Fichier reçu, validation en cours...",
      fichierId: fichier.id,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

async function validerEnArrierePlan(
  fichierId: number,
  file: File,
  source: any
) {
  try {
    // Mettre le statut en "processing"
    await prisma.fichier.update({
      where: { id: fichierId },
      data: { statut: "processing" },
    });

    // Lire le contenu du fichier
    const contenuBrut = await file.text();
    console.log("Séparateur utilisé:", source.separateur);
    console.log("Premières lignes:", contenuBrut.substring(0, 200));

    // Nettoyer le contenu
    const contenu = contenuBrut.replace(/\0/g, "");

    // Sauvegarder le contenu
    await prisma.fichier.update({
      where: { id: fichierId },
      data: { contenu },
    });

    // Récupérer la version active du schéma
    const versionActive = await prisma.schemaVersion.findFirst({
      where: { sourceId: source.id, actif: true },
      include: { colonnes: true },
      orderBy: { version: "desc" },
    });

    // Utiliser les colonnes de la version active ou les colonnes originales
    const colonnesActives = versionActive?.colonnes?.length > 0
      ? versionActive.colonnes
      : source.colonnes;

    // Valider le fichier
    const resultat = validerFichierCSV(contenu, colonnesActives, source.separateur);

    // Déterminer le statut final
    let statut = "success";
    if (resultat.lignesInvalides > 0 && resultat.lignesValides === 0) {
      statut = "failed";
    } else if (resultat.lignesInvalides > 0) {
      statut = "partial";
    }

    // Créer le rapport
    const rapport = await prisma.rapport.create({
      data: {
        totalLignes: resultat.totalLignes,
        lignesValides: resultat.lignesValides,
        lignesInvalides: resultat.lignesInvalides,
        fichierId,
      },
    });

    // Créer les erreurs
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
        schemaVersionId: versionActive?.id || null,
      },
    });

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
        organisationId: (session.user as any).organisationId,
        ...(sourceId ? { sourceId: Number(sourceId) } : {}),
      },
      include: {
        rapport: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(fichiers);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}