import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectionModel } from '@angular/cdk/collections';
import { ExposantRequestService, ExposantRequest } from 'src/app/services/exposant-request.service';
import { ExcelExportService } from 'src/app/services/excel-export.service';

@Component({
  selector: 'app-exposant-requests',
  templateUrl: './exposant-requests.component.html',
  styleUrls: ['./exposant-requests.component.scss']
})
export class ExposantRequestsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['select', 'id', 'createdAt', 'nomEtablissement', 'secteurActivite', 'nomPrenom', 'email', 'telephone', 'status', 'actions'];
  dataSource: MatTableDataSource<ExposantRequest>;
  selection = new SelectionModel<ExposantRequest>(true, []);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  selectedStatus: string[] = [];
  isLoading = true;
  
  private allRequests: ExposantRequest[] = [];
  private searchText = '';

  constructor(
    private exposantRequestService: ExposantRequestService,
    private snackBar: MatSnackBar,
    private excelExportService: ExcelExportService
  ) {
    this.dataSource = new MatTableDataSource<ExposantRequest>([]);
  }

  ngOnInit(): void {
    this.loadExposantRequests();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadExposantRequests(): void {
    this.isLoading = true;

    this.exposantRequestService.getAllExposantRequests().subscribe({
      next: (requests) => {
        this.allRequests = requests;
        this.dataSource.data = requests;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading exposant requests:', error);
        this.showSnackBar('Erreur lors du chargement des demandes exposants', 'error');
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.applyAllFilters();
  }

  applyFilters(): void {
    this.applyAllFilters();
  }

  private applyAllFilters(): void {
    this.dataSource.filterPredicate = (data: ExposantRequest, filter: string): boolean => {
      const matchesSearch = !this.searchText || 
        (data.nomEtablissement?.toLowerCase().includes(this.searchText) ?? false) ||
        (data.secteurActivite?.toLowerCase().includes(this.searchText) ?? false) ||
        (data.nomPrenom?.toLowerCase().includes(this.searchText) ?? false) ||
        (data.email?.toLowerCase().includes(this.searchText) ?? false) ||
        (data.telephone?.toLowerCase().includes(this.searchText) ?? false) ||
        (data.id?.toString().includes(this.searchText) ?? false);
      
      const matchesStatus = this.selectedStatus.length === 0 || 
        (data.status ? this.selectedStatus.includes(data.status) : false);
      
      return matchesSearch && matchesStatus;
    };
    
    this.dataSource.filter = Math.random().toString();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  updateStatus(id: number, newStatus: string): void {
    const request = this.allRequests.find(r => r.id === id);
    if (request) {
      this.exposantRequestService.updateExposantRequestStatus(id, newStatus).subscribe({
        next: (updated) => {
          request.status = updated.status;
          this.dataSource._updateChangeSubscription();
          this.showSnackBar(`Demande ${id} mise à jour: ${this.getStatusLabel(newStatus)}`, 'success');
        },
        error: (error) => {
          console.error('Error updating status:', error);
          this.showSnackBar('Erreur lors de la mise à jour', 'error');
        }
      });
    }
  }

  deleteRequest(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette demande?')) {
      this.exposantRequestService.deleteExposantRequest(id).subscribe({
        next: () => {
          const index = this.allRequests.findIndex(r => r.id === id);
          if (index > -1) {
            this.allRequests.splice(index, 1);
            this.dataSource.data = this.allRequests;
            this.showSnackBar(`Demande ${id} supprimée`, 'success');
          }
        },
        error: (error) => {
          console.error('Error deleting request:', error);
          this.showSnackBar('Erreur lors de la suppression', 'error');
        }
      });
    }
  }

  exportToExcel(): void {
    const selectedRequests = this.selection.selected;
    
    if (selectedRequests.length === 0) {
      this.showSnackBar('Veuillez sélectionner au moins une demande à exporter', 'error');
      return;
    }

    this.excelExportService.exportExposantRequests(selectedRequests);
    this.showSnackBar(`${selectedRequests.length} demande(s) exportée(s) avec succès`, 'success');
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

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'PENDING': 'status-pending',
      'CONTACTED': 'status-contacted',
      'ACCEPTED': 'status-accepted',
      'REJECTED': 'status-rejected'
    };
    return classes[status] || '';
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'CONTACTED':
        return 'Contacté';
      case 'ACCEPTED':
        return 'Accepté';
      case 'REJECTED':
        return 'Refusé';
      default:
        return status;
    }
  }

  getTotalRequests(): number {
    return this.allRequests.length;
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
