-- AlterTable
ALTER TABLE "Fichier" ADD COLUMN     "schemaVersionId" INTEGER;

-- AddForeignKey
ALTER TABLE "Fichier" ADD CONSTRAINT "Fichier_schemaVersionId_fkey" FOREIGN KEY ("schemaVersionId") REFERENCES "SchemaVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
