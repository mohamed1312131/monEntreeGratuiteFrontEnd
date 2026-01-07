import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CampaignService, EmailCampaign } from '../../../services/campaign.service';
import { CampaignStatsComponent } from './campaign-stats.component';

@Component({
  selector: 'app-campaign-history',
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>Historique des campagnes - {{ data.foireName }}</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-content">
        <div *ngIf="isLoading" class="loading-spinner">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!isLoading && campaigns.length === 0" class="no-data">
          <mat-icon>inbox</mat-icon>
          <p>Aucune campagne trouvée pour cette foire.</p>
        </div>

        <div *ngIf="!isLoading && campaigns.length > 0" class="campaign-list">
          <div *ngFor="let campaign of campaigns" class="campaign-item" (click)="viewStats(campaign)">
            <div class="campaign-info">
              <span class="campaign-name">{{ campaign.name }}</span>
              <span class="campaign-date">{{ campaign.sentAt | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="campaign-meta">
              <span class="recipient-count">
                <mat-icon>group</mat-icon> {{ campaign.totalRecipients }}
              </span>
              <mat-icon class="arrow-icon">chevron_right</mat-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #eee;
    }
    h2 { margin: 0; font-size: 18px; font-weight: 500; }
    .dialog-content {
      padding: 20px;
      overflow-y: auto;
      min-height: 200px;
    }
    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }
    .no-data {
      text-align: center;
      color: #777;
      padding: 40px 0;
    }
    .no-data mat-icon { font-size: 48px; height: 48px; width: 48px; opacity: 0.5; margin-bottom: 10px; }
    
    .campaign-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .campaign-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
    }
    .campaign-item:hover {
      background: #fff;
      border-color: #3f51b5;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .campaign-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .campaign-name {
      font-weight: 500;
      color: #333;
    }
    .campaign-date {
      font-size: 12px;
      color: #777;
    }
    .campaign-meta {
      display: flex;
      align-items: center;
      gap: 15px;
      color: #666;
    }
    .recipient-count {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 13px;
    }
    .recipient-count mat-icon { font-size: 18px; height: 18px; width: 18px; }
  `]
})
export class CampaignHistoryComponent implements OnInit {
  campaigns: EmailCampaign[] = [];
  isLoading = true;

  constructor(
    private campaignService: CampaignService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<CampaignHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { foireId: number, foireName: string }
  ) {}

  ngOnInit(): void {
    this.loadCampaigns();
  }

  loadCampaigns(): void {
    this.isLoading = true;
    this.campaignService.getCampaignsByFoire(this.data.foireId).subscribe({
      next: (data) => {
        this.campaigns = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading campaigns:', error);
        this.isLoading = false;
      }
    });
  }

  viewStats(campaign: EmailCampaign): void {
    this.dialog.open(CampaignStatsComponent, {
      width: '500px',
      data: { campaignId: campaign.id }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
