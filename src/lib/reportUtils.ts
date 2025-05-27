"use client";

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Génère un PDF à partir d'un élément HTML
 * @param elementId ID de l'élément HTML à convertir en PDF
 * @param fileName Nom du fichier PDF à générer
 * @param title Titre du rapport
 * @param orientation Orientation du PDF ('portrait' ou 'landscape')
 */
export async function generatePDF(
  elementId: string,
  fileName: string = 'rapport',
  title: string = 'Rapport',
  orientation: 'portrait' | 'landscape' = 'portrait'
) {
  try {
    // Récupérer l'élément à capturer
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Élément avec l'ID ${elementId} non trouvé`);
      return;
    }

    // Créer une nouvelle instance de jsPDF
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });

    // Ajouter le titre et la date
    const date = new Date().toLocaleDateString('fr-FR');
    pdf.setFontSize(18);
    pdf.text(title, 14, 20);
    pdf.setFontSize(12);
    pdf.text(`Généré le ${date}`, 14, 30);
    
    // Capturer l'élément en canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Meilleure qualité
      useCORS: true, // Permet de capturer les images cross-origin
      logging: false, // Désactiver les logs
    });
    
    // Convertir le canvas en image
    const imgData = canvas.toDataURL('image/png');
    
    // Calculer les dimensions pour l'ajustement au format PDF
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, (pdfHeight - 40) / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    
    // Ajouter l'image au PDF
    pdf.addImage(imgData, 'PNG', imgX, 40, imgWidth * ratio, imgHeight * ratio);
    
    // Télécharger le PDF
    pdf.save(`${fileName}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return false;
  }
}

/**
 * Génère un rapport PDF avec plusieurs sections
 * @param sections Tableau des IDs des sections à inclure dans le rapport
 * @param fileName Nom du fichier PDF à générer
 * @param title Titre du rapport
 * @param orientation Orientation du PDF
 */
export async function generateMultiSectionReport(
  sections: Array<{id: string, title: string}>,
  fileName: string = 'rapport-complet',
  title: string = 'Rapport Complet',
  orientation: 'portrait' | 'landscape' = 'landscape'
) {
  try {
    // Créer une nouvelle instance de jsPDF
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });
    
    // Ajouter le titre principal et la date
    const date = new Date().toLocaleDateString('fr-FR');
    pdf.setFontSize(22);
    pdf.text(title, 14, 20);
    pdf.setFontSize(12);
    pdf.text(`Généré le ${date}`, 14, 30);
    
    // Pour chaque section
    for (let i = 0; i < sections.length; i++) {
      const { id, title: sectionTitle } = sections[i];
      const element = document.getElementById(id);
      
      if (!element) {
        console.error(`Élément avec l'ID ${id} non trouvé`);
        continue;
      }
      
      // Ajouter une nouvelle page pour chaque section après la première
      if (i > 0) {
        pdf.addPage();
      } else {
        // Ajouter un espace après le titre sur la première page
        pdf.setFontSize(16);
        pdf.text(sectionTitle, 14, 40);
      }
      
      // Capturer l'élément en canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      // Convertir le canvas en image
      const imgData = canvas.toDataURL('image/png');
      
      // Calculer les dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, (pdfHeight - 50) / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      
      // Sur la première page, décaler l'image pour laisser de la place au titre
      const imgY = i === 0 ? 50 : 20;
      
      // Ajouter le titre de la section pour les pages suivantes
      if (i > 0) {
        pdf.setFontSize(16);
        pdf.text(sectionTitle, 14, 15);
      }
      
      // Ajouter l'image au PDF
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    }
    
    // Télécharger le PDF
    pdf.save(`${fileName}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la génération du rapport multi-sections:', error);
    return false;
  }
}

/**
 * Génère un rapport des données au format CSV
 * @param data Les données à exporter
 * @param fileName Nom du fichier CSV à générer
 */
export function generateCSV(data: any[], fileName: string = 'rapport-donnees') {
  try {
    if (!data || !data.length) {
      console.error('Aucune donnée à exporter');
      return false;
    }
    
    // Obtenir les en-têtes à partir des clés du premier objet
    const headers = Object.keys(data[0]);
    
    // Créer les lignes du CSV
    const csvRows = [];
    
    // Ajouter les en-têtes
    csvRows.push(headers.join(','));
    
    // Ajouter les données
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Échapper les virgules et les guillemets
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    // Combiner en une seule chaîne
    const csvString = csvRows.join('\n');
    
    // Créer un blob et un lien de téléchargement
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    
    // Ajouter au DOM, cliquer et supprimer
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la génération du CSV:', error);
    return false;
  }
}
