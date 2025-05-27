import { format as dateFnsFormat } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Fonction de formatage de date sécurisée qui gère les cas où la date pourrait être invalide
 * @param date La date à formater (peut être une Date, un string, un number, null ou undefined)
 * @param formatStr Le format à utiliser (ex: "dd/MM/yyyy")
 * @param options Options additionnelles comme la locale
 * @param fallback Valeur à retourner si la date est invalide
 * @returns La date formatée ou la valeur fallback si la date est invalide
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  formatStr: string = "dd/MM/yyyy",
  options: { locale?: Locale } = { locale: fr },
  fallback: string = "Non définie"
): string {
  // Si la date est nulle ou undefined
  if (date === null || date === undefined) {
    return fallback;
  }

  try {
    // Convertir en objet Date si ce n'est pas déjà le cas
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    
    // Formater la date
    return dateFnsFormat(dateObj, formatStr, options);
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error);
    return fallback;
  }
}
