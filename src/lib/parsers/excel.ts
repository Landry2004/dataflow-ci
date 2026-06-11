import * as XLSX from "xlsx";

export function parseExcel(buffer: ArrayBuffer, separateur: string = ","): string {
  const workbook = XLSX.read(buffer, { type: "array" });
  const premiereFeuille = workbook.SheetNames[0];
  const feuille = workbook.Sheets[premiereFeuille];
  return XLSX.utils.sheet_to_csv(feuille, { FS: separateur });
}