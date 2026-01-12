import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmailCampaignService, CampaignStats } from '../../../services/email-campaign.service';

@Component({
  selector: 'app-campaign-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './campaign-stats.component.html',
  styleUrl: './campaign-stats.component.scss'
})
export class CampaignStatsComponent implements OnInit {
  stats: CampaignStats | null = null;
  isLoading = true;

  constructor(
    private campaignService: EmailCampaignService,
    private dialogRef: MatDialogRef<CampaignStatsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { campaignId: number; campaignName: string }
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.campaignService.getCampaignStats(this.data.campaignId).subscribe({
      next: (data: CampaignStats) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading stats:', error);
        this.isLoading = false;
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  getDeliveryRate(): number {
    if (!this.stats || this.stats.totalRecipients === 0) return 0;
    return Math.round((this.stats.deliveredCount / this.stats.totalRecipients) * 100);
  }

  getFailureRate(): number {
    if (!this.stats || this.stats.totalRecipients === 0) return 0;
    return Math.round((this.stats.failedCount / this.stats.totalRecipients) * 100);
  }
}
