import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Invitation {
  id: number;
  nom: string;
  email: string;
  date?: string;
  heure?: string;
  code?: string;
  foireId?: number;
  foireName?: string;
  emailSent: boolean;
  sentAt?: string;
  createdAt: string;
}

export interface InvitationUploadResponse {
  success: boolean;
  message: string;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: string[];
}

export interface EmailSendRequest {
  templateId: number;
  invitationIds: number[];
}

export interface EmailSendResponse {
  success: boolean;
  message: string;
  totalEmails: number;
  successfulEmails: number;
  failedEmails: number;
}

export interface EmailPreviewRequest {
  templateId: number;
  invitationId: number;
}

export interface EmailPreviewResponse {
  subject: string;
  htmlContent: string;
  recipientName: string;
  recipientEmail: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private apiUrl = `${environment.apiUrl}/api/invitations`;

  constructor(private http: HttpClient) {}

  uploadExcel(file: File, foireId?: number): Observable<InvitationUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    let url = `${this.apiUrl}/upload`;
    if (foireId) {
      url += `?foireId=${foireId}`;
    }
    
    return this.http.post<InvitationUploadResponse>(url, formData);
  }

  uploadExcelFile(file: File): Observable<InvitationUploadResponse> {
    return this.uploadExcel(file);
  }

  getInvitations(
    page: number = 0, 
    size: number = 20, 
    emailSent?: boolean,
    foireId?: number
  ): Observable<PagedResponse<Invitation>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (emailSent !== undefined) {
      params = params.set('emailSent', emailSent.toString());
    }
    
    if (foireId !== undefined) {
      params = params.set('foireId', foireId.toString());
    }
    
    return this.http.get<PagedResponse<Invitation>>(this.apiUrl, { params });
  }

  getAllInvitations(
    page: number = 0, 
    size: number = 20, 
    sortBy: string = 'createdAt', 
    sortDir: string = 'DESC',
    emailSent?: boolean
  ): Observable<PagedResponse<Invitation>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    
    if (emailSent !== undefined) {
      params = params.set('emailSent', emailSent.toString());
    }
    
    return this.http.get<PagedResponse<Invitation>>(this.apiUrl, { params });
  }

  getInvitationById(id: number): Observable<Invitation> {
    return this.http.get<Invitation>(`${this.apiUrl}/${id}`);
  }

  deleteInvitation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  previewEmail(request: EmailPreviewRequest): Observable<EmailPreviewResponse> {
    return this.http.post<EmailPreviewResponse>(`${this.apiUrl}/preview`, request);
  }

  sendBulkEmails(request: EmailSendRequest): Observable<EmailSendResponse> {
    return this.http.post<EmailSendResponse>(`${this.apiUrl}/send-emails`, request);
  }

  sendEmails(request: EmailSendRequest): Observable<EmailSendResponse> {
    return this.sendBulkEmails(request);
  }
}
