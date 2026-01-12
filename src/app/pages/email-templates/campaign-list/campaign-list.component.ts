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
import { EmailCampaignService, EmailCampaign } from '../../../services/email-campaign.service';
import { FormsModule } from '@angular/forms';
import { CampaignUsersComponent } from '../../ui-components/campaigns/campaign-users.component';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatCardModule
  ],
  templateUrl: './campaign-list.component.html',
  styleUrl: './campaign-list.component.scss'
})
export class CampaignListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'name', 'audience', 'channel', 'templateName', 'sentAt', 'status', 'actions'];
  dataSource: MatTableDataSource<EmailCampaign>;
  campaignCount: number = 0;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  pageSize: number = 10;
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private allCampaigns: EmailCampaign[] = [];

  constructor(
    private campaignService: EmailCampaignService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource(this.allCampaigns);
  }

  ngOnInit(): void {
    this.loadCampaigns();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCampaigns(): void {
    this.isLoading = true;
    this.campaignService.getAllCampaigns().subscribe({
      next: (data: EmailCampaign[]) => {
        this.allCampaigns = data;
        this.dataSource.data = this.allCampaigns;
        this.campaignCount = this.allCampaigns.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading campaigns:', error);
        this.showSnackBar('Erreur lors du chargement des campagnes', 'error');
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

  viewCampaignUsers(campaign: EmailCampaign): void {
    this.dialog.open(CampaignUsersComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        campaignId: campaign.id,
        type: 'all'
      },
      panelClass: 'campaign-users-dialog'
    });
  }

  getStatusLabel(campaign: EmailCampaign): string {
    if (campaign.successCount === campaign.totalRecipients) {
      return 'Envoyé';
    } else if (campaign.failureCount > 0) {
      return 'Partiel';
    } else {
      return 'En cours';
    }
  }

  getStatusClass(campaign: EmailCampaign): string {
    if (campaign.successCount === campaign.totalRecipients) {
      return 'status-success';
    } else if (campaign.failureCount > 0) {
      return 'status-partial';
    } else {
      return 'status-pending';
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
