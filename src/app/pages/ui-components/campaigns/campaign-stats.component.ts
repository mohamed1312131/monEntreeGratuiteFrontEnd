import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CampaignService, CampaignStats } from '../../../services/campaign.service';
import { CampaignUsersComponent } from './campaign-users.component';

@Component({
  selector: 'app-campaign-stats',
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>Statistiques de la campagne</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-content">
        <div *ngIf="isLoading" class="loading-spinner">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!isLoading && stats">
          <h3 class="campaign-title">{{ stats.name }}</h3>
          <p class="campaign-date">{{ stats.sentAt | date:'dd/MM/yyyy HH:mm' }}</p>

          <div class="stats-list">
            <!-- Total Recipients -->
            <div class="stat-row clickable" (click)="viewUsers('all')">
              <div class="stat-label-group">
                <span class="status-dot dot-gray"></span>
                <span class="stat-label">Destinataires</span>
              </div>
              <div class="stat-value">{{ stats.totalRecipients }}</div>
            </div>

            <!-- Delivered -->
            <div class="stat-row clickable" (click)="viewUsers('delivered')">
              <div class="stat-label-group">
                <span class="status-dot dot-green"></span>
                <span class="stat-label">Délivrés</span>
              </div>
              <div class="stat-value">
                {{ stats.deliveredCount }}/{{ stats.totalRecipients }} ({{ getPercentage(stats.deliveredCount, stats.totalRecipients) }}%)
              </div>
            </div>

            <!-- Failed -->
            <div class="stat-row clickable" (click)="viewUsers('failed')">
              <div class="stat-label-group">
                <span class="status-dot dot-red"></span>
                <span class="stat-label">Non délivrés</span>
              </div>
              <div class="stat-value">
                {{ stats.failedCount }}/{{ stats.totalRecipients }} ({{ getPercentage(stats.failedCount, stats.totalRecipients) }}%)
              </div>
            </div>

            <!-- Opens -->
            <div class="stat-row clickable" (click)="viewUsers('opened')">
              <div class="stat-label-group">
                <span class="status-dot dot-blue"></span>
                <span class="stat-label">Ouvreurs</span>
              </div>
              <div class="stat-value">
                {{ stats.openCount }}/{{ stats.deliveredCount }} ({{ getPercentage(stats.openCount, stats.deliveredCount) }}%)
              </div>
            </div>

            <!-- Non-Openers -->
            <div class="stat-row clickable" (click)="viewUsers('not-opened')">
              <div class="stat-label-group">
                <span class="status-dot dot-hollow-blue"></span>
                <span class="stat-label">Non ouvreurs</span>
              </div>
              <div class="stat-value">
                {{ stats.deliveredCount - stats.openCount }}/{{ stats.deliveredCount }} ({{ getPercentage(stats.deliveredCount - stats.openCount, stats.deliveredCount) }}%)
              </div>
            </div>

            <!-- Clicks -->
            <div class="stat-row clickable" (click)="viewUsers('clicked')">
              <div class="stat-label-group">
                <span class="status-dot dot-purple"></span>
                <span class="stat-label">Cliqueurs</span>
              </div>
              <div class="stat-value">
                {{ stats.clickCount }}/{{ stats.openCount }} ({{ getPercentage(stats.clickCount, stats.openCount) }}%)
              </div>
            </div>

            <!-- Non-Clickers -->
            <div class="stat-row clickable" (click)="viewUsers('not-clicked')">
              <div class="stat-label-group">
                <span class="status-dot dot-hollow-purple"></span>
                <span class="stat-label">Non cliqueurs</span>
              </div>
              <div class="stat-value">
                {{ stats.openCount - stats.clickCount }}/{{ stats.openCount }} ({{ getPercentage(stats.openCount - stats.clickCount, stats.openCount) }}%)
              </div>
            </div>

            <!-- Unsubscribes -->
            <div class="stat-row clickable" (click)="viewUsers('unsubscribed')">
              <div class="stat-label-group">
                <span class="status-dot dot-orange"></span>
                <span class="stat-label">Désabonnements</span>
              </div>
              <div class="stat-value">
                {{ stats.unsubscribeCount }}/{{ stats.deliveredCount }} ({{ getPercentage(stats.unsubscribeCount, stats.deliveredCount) }}%)
              </div>
            </div>

            <!-- Divider for Rates -->
            <div style="margin: 10px 0; border-top: 2px solid #e0e0e0;"></div>
            <h4 style="margin: 10px 0 15px 0; font-size: 14px; font-weight: 600; color: #555;">Taux de Performance</h4>

            <!-- Open Rate -->
            <div class="stat-row">
              <div class="stat-label-group">
                <span class="status-dot dot-blue"></span>
                <span class="stat-label">Taux d'ouverture</span>
              </div>
              <div class="stat-value">
                {{ stats.openRate }}%
              </div>
            </div>

            <!-- Click Rate -->
            <div class="stat-row">
              <div class="stat-label-group">
                <span class="status-dot dot-purple"></span>
                <span class="stat-label">Taux de clic</span>
              </div>
              <div class="stat-value">
                {{ stats.clickRate }}%
              </div>
            </div>

            <!-- Click-to-Open Rate -->
            <div class="stat-row">
              <div class="stat-label-group">
                <span class="status-dot dot-purple"></span>
                <span class="stat-label">Taux de clic/ouverture</span>
              </div>
              <div class="stat-value">
                {{ stats.clickToOpenRate }}%
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container { padding: 0; }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #eee;
    }
    h2 { margin: 0; font-size: 18px; font-weight: 500; }
    .dialog-content { padding: 24px; }
    
    .loading-spinner { display: flex; justify-content: center; padding: 40px; }
    
    .campaign-title { margin: 0 0 5px 0; font-size: 16px; font-weight: 600; color: #333; }
    .campaign-date { margin: 0 0 25px 0; font-size: 13px; color: #777; }
    
    .stats-list { display: flex; flex-direction: column; gap: 15px; }
    .stat-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
    .stat-row:last-child { border-bottom: none; }
    .stat-row.clickable { cursor: pointer; transition: background-color 0.2s; }
    .stat-row.clickable:hover { background-color: #f5f5f5; }
    
    .stat-label-group { display: flex; align-items: center; gap: 12px; }
    .stat-label { font-size: 14px; color: #444; }
    .stat-value { font-weight: 500; color: #333; display: flex; align-items: center; gap: 5px; }
    
    .status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .dot-gray { background-color: #9e9e9e; }
    .dot-green { background-color: #4caf50; }
    .dot-red { background-color: #f44336; }
    .dot-blue { background-color: #2196f3; }
    .dot-purple { background-color: #9c27b0; }
    .dot-orange { background-color: #ff9800; }
    .dot-hollow-blue { border: 2px solid #2196f3; background-color: transparent; }
    .dot-hollow-purple { border: 2px solid #9c27b0; background-color: transparent; }
    .dot-hollow-green { border: 2px solid #4caf50; width: 8px; height: 8px; background: transparent; }
    .dot-hollow-red { border: 2px solid #f44336; width: 8px; height: 8px; background: transparent; }
    
    .help-icon { font-size: 16px; height: 16px; width: 16px; color: #999; cursor: help; }
  `]
})
export class CampaignStatsComponent implements OnInit {
  stats: CampaignStats | null = null;
  isLoading = true;

  constructor(
    private campaignService: CampaignService,
    private dialogRef: MatDialogRef<CampaignStatsComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { campaignId: number }
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.campaignService.getCampaignStats(this.data.campaignId).subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.isLoading = false;
      }
    });
  }

  getPercentage(count: number, total: number): number {
    if (!total || total === 0) return 0;
    return Math.round((count / total) * 100);
  }

  viewUsers(type: string): void {
    // TODO: Open dialog to show user list for this metric
    console.log('View users for:', type, 'Campaign ID:', this.data.campaignId);
    this.snackBar.open(`Affichage des utilisateurs: ${type}`, 'Fermer', { duration: 2000 });
  }

  close(): void {
    this.dialogRef.close();
  }
}
