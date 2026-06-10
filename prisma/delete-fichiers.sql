DELETE FROM "Erreur" WHERE "rapportId" IN (SELECT id FROM "Rapport" WHERE "fichierId" IN (23, 24, 25));
DELETE FROM "Rapport" WHERE "fichierId" IN (23, 24, 25);
DELETE FROM "Fichier" WHERE id IN (23, 24, 25);