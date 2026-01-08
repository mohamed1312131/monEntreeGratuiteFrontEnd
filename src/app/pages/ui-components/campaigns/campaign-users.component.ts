import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CampaignService } from '../../../services/campaign.service';

export interface EmailLogUser {
  id: number;
  recipientEmail: string;
  recipientName: string;
  status: string;
  opened: boolean;
  openedAt: string | null;
  clicked: boolean;
  clickedAt: string | null;
  clickCount: number;
  errorMessage: string | null;
}

@Component({
  selector: 'app-campaign-users',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>{{ getTitle() }}</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-content">
        <div *ngIf="isLoading" class="loading-spinner">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!isLoading && users.length === 0" class="no-data">
          <mat-icon>inbox</mat-icon>
          <p>Aucun utilisateur trouvé</p>
        </div>

        <div *ngIf="!isLoading && users.length > 0" class="users-table">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Statut</th>
                <th *ngIf="showOpenedColumn()">Ouvert</th>
                <th *ngIf="showClickedColumn()">Cliqué</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td>{{ user.recipientName }}</td>
                <td>{{ user.recipientEmail }}</td>
                <td>
                  <span class="status-badge" [class.status-success]="user.status === 'SENT'" [class.status-error]="user.status === 'FAILED'">
                    {{ user.status === 'SENT' ? 'Délivré' : 'Échoué' }}
                  </span>
                </td>
                <td *ngIf="showOpenedColumn()">
                  <mat-icon *ngIf="user.opened" class="icon-success">check_circle</mat-icon>
                  <mat-icon *ngIf="!user.opened" class="icon-error">cancel</mat-icon>
                  <span *ngIf="user.openedAt" class="timestamp">{{ user.openedAt | date:'dd/MM HH:mm' }}</span>
                </td>
                <td *ngIf="showClickedColumn()">
                  <mat-icon *ngIf="user.clicked" class="icon-success">check_circle</mat-icon>
                  <mat-icon *ngIf="!user.clicked" class="icon-error">cancel</mat-icon>
                  <span *ngIf="user.clickCount > 0" class="click-count">({{ user.clickCount }})</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="dialog-footer">
          <p class="user-count">Total: {{ users.length }} utilisateur(s)</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container { padding: 0; min-width: 600px; max-width: 900px; }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #eee;
    }
    h2 { margin: 0; font-size: 18px; font-weight: 500; }
    .dialog-content { padding: 20px; max-height: 70vh; overflow-y: auto; }
    .dialog-footer { padding: 16px 0 0 0; border-top: 1px solid #eee; margin-top: 20px; }
    
    .loading-spinner { display: flex; justify-content: center; padding: 40px; }
    
    .no-data {
      text-align: center;
      padding: 40px;
      color: #777;
    }
    .no-data mat-icon { font-size: 48px; height: 48px; width: 48px; opacity: 0.5; margin-bottom: 10px; }
    
    .users-table { overflow-x: auto; }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead {
      background-color: #f5f5f5;
    }
    th {
      text-align: left;
      padding: 12px;
      font-weight: 600;
      font-size: 13px;
      color: #555;
      border-bottom: 2px solid #ddd;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }
    tr:hover {
      background-color: #fafafa;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-success {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    .status-error {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .icon-success {
      color: #4caf50;
      font-size: 20px;
      height: 20px;
      width: 20px;
      vertical-align: middle;
    }
    .icon-error {
      color: #f44336;
      font-size: 20px;
      height: 20px;
      width: 20px;
      vertical-align: middle;
    }
    
    .timestamp {
      font-size: 12px;
      color: #777;
      margin-left: 8px;
    }
    .click-count {
      font-size: 12px;
      color: #777;
      margin-left: 4px;
    }
    
    .user-count {
      text-align: center;
      color: #777;
      font-size: 13px;
      margin: 0;
    }
  `]
})
export class CampaignUsersComponent implements OnInit {
  users: EmailLogUser[] = [];
  isLoading = true;

  constructor(
    private campaignService: CampaignService,
    private dialogRef: MatDialogRef<CampaignUsersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { campaignId: number; type: string }
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.campaignService.getCampaignUsers(this.data.campaignId, this.data.type).subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });
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
