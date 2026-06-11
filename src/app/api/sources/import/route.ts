import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type ColonneJSON = {
  name: string;
  type: string;
  required?: boolean;
  format?: string;
  min?: number;
  max?: number;
  min_length?: number;
  max_length?: number;
  allowed_values?: string[];
  pattern?: string;
  description?: string;
};

type ContrainteJSON = {
  name: string;
  description?: string;
};

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();

    const source = await prisma.source.create({
      data: {
        sourceId: body.source_id,
        nom: body.source_name,
        description: body.description || "",
        owner: body.owner || "",
        version: body.version || 1,
        frequence: body.expected_frequency || "",
        formatFichier: body.file_format || "csv",
        separateur: body.delimiter || ",",
        encodage: body.encoding || "utf-8",
        hasHeader: body.has_header ?? true,
        organisationId: session.user.organisationId,
        colonnes: {
          create: body.schema.columns.map((col: ColonneJSON) => ({
            nom: col.name,
            type:
              col.type === "enum"
                ? "enum"
                : col.type === "integer"
                ? "integer"
                : col.type === "date"
                ? "date"
                : "string",
            obligatoire: col.required ?? true,
            formatDate: col.format || null,
            valeurMin: col.min ?? null,
            valeurMax: col.max ?? null,
            longueurMin: col.min_length ?? null,
            longueurMax: col.max_length ?? null,
            valeursAutorisees: col.allowed_values || [],
            formatRegex: col.pattern || null,
            pasDansLeFutur:
              col.description?.includes("futur") ||
              col.description?.includes("future") ||
              false,
            description: col.description || null,
          })),
        },
        contraintesLignes: {
          create: (body.schema.row_constraints || []).map(
            (rc: ContrainteJSON) => ({
              nom: rc.name,
              description: rc.description || "",
              colonnes:
                rc.description?.match(/\(([^)]+)\)/)?.[1]?.split(", ") || [],
              type: rc.name.includes("unique") ? "unique" : "date_order",
            })
          ),
        },
      },
      include: { colonnes: true },
    });

    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/sources/import:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}