import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NewsletterSubscriber {
  id: number;
  email: string;
  name: string;
  phone?: string;
  status: 'ACTIVE' | 'UNSUBSCRIBED';
  subscribedAt: string;
  unsubscribedAt?: string;
  unsubscribeReason?: string;
  emailBounced: boolean;
  bounceCount: number;
  lastEmailSentAt?: string;
  totalEmailsSent: number;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionAuditLog {
  id: number;
  subscriberId: number;
  subscriberEmail: string;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  performedBy: string;
  adminId?: number;
  createdAt: string;
}

export interface NewsletterStatistics {
  active: number;
  unsubscribed: number;
}

@Injectable({
  providedIn: 'root'
})
export class NewsletterSubscriberService {
  private apiUrl = `${environment.apiUrl}/api/newsletter-subscribers`;

  constructor(private http: HttpClient) {}

  getAllSubscribers(page: number = 0, size: number = 50, sortBy: string = 'subscribedAt', sortDir: string = 'DESC'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.http.get<any>(this.apiUrl, { params });
  }

  getActiveSubscribers(page: number = 0, size: number = 50): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/active`, { params });
  }

  searchSubscribers(
    status?: string,
    search?: string,
    page: number = 0,
    size: number = 50
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);

    return this.http.get<any>(`${this.apiUrl}/search`, { params });
  }

  getSubscriberById(id: number): Observable<NewsletterSubscriber> {
    return this.http.get<NewsletterSubscriber>(`${this.apiUrl}/${id}`);
  }

  getSubscriberAuditLog(id: number): Observable<SubscriptionAuditLog[]> {
    return this.http.get<SubscriptionAuditLog[]>(`${this.apiUrl}/${id}/audit-log`);
  }

  subscribe(email: string, name: string, phone?: string, source?: string, recaptchaToken?: string): Observable<NewsletterSubscriber> {
    return this.http.post<NewsletterSubscriber>(`${this.apiUrl}/subscribe`, {
      email,
      name,
      phone,
      source: source || 'manual',
      recaptchaToken
    });
  }

  updateSubscriber(id: number, subscriber: Partial<NewsletterSubscriber>): Observable<NewsletterSubscriber> {
    return this.http.put<NewsletterSubscriber>(`${this.apiUrl}/${id}`, subscriber);
  }

  deleteSubscriber(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  unsubscribeByEmail(email: string, reason?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/unsubscribe-by-email`, {
      email,
      reason: reason || 'User requested unsubscribe'
    });
  }

  getStatistics(): Observable<NewsletterStatistics> {
    return this.http.get<NewsletterStatistics>(`${this.apiUrl}/statistics`);
  }

  sendBulkEmail(subscriberIds: number[], templateId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-bulk-email`, {
      subscriberIds,
      templateId
    });
  }
}
