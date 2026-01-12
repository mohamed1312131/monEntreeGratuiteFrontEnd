import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { EmailCampaignService, EmailLogUser } from '../../../services/email-campaign.service';

@Component({
  selector: 'app-campaign-users',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="header-content">
          <mat-icon class="header-icon">people</mat-icon>
          <h2 mat-dialog-title>{{ getTitle() }}</h2>
        </div>
        <button mat-icon-button (click)="close()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-content">
        <div *ngIf="isLoading" class="loading-spinner">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Chargement des utilisateurs...</p>
        </div>

        <div *ngIf="!isLoading && users.length === 0" class="no-data">
          <mat-icon>inbox</mat-icon>
          <p>Aucun utilisateur trouvé</p>
        </div>

        <div *ngIf="!isLoading && users.length > 0">
          <!-- Search Bar -->
          <div class="search-bar">
            <mat-form-field appearance="outline" class="search-field">
              <mat-icon matPrefix>search</mat-icon>
              <input matInput [(ngModel)]="searchText" (input)="applyFilter()" placeholder="Rechercher par nom ou email...">
              <button mat-icon-button matSuffix *ngIf="searchText" (click)="clearSearch()">
                <mat-icon>clear</mat-icon>
              </button>
            </mat-form-field>
            <div class="stats-chips">
              <span class="stat-chip total">
                <mat-icon>people</mat-icon>
                Total: {{ filteredUsers.length }}
              </span>
              <span class="stat-chip success" *ngIf="getSuccessCount() > 0">
                <mat-icon>check_circle</mat-icon>
                Délivrés: {{ getSuccessCount() }}
              </span>
              <span class="stat-chip error" *ngIf="getFailedCount() > 0">
                <mat-icon>error</mat-icon>
                Échoués: {{ getFailedCount() }}
              </span>
            </div>
          </div>

          <!-- Users Table -->
          <div class="users-table">
            <table>
              <thead>
                <tr>
                  <th class="col-index">#</th>
                  <th class="col-name">Nom</th>
                  <th class="col-email">Email</th>
                  <th class="col-status">Statut</th>
                  <th *ngIf="showOpenedColumn()" class="col-opened">Ouvert</th>
                  <th *ngIf="showClickedColumn()" class="col-clicked">Cliqué</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of paginatedUsers; let i = index">
                  <td class="col-index">{{ (pageIndex * pageSize) + i + 1 }}</td>
                  <td class="col-name">{{ user.recipientName }}</td>
                  <td class="col-email">{{ user.recipientEmail }}</td>
                  <td class="col-status">
                    <span class="status-badge" [class.status-success]="user.status === 'SENT'" [class.status-error]="user.status === 'FAILED'">
                      <mat-icon>{{ user.status === 'SENT' ? 'check_circle' : 'error' }}</mat-icon>
                      {{ user.status === 'SENT' ? 'Délivré' : 'Échoué' }}
                    </span>
                  </td>
                  <td *ngIf="showOpenedColumn()" class="col-opened">
                    <div class="status-cell">
                      <mat-icon *ngIf="user.opened" class="icon-success">check_circle</mat-icon>
                      <mat-icon *ngIf="!user.opened" class="icon-muted">remove_circle</mat-icon>
                      <span *ngIf="user.openedAt" class="timestamp">{{ user.openedAt | date:'dd/MM HH:mm' }}</span>
                    </div>
                  </td>
                  <td *ngIf="showClickedColumn()" class="col-clicked">
                    <div class="status-cell">
                      <mat-icon *ngIf="user.clicked" class="icon-success">check_circle</mat-icon>
                      <mat-icon *ngIf="!user.clicked" class="icon-muted">remove_circle</mat-icon>
                      <span *ngIf="user.clickCount > 0" class="click-count">({{ user.clickCount }})</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination-wrapper">
            <mat-paginator
              [length]="filteredUsers.length"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 25, 50, 100]"
              [pageIndex]="pageIndex"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container { padding: 0; min-width: 700px; max-width: 1000px; max-height: 90vh; display: flex; flex-direction: column; }
    
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-bottom: none;
    }
    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-icon {
      color: white;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    h2 { margin: 0; font-size: 18px; font-weight: 600; color: white; }
    .close-btn {
      color: white;
    }
    
    .dialog-content { padding: 20px; overflow-y: auto; flex: 1; }
    
    .loading-spinner { 
      display: flex; 
      flex-direction: column;
      align-items: center;
      justify-content: center; 
      padding: 60px;
      gap: 16px;
    }
    .loading-spinner p {
      color: #667eea;
      font-weight: 500;
      margin: 0;
    }
    
    .no-data {
      text-align: center;
      padding: 60px;
      color: #999;
    }
    .no-data mat-icon { font-size: 64px; height: 64px; width: 64px; opacity: 0.3; margin-bottom: 16px; }
    .no-data p { font-size: 14px; margin: 0; }
    
    .search-bar {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .search-field {
      flex: 1;
      min-width: 250px;
    }
    .search-field ::ng-deep .mat-mdc-form-field-wrapper {
      padding-bottom: 0;
    }
    .search-field ::ng-deep .mat-mdc-text-field-wrapper {
      height: 44px;
    }
    .stats-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .stat-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
    }
    .stat-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .stat-chip.total {
      background: #e3f2fd;
      color: #1976d2;
    }
    .stat-chip.success {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .stat-chip.error {
      background: #ffebee;
      color: #c62828;
    }
    
    .users-table { 
      overflow-x: auto;
      border: 1px solid #e1e4e8;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead {
      background: #f6f8fa;
    }
    th {
      text-align: left;
      padding: 12px 16px;
      font-weight: 600;
      font-size: 12px;
      color: #24292e;
      border-bottom: 2px solid #e1e4e8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 12px 16px;
      border-bottom: 1px solid #e1e4e8;
      font-size: 13px;
      color: #24292e;
    }
    tbody tr:hover {
      background-color: #f6f8fa;
    }
    tbody tr:last-child td {
      border-bottom: none;
    }
    
    .col-index { width: 60px; color: #586069; font-weight: 600; }
    .col-name { min-width: 150px; }
    .col-email { min-width: 200px; color: #586069; }
    .col-status { width: 140px; }
    .col-opened { width: 140px; }
    .col-clicked { width: 120px; }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }
    .status-badge mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    .status-success {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    .status-error {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .status-cell {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .icon-success {
      color: #4caf50;
      font-size: 18px;
      height: 18px;
      width: 18px;
    }
    .icon-muted {
      color: #ccc;
      font-size: 18px;
      height: 18px;
      width: 18px;
    }
    
    .timestamp {
      font-size: 11px;
      color: #586069;
    }
    .click-count {
      font-size: 11px;
      color: #586069;
      font-weight: 600;
    }
    
    .pagination-wrapper {
      border-top: 1px solid #e1e4e8;
      background: #fafbfc;
      border-radius: 0 0 8px 8px;
    }
    .pagination-wrapper ::ng-deep .mat-mdc-paginator-container {
      padding: 8px 16px;
      min-height: 56px;
    }
  `]
})
export class CampaignUsersComponent implements OnInit {
  users: EmailLogUser[] = [];
  filteredUsers: EmailLogUser[] = [];
  paginatedUsers: EmailLogUser[] = [];
  isLoading = true;
  searchText = '';
  pageIndex = 0;
  pageSize = 25;

  constructor(
    private campaignService: EmailCampaignService,
    private dialogRef: MatDialogRef<CampaignUsersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { campaignId: number; type: string }
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.campaignService.getCampaignUsers(this.data.campaignId, this.data.type || 'all').subscribe({
      next: (data: EmailLogUser[]) => {
        this.users = data;
        this.filteredUsers = [...this.users];
        this.updatePaginatedUsers();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    const searchLower = this.searchText.toLowerCase().trim();
    if (!searchLower) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(user => 
        user.recipientName.toLowerCase().includes(searchLower) ||
        user.recipientEmail.toLowerCase().includes(searchLower)
      );
    }
    this.pageIndex = 0;
    this.updatePaginatedUsers();
  }

  clearSearch(): void {
    this.searchText = '';
    this.applyFilter();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedUsers();
  }

  updatePaginatedUsers(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }

  getSuccessCount(): number {
    return this.filteredUsers.filter(u => u.status === 'SENT').length;
  }

  getFailedCount(): number {
    return this.filteredUsers.filter(u => u.status === 'FAILED').length;
  }

  getTitle(): string {
    const titles: { [key: string]: string } = {
      'all': 'Tous les destinataires',
      'delivered': 'Emails délivrés',
      'failed': 'Emails non délivrés',
      'opened': 'Utilisateurs ayant ouvert',
      'not-opened': 'Utilisateurs n\'ayant pas ouvert',
      'clicked': 'Utilisateurs ayant cliqué',
      'not-clicked': 'Utilisateurs n\'ayant pas cliqué',
      'unsubscribed': 'Utilisateurs désabonnés'
    };
    return titles[this.data.type] || 'Utilisateurs';
  }

  showOpenedColumn(): boolean {
    return ['all', 'delivered', 'opened', 'not-opened', 'clicked', 'not-clicked'].includes(this.data.type);
  }

  showClickedColumn(): boolean {
    return ['all', 'opened', 'clicked', 'not-clicked'].includes(this.data.type);
  }

  close(): void {
    this.dialogRef.close();
  }
}
