import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BlockedEmail {
  id: number;
  email: string;
  reason: string;
  blockedAt: string;
  ipAddress: string;
  userAgent: string;
}

export interface BlockEmailRequest {
  email: string;
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailBlocklistService {
  private apiUrl = `${environment.apiUrl}/api/admin/email-blocklist`;

  constructor(private http: HttpClient) {}

  getAllBlockedEmails(): Observable<BlockedEmail[]> {
    return this.http.get<BlockedEmail[]>(this.apiUrl);
  }

  checkEmail(email: string): Observable<{ email: string; isBlocked: boolean }> {
    return this.http.get<{ email: string; isBlocked: boolean }>(`${this.apiUrl}/check`, {
      params: { email }
    });
  }

  blockEmail(request: BlockEmailRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/block`, request);
  }

  unblockEmail(email: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/unblock`, {
      params: { email }
    });
  }
}
