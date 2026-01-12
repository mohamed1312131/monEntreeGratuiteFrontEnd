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
  foire?: {
    id: number;
    name: string;
  };
  template?: {
    id: number;
    name: string;
  };
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
  date: string | null;
  heure: string | null;
  code: string | null;
  foireName: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class EmailCampaignService {
  private apiUrl = `${environment.apiUrl}/api/campaigns`;

  constructor(private http: HttpClient) {}

  getAllCampaigns(): Observable<EmailCampaign[]> {
    return this.http.get<EmailCampaign[]>(this.apiUrl);
  }

  getCampaignsByFoire(foireId: number): Observable<EmailCampaign[]> {
    return this.http.get<EmailCampaign[]>(`${this.apiUrl}/foire/${foireId}`);
  }

  getCampaignStats(campaignId: number): Observable<CampaignStats> {
    return this.http.get<CampaignStats>(`${this.apiUrl}/${campaignId}/stats`);
  }

  getCampaignUsers(campaignId: number, type: string): Observable<EmailLogUser[]> {
    return this.http.get<EmailLogUser[]>(`${this.apiUrl}/${campaignId}/users/${type}`);
  }
}
