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

    // Récupérer la source et son schéma
    const source = await prisma.source.findUnique({
      where: { id: Number(sourceId) },
      include: { colonnes: true },
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
const contenu = await file.text();
console.log("Séparateur utilisé:", source.separateur);
console.log("Premières lignes:", contenu.substring(0, 200));

// Sauvegarder le contenu
await prisma.fichier.update({
  where: { id: fichierId },
  data: { contenu },
});

    // Valider le fichier
    const resultat = validerFichierCSV(contenu, source.colonnes, source.separateur);

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

    // Mettre à jour le statut du fichier
    await prisma.fichier.update({
      where: { id: fichierId },
      data: { statut },
    });

  } catch (error) {
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