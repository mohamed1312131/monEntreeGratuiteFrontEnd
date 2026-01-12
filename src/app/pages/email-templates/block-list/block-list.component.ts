import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { EmailBlocklistService, BlockedEmail } from '../../../services/email-blocklist.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-block-list',
  templateUrl: './block-list.component.html',
  styleUrl: './block-list.component.scss'
})
export class BlockListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'email', 'reason', 'blockedAt', 'ipAddress', 'actions'];
  dataSource: MatTableDataSource<BlockedEmail>;
  blockedEmailCount: number = 0;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  pageSize: number = 10;
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private allBlockedEmails: BlockedEmail[] = [];

  constructor(
    private blocklistService: EmailBlocklistService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource(this.allBlockedEmails);
  }

  ngOnInit(): void {
    this.loadBlockedEmails();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadBlockedEmails(): void {
    this.isLoading = true;
    this.blocklistService.getAllBlockedEmails().subscribe({
      next: (data: BlockedEmail[]) => {
        this.allBlockedEmails = data;
        this.dataSource.data = this.allBlockedEmails;
        this.blockedEmailCount = this.allBlockedEmails.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading blocked emails:', error);
        this.showSnackBar('Erreur lors du chargement des emails bloqués', 'error');
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  unblockEmail(email: string): void {
    if (confirm(`Êtes-vous sûr de vouloir débloquer l'email: ${email}?`)) {
      this.blocklistService.unblockEmail(email).subscribe({
        next: () => {
          const index = this.allBlockedEmails.findIndex(e => e.email === email);
          if (index > -1) {
            this.allBlockedEmails.splice(index, 1);
            this.dataSource.data = this.allBlockedEmails;
            this.blockedEmailCount = this.allBlockedEmails.length;
            this.showSnackBar(`Email ${email} débloqué avec succès`, 'success');
          }
        },
        error: (error) => {
          console.error('Error unblocking email:', error);
          this.showSnackBar('Erreur lors du déblocage de l\'email', 'error');
        }
      });
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
