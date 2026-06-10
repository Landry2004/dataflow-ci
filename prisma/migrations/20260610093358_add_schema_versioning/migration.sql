-- AlterTable
ALTER TABLE "SchemaColonne" ADD COLUMN     "schemaVersionId" INTEGER;

-- CreateTable
CREATE TABLE "SchemaVersion" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "sourceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchemaVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SchemaColonne" ADD CONSTRAINT "SchemaColonne_schemaVersionId_fkey" FOREIGN KEY ("schemaVersionId") REFERENCES "SchemaVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaVersion" ADD CONSTRAINT "SchemaVersion_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
