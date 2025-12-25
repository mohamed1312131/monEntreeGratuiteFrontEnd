import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { InvitationService } from '../../../services/invitation.service';
import { FoireService } from '../../../services/foire.service';

interface Invitation {
  id: number;
  nom: string;
  email: string;
  date: string;
  heure: string;
  code: string;
  foireId?: number;
  foireName?: string;
  emailSent: boolean;
  emailSentAt?: string;
  createdAt: string;
}

interface Foire {
  id: number;
  name: string;
  isActive: boolean;
}

@Component({
  selector: 'app-invitation-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule
  ],
  templateUrl: './invitation-list.component.html',
  styleUrl: './invitation-list.component.scss'
})
export class InvitationListComponent implements OnInit {
  invitations: Invitation[] = [];
  displayedColumns: string[] = ['nom', 'email','foireName', 'date', 'heure', 'code', 'status', 'actions'];
  
  loading = false;
  uploading = false;
  searchTerm = '';
  emailSentFilter: string = 'all';
  selectedFoireId: number | null = null;
  foires: Foire[] = [];
  
  pageSize = 10;
  pageIndex = 0;
  totalElements = 0;

  selectedFile: File | null = null;
  dragOver = false;

  constructor(
    private invitationService: InvitationService,
    private foireService: FoireService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFoires();
    this.loadInvitations();
  }

  loadFoires(): void {
    this.foireService.getAllFoires().subscribe({
      next: (foires: any) => {
        this.foires = foires;
      },
      error: (error: any) => {
        console.error('Error loading foires:', error);
      }
    });
  }

  loadInvitations(): void {
    this.loading = true;
    const emailSent = this.emailSentFilter === 'all' ? undefined : this.emailSentFilter === 'sent';
    const foireId = this.selectedFoireId || undefined;
    
    this.invitationService.getInvitations(this.pageIndex, this.pageSize, emailSent, foireId).subscribe({
      next: (response: any) => {
        this.invitations = response.content;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading invitations:', error);
        this.snackBar.open('Error loading invitations', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadInvitations();
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.loadInvitations();
  }

  searchInvitations(): void {
    this.pageIndex = 0;
    this.loadInvitations();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  handleFile(file: File): void {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      this.snackBar.open('Please select a valid Excel or CSV file', 'Close', { duration: 3000 });
      return;
    }

    this.selectedFile = file;
    this.uploadFile();
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    if (!this.selectedFoireId) {
      this.snackBar.open('Please select a foire first', 'Close', { duration: 3000 });
      return;
    }

    this.uploading = true;
    this.invitationService.uploadExcel(this.selectedFile, this.selectedFoireId).subscribe({
      next: (response: any) => {
        this.snackBar.open(
          `Upload successful! ${response.successfulRows} invitations added, ${response.failedRows} errors`,
          'Close',
          { duration: 5000 }
        );
        
        if (response.errors && response.errors.length > 0) {
          console.warn('Upload errors:', response.errors);
        }
        
        this.selectedFile = null;
        this.uploading = false;
        this.loadInvitations();
      },
      error: (error: any) => {
        console.error('Error uploading file:', error);
        this.snackBar.open('Error uploading file: ' + (error.error?.message || 'Unknown error'), 'Close', { duration: 5000 });
        this.uploading = false;
      }
    });
  }

  deleteInvitation(invitation: Invitation): void {
    if (!confirm(`Are you sure you want to delete invitation for ${invitation.nom}?`)) return;

    this.invitationService.deleteInvitation(invitation.id).subscribe({
      next: () => {
        this.snackBar.open('Invitation deleted successfully', 'Close', { duration: 2000 });
        this.loadInvitations();
      },
      error: (error) => {
        console.error('Error deleting invitation:', error);
        this.snackBar.open('Error deleting invitation', 'Close', { duration: 3000 });
      }
    });
  }

  getFilteredInvitations(): Invitation[] {
    if (!this.searchTerm) {
      return this.invitations;
    }
    const term = this.searchTerm.toLowerCase();
    return this.invitations.filter(inv => 
      inv.nom.toLowerCase().includes(term) || 
      inv.email.toLowerCase().includes(term) ||
      inv.code.toLowerCase().includes(term)
    );
  }
}
