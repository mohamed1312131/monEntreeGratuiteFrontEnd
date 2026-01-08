import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EmailCampaign {
  id: number;
  name: string;
  sentAt: string;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
}

export interface CampaignStats {
  id: number;
  name: string;
  sentAt: string;
  totalRecipients: number;
  deliveredCount: number;
  failedCount: number;
  openCount: number;
  clickCount: number;
  unsubscribeCount: number;
  spamCount: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private apiUrl = `${environment.apiUrl}/api/campaigns`;

  constructor(private http: HttpClient) {}

  getCampaignsByFoire(foireId: number): Observable<EmailCampaign[]> {
    return this.http.get<EmailCampaign[]>(`${this.apiUrl}/foire/${foireId}`);
  }

  getCampaignStats(campaignId: number): Observable<CampaignStats> {
    return this.http.get<CampaignStats>(`${this.apiUrl}/${campaignId}/stats`);
  }

  getCampaignUsers(campaignId: number, type: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${campaignId}/users/${type}`);
  }
}
