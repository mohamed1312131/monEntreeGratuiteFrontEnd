import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReservationService, ReservationData } from '../../../services/reservation.service';
import { ExcelExportService } from '../../../services/excel-export.service';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface Reservation {
  id: number;
  country: string;
  reservationDate: string;
  foireDateRanges: DateRange[];
  foireName: string;
  name: string;
  city: string;
  email: string;
  phone: string;
  ageCategory: string;
  status: string;
}

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'select', 'id', 'country', 'reservationDate', 'foireName', 
    'name', 'city', 'email', 'phone', 'ageCategory', 'status', 'actions'
  ];

  dataSource: MatTableDataSource<Reservation>;
  selection = new SelectionModel<Reservation>(true, []);
  reservationCount: number = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  pageSize: number = 10;
  showCompleted: boolean = false;
  
  // Filters
  selectedStatus: string[] = [];
  selectedFoires: string[] = [];
  uniqueFoires: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private allReservations: Reservation[] = [];
  isLoading = false;

  // Old static mock data (kept for reference)
  private mockReservations: Reservation[] = [
    {
      id: 1,
      country: 'FR',
      reservationDate: '2024-12-01',
      foireDateRanges: [{startDate: '2025-02-22', endDate: '2025-02-25'}],
      foireName: 'Salon de l\'Agriculture',
      name: 'Jean Dupont',
      city: 'Paris',
      email: 'jean.dupont@email.com',
      phone: '+33 6 12 34 56 78',
      ageCategory: 'ENTRE',
      status: 'CONFIRMED'
    },
    {
      id: 2,
      country: 'FR',
      reservationDate: '2024-12-02',
      foireDateRanges: [{startDate: '2025-04-28', endDate: '2025-05-02'}],
      foireName: 'Foire de Paris',
      name: 'Marie Martin',
      city: 'Lyon',
      email: 'marie.martin@email.com',
      phone: '+33 6 23 45 67 89',
      ageCategory: 'MOINS',
      status: 'PENDING'
    },
    {
      id: 3,
      country: 'BL',
      reservationDate: '2024-12-03',
      foireDateRanges: [{startDate: '2025-03-15', endDate: '2025-03-18'}],
      foireName: 'Foire de Bruxelles',
      name: 'Pierre Dubois',
      city: 'Bruxelles',
      email: 'pierre.dubois@email.com',
      phone: '+32 4 12 34 56 78',
      ageCategory: 'PLUS',
      status: 'CONFIRMED'
    },
    {
      id: 4,
      country: 'FR',
      reservationDate: '2024-12-04',
      foireDateRanges: [{startDate: '2025-10-28', endDate: '2025-11-01'}],
      foireName: 'Salon du Chocolat',
      name: 'Sophie Laurent',
      city: 'Marseille',
      email: 'sophie.laurent@email.com',
      phone: '+33 6 34 56 78 90',
      ageCategory: 'ENTRE',
      status: 'COMPLETED'
    },
    {
      id: 5,
      country: 'SU',
      reservationDate: '2024-12-05',
      foireDateRanges: [{startDate: '2025-06-10', endDate: '2025-06-14'}],
      foireName: 'Foire de Genève',
      name: 'Luc Bernard',
      city: 'Genève',
      email: 'luc.bernard@email.com',
      phone: '+41 22 123 45 67',
      ageCategory: 'MOINS',
      status: 'PENDING'
    },
    {
      id: 6,
      country: 'FR',
      reservationDate: '2024-12-06',
      foireDateRanges: [{startDate: '2025-02-22', endDate: '2025-02-25'}],
      foireName: 'Salon de l\'Agriculture',
      name: 'Claire Petit',
      city: 'Toulouse',
      email: 'claire.petit@email.com',
      phone: '+33 6 45 67 89 01',
      ageCategory: 'PLUS',
      status: 'BLOCKED'
    },
    {
      id: 7,
      country: 'BL',
      reservationDate: '2024-12-07',
      foireDateRanges: [{startDate: '2025-05-20', endDate: '2025-05-23'}],
      foireName: 'Salon du Livre Bruxelles',
      name: 'Thomas Moreau',
      city: 'Liège',
      email: 'thomas.moreau@email.com',
      phone: '+32 4 23 45 67 89',
      ageCategory: 'ENTRE',
      status: 'CONFIRMED'
    }
  ];

  constructor(
    private snackBar: MatSnackBar,
    private reservationService: ReservationService,
    private excelExportService: ExcelExportService
  ) {
    this.dataSource = new MatTableDataSource(this.allReservations);
  }

  ngOnInit(): void {
    this.loadReservationsFromBackend();
  }
  
  extractUniqueFoires(): void {
    const foiresSet = new Set(this.allReservations.map(r => r.foireName));
    this.uniqueFoires = Array.from(foiresSet).sort();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadReservationsFromBackend(): void {
    this.isLoading = true;
    this.reservationService.getAllReservations().subscribe({
      next: (data: ReservationData[]) => {
        this.allReservations = data.map(r => ({
          id: r.id,
          country: r.country,
          reservationDate: r.reservationDate,
          foireDateRanges: r.foireDateRanges || [],
          foireName: r.foireName,
          name: r.name,
          city: r.city,
          email: r.email,
          phone: r.phone,
          ageCategory: r.ageCategory,
          status: r.status
        }));
        this.loadReservations();
        this.extractUniqueFoires();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.showSnackBar('Erreur lors du chargement des réservations', 'error');
        this.isLoading = false;
      }
    });
  }

  loadReservations(): void {
    if (this.showCompleted) {
      this.dataSource.data = this.allReservations;
    } else {
      this.dataSource.data = this.allReservations.filter(r => r.status !== 'COMPLETED');
    }
    this.reservationCount = this.dataSource.data.length;
  }

  toggleShowCompleted(): void {
    this.showCompleted = !this.showCompleted;
    this.loadReservations();
  }

  private searchText = '';

  applyFilter(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.applyAllFilters();
  }
  
  applyFilters(): void {
    this.applyAllFilters();
  }
  
  private applyAllFilters(): void {
    // Set up custom filter predicate that considers all filters
    this.dataSource.filterPredicate = (data: Reservation) => {
      // Text search filter
      const matchesSearch = !this.searchText || 
        data.name.toLowerCase().includes(this.searchText) ||
        data.email.toLowerCase().includes(this.searchText) ||
        data.city.toLowerCase().includes(this.searchText) ||
        data.foireName.toLowerCase().includes(this.searchText) ||
        data.id.toString().includes(this.searchText);
      
      // Status filter
      const matchesStatus = this.selectedStatus.length === 0 || 
        this.selectedStatus.includes(data.status);
      
      // Foire filter
      const matchesFoire = this.selectedFoires.length === 0 || 
        this.selectedFoires.includes(data.foireName);
      
      return matchesSearch && matchesStatus && matchesFoire;
    };
    
    // Trigger filter by setting a unique value each time
    this.dataSource.filter = Math.random().toString();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  viewDetails(reservation: Reservation): void {
    // TODO: Open dialog with reservation details
    this.showSnackBar(`Affichage des détails de la réservation ${reservation.id}`, 'success');
  }

  exportToExcel(): void {
    const selectedReservations = this.selection.selected;
    
    if (selectedReservations.length === 0) {
      this.showSnackBar('Veuillez sélectionner au moins une réservation à exporter', 'error');
      return;
    }

    this.excelExportService.exportReservations(selectedReservations);
    this.showSnackBar(`${selectedReservations.length} réservation(s) exportée(s) avec succès`, 'success');
    this.selection.clear();
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  updateReservationStatus(id: number, status: string): void {
    const reservation = this.allReservations.find(r => r.id === id);
    if (reservation && reservation.status !== 'COMPLETED') {
      this.reservationService.updateReservationStatus(id, status).subscribe({
        next: (updated) => {
          reservation.status = updated.status;
          this.dataSource._updateChangeSubscription();
          this.showSnackBar(`Réservation ${id} mise à jour: ${this.getStatusLabel(status)}`, 'success');
        },
        error: (error) => {
          console.error('Error updating reservation status:', error);
          this.showSnackBar('Erreur lors de la mise à jour', 'error');
        }
      });
    }
  }

  updateReservationsStatus(status: string): void {
    const hasCompleted = this.selection.selected.some(r => r.status === 'COMPLETED');
    if (hasCompleted) {
      this.showSnackBar('Impossible de modifier les réservations terminées', 'error');
      return;
    }

    const ids = this.selection.selected.map(r => r.id);
    this.reservationService.updateReservationsStatus(ids, status).subscribe({
      next: (updated) => {
        this.selection.selected.forEach(reservation => {
          const updatedRes = updated.find(u => u.id === reservation.id);
          if (updatedRes) {
            reservation.status = updatedRes.status;
          }
        });
        this.dataSource._updateChangeSubscription();
        this.showSnackBar(`${this.selection.selected.length} réservations mises à jour`, 'success');
        this.selection.clear();
      },
      error: (error) => {
        console.error('Error updating reservations status:', error);
        this.showSnackBar('Erreur lors de la mise à jour', 'error');
      }
    });
  }

  deleteReservation(id: number, foireName: string): void {
    if (confirm(`Supprimer la réservation ${id} pour ${foireName}?`)) {
      this.reservationService.deleteReservation(id).subscribe({
        next: () => {
          const index = this.allReservations.findIndex(r => r.id === id);
          if (index > -1) {
            this.allReservations.splice(index, 1);
            this.loadReservations();
            this.showSnackBar(`Réservation ${id} supprimée`, 'success');
          }
        },
        error: (error) => {
          console.error('Error deleting reservation:', error);
          this.showSnackBar('Erreur lors de la suppression', 'error');
        }
      });
    }
  }

  sendConfirmationEmail(id: number): void {
    this.reservationService.sendConfirmationEmail(id).subscribe({
      next: () => {
        this.showSnackBar(`Email de confirmation envoyé pour la réservation ${id}`, 'success');
      },
      error: (error) => {
        console.error('Error sending confirmation email:', error);
        this.showSnackBar('Erreur lors de l\'envoi de l\'email', 'error');
      }
    });
  }

  sendConfirmationEmails(): void {
    const hasCompleted = this.selection.selected.some(r => r.status === 'COMPLETED');
    if (hasCompleted) {
      this.showSnackBar('Impossible d\'envoyer des emails pour les réservations terminées', 'error');
      return;
    }

    const ids = this.selection.selected.map(r => r.id);
    this.reservationService.sendConfirmationEmails(ids).subscribe({
      next: () => {
        this.showSnackBar(`${this.selection.selected.length} emails de confirmation envoyés`, 'success');
        this.selection.clear();
      },
      error: (error) => {
        console.error('Error sending confirmation emails:', error);
        this.showSnackBar('Erreur lors de l\'envoi des emails', 'error');
      }
    });
  }

  getCountryImage(countryCode: string): string {
    const images: { [key: string]: string } = {
      'BE': 'assets/images/flags/Belgium.png',
      'FR': 'assets/images/flags/France.png',
      'CH': 'assets/images/flags/Switzerland.png'
    };
    return images[countryCode] || '';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'COMPLETED': 'status-completed',
      'BLOCKED': 'status-blocked'
    };
    return classes[status] || '';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'En attente',
      'CONFIRMED': 'Confirmée',
      'COMPLETED': 'Terminée',
      'BLOCKED': 'Bloquée'
    };
    return labels[status] || status;
  }

  getAgeLabel(ageCategory: string): string {
    const labels: { [key: string]: string } = {
      'MOINS': '< 30 ans',
      'ENTRE': '30-60 ans',
      'PLUS': '> 60 ans'
    };
    return labels[ageCategory] || ageCategory;
  }

  formatFoireDateRanges(dateRanges: DateRange[]): string {
    if (!dateRanges || dateRanges.length === 0) {
      return 'N/A';
    }
    return dateRanges.map(range => `${range.startDate} - ${range.endDate}`).join(', ');
  }

  showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snack-bar-success' : 'snack-bar-error'
    });
  }
}
