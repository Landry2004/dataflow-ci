-- CreateTable
CREATE TABLE "Organisation" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'client',
    "organisationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" SERIAL NOT NULL,
    "sourceId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "owner" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "frequence" TEXT,
    "formatFichier" TEXT NOT NULL DEFAULT 'csv',
    "separateur" TEXT NOT NULL DEFAULT ',',
    "encodage" TEXT NOT NULL DEFAULT 'utf-8',
    "hasHeader" BOOLEAN NOT NULL DEFAULT true,
    "organisationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemaColonne" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "obligatoire" BOOLEAN NOT NULL DEFAULT true,
    "formatDate" TEXT,
    "valeurMin" DOUBLE PRECISION,
    "valeurMax" DOUBLE PRECISION,
    "longueurMin" INTEGER,
    "longueurMax" INTEGER,
    "valeursAutorisees" TEXT[],
    "formatRegex" TEXT,
    "pasDansLeFutur" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "sourceId" INTEGER NOT NULL,

    CONSTRAINT "SchemaColonne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContrainteLigne" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "colonnes" TEXT[],
    "type" TEXT NOT NULL,
    "sourceId" INTEGER NOT NULL,

    CONSTRAINT "ContrainteLigne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fichier" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "taille" DOUBLE PRECISION,
    "cheminStockage" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'pending',
    "sourceId" INTEGER NOT NULL,
    "organisationId" INTEGER NOT NULL,
    "uploadePar" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fichier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rapport" (
    "id" SERIAL NOT NULL,
    "totalLignes" INTEGER NOT NULL DEFAULT 0,
    "lignesValides" INTEGER NOT NULL DEFAULT 0,
    "lignesInvalides" INTEGER NOT NULL DEFAULT 0,
    "fichierId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rapport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Erreur" (
    "id" SERIAL NOT NULL,
    "numeroLigne" INTEGER NOT NULL,
    "colonne" TEXT NOT NULL,
    "valeurRecue" TEXT,
    "raison" TEXT NOT NULL,
    "rapportId" INTEGER NOT NULL,

    CONSTRAINT "Erreur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "lue" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "fichierId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "organisationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_email_key" ON "Organisation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Source_sourceId_key" ON "Source"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Rapport_fichierId_key" ON "Rapport"("fichierId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaColonne" ADD CONSTRAINT "SchemaColonne_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContrainteLigne" ADD CONSTRAINT "ContrainteLigne_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fichier" ADD CONSTRAINT "Fichier_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fichier" ADD CONSTRAINT "Fichier_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rapport" ADD CONSTRAINT "Rapport_fichierId_fkey" FOREIGN KEY ("fichierId") REFERENCES "Fichier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Erreur" ADD CONSTRAINT "Erreur_rapportId_fkey" FOREIGN KEY ("rapportId") REFERENCES "Rapport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_fichierId_fkey" FOREIGN KEY ("fichierId") REFERENCES "Fichier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
