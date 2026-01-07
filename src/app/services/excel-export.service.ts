import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  constructor() { }

  /**
   * Export data to Excel file
   * @param data Array of objects to export
   * @param fileName Name of the Excel file (without extension)
   * @param sheetName Name of the worksheet
   */
  exportToExcel(data: any[], fileName: string, sheetName: string = 'Sheet1'): void {
    // Create a new workbook
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }

  /**
   * Export reservations to Excel with formatted columns
   */
  exportReservations(reservations: any[]): void {
    const ageLabels: { [key: string]: string } = {
      'MOINS': 'moins de 35ans',
      'ENTRE': 'entre 35 et 70 ans',
      'PLUS': 'plus de 70 ans'
    };

    const formattedData = reservations.map(r => ({
      'ID': r.id,
      'Pays': r.country,
      'Date Réservation': r.reservationDate,
      'Heure Réservation': this.extractTime(r.createdAt), // Assuming createdAt exists or needs to be added
      'Nom Foire': r.foireName,
      'Nom': r.name,
      'Ville': r.city,
      'Email': r.email,
      'Téléphone': r.phone,
      'Catégorie Âge': ageLabels[r.ageCategory] || r.ageCategory
    }));

    this.exportToExcel(formattedData, `Reservations_${this.getDateString()}`, 'Réservations');
  }

  private extractTime(dateString: string): string {
    if (!dateString) return '';
    // Check if it's a full ISO string or just date
    if (dateString.includes('T')) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return '';
  }

  /**
   * Format date ranges for display
   */
  private formatDateRanges(dateRanges: any[]): string {
    if (!dateRanges || dateRanges.length === 0) {
      return 'N/A';
    }
    return dateRanges.map(range => `${range.startDate} - ${range.endDate}`).join(', ');
  }

  /**
   * Export exposant requests to Excel with formatted columns
   */
  exportExposantRequests(requests: any[]): void {
    const formattedData = requests.map(r => ({
      'ID': r.id,
      'Date': r.createdAt,
      'Établissement': r.nomEtablissement,
      'Secteur': r.secteurActivite,
      'Description': r.description || '',
      'Civilité': r.civilite,
      'Contact': r.nomPrenom,
      'Email': r.email,
      'Téléphone': r.telephone,
      'Statut': r.status
    }));

    this.exportToExcel(formattedData, `Demandes_Exposants_${this.getDateString()}`, 'Demandes Exposants');
  }

  /**
   * Get current date string for file naming
   */
  private getDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}`;
  }
}
