import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface RegleColonne {
  nom: string;
  type: string;
  obligatoire: boolean;
  formatDate?: string;
  valeurMin?: number;
  valeurMax?: number;
  longueurMin?: number;
  longueurMax?: number;
  valeursAutorisees?: string[];
  formatRegex?: string;
  pasDansLeFutur?: boolean;
}

export interface ResultatValidation {
  totalLignes: number;
  lignesValides: number;
  lignesInvalides: number;
  erreurs: ErreurLigne[];
  lignesValidesData: any[];
}

export interface ErreurLigne {
  numeroLigne: number;
  colonne: string;
  valeurRecue: string;
  raison: string;
}

function validerValeur(
  valeur: any,
  regle: RegleColonne
): { valide: boolean; raison?: string } {
  // Vérifier si obligatoire
  if (regle.obligatoire && (valeur === null || valeur === undefined || valeur === "")) {
    return { valide: false, raison: "Valeur obligatoire manquante" };
  }

  // Si vide et optionnel → ok
  if (!regle.obligatoire && (valeur === null || valeur === undefined || valeur === "")) {
    return { valide: true };
  }

  const valeurStr = String(valeur).trim();

switch (regle.type) {
    case "integer": {
      const num = Number(valeurStr);
      if (!Number.isInteger(num)) {
        return { valide: false, raison: `Valeur "${valeurStr}" n'est pas un entier` };
      }
      if (regle.valeurMin !== undefined && regle.valeurMin !== null && num < regle.valeurMin) {
        return { valide: false, raison: `Valeur ${num} inférieure au minimum ${regle.valeurMin}` };
      }
      if (regle.valeurMax !== undefined && regle.valeurMax !== null && num > regle.valeurMax) {
        return { valide: false, raison: `Valeur ${num} supérieure au maximum ${regle.valeurMax}` };
      }
      break;
    }

    case "float": {
      const num = Number(valeurStr);
      if (isNaN(num)) {
        return { valide: false, raison: `Valeur "${valeurStr}" n'est pas un nombre` };
      }
      if (regle.valeurMin !== undefined && regle.valeurMin !== null && num < regle.valeurMin) {
        return { valide: false, raison: `Valeur ${num} inférieure au minimum ${regle.valeurMin}` };
      }
      if (regle.valeurMax !== undefined && regle.valeurMax !== null && num > regle.valeurMax) {
        return { valide: false, raison: `Valeur ${num} supérieure au maximum ${regle.valeurMax}` };
      }
      break;
    }

    case "date": {
      let date: Date | null = null;

      if (regle.formatDate === "DD/MM/YYYY") {
        const parts = valeurStr.split("/");
        if (parts.length === 3) {
          date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      } else {
        date = new Date(valeurStr);
      }

      if (!date || isNaN(date.getTime())) {
        return { valide: false, raison: `Date "${valeurStr}" invalide` };
      }

      if (regle.pasDansLeFutur && date > new Date()) {
        return { valide: false, raison: `Date "${valeurStr}" ne peut pas être dans le futur` };
      }
      break;
    }

    case "enum": {
      if (regle.valeursAutorisees && regle.valeursAutorisees.length > 0 && !regle.valeursAutorisees.includes(valeurStr)) {
        return {
          valide: false,
          raison: `Valeur "${valeurStr}" non autorisée. Valeurs acceptées: ${regle.valeursAutorisees.join(", ")}`,
        };
      }
      break;
    }

    case "string":
    default: {
      if (regle.longueurMin && valeurStr.length < regle.longueurMin) {
        return { valide: false, raison: `Longueur ${valeurStr.length} inférieure au minimum ${regle.longueurMin}` };
      }
      if (regle.longueurMax && valeurStr.length > regle.longueurMax) {
        return { valide: false, raison: `Longueur ${valeurStr.length} supérieure au maximum ${regle.longueurMax}` };
      }
      if (regle.formatRegex) {
        const regex = new RegExp(regle.formatRegex);
        if (!regex.test(valeurStr)) {
          return { valide: false, raison: `Valeur "${valeurStr}" ne correspond pas au format attendu` };
        }
      }
      break;
    }
  }
  return { valide: true };
}

export function validerFichierCSV(
  contenu: string,
  colonnes: RegleColonne[],
  separateur: string
): ResultatValidation {
  const result = Papa.parse(contenu, {
    header: true,
    delimiter: separateur,
    skipEmptyLines: true,
  });

  const lignes = result.data as any[];
  const erreurs: ErreurLigne[] = [];
  const lignesValidesData: any[] = [];

  lignes.forEach((ligne, index) => {
    const numeroLigne = index + 2;
    let ligneValide = true;

    for (const regle of colonnes) {
      const valeur = ligne[regle.nom];
      const { valide, raison } = validerValeur(valeur, regle);

      if (!valide) {
        erreurs.push({
          numeroLigne,
          colonne: regle.nom,
          valeurRecue: String(valeur ?? ""),
          raison: raison || "Erreur inconnue",
        });
        ligneValide = false;
      }
    }

    if (ligneValide) {
      lignesValidesData.push(ligne);
    }
  });

  return {
    totalLignes: lignes.length,
    lignesValides: lignesValidesData.length,
    lignesInvalides: erreurs.length > 0 ? lignes.length - lignesValidesData.length : 0,
    erreurs,
    lignesValidesData,
  };
}