import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Créer l'organisation DataFlow CI
    const organisation = await prisma.organisation.create({
      data: {
        nom: "DataFlow CI",
        email: "contact@dataflow-ci.com",
      },
    });

    // Créer l'admin
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.create({
      data: {
        nom: "Admin DataFlow",
        email: "admin@dataflow-ci.com",
        motDePasse: hashedPassword,
        role: "admin",
        organisationId: organisation.id,
      },
    });

    return NextResponse.json({
      message: "Données créées avec succès",
      admin: { email: admin.email, password: "admin123" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}