import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ExcelUser {
  id: number;
  nom: string;
  email: string;
  date?: string;
  heure?: string;
  code?: string;
  foireId: number;
  foireName: string;
  createdAt?: string;
}

export interface ExcelUploadResponse {
  success: boolean;
  message: string;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: string[];
}

export interface EmailSendResponse {
  success: boolean;
  message: string;
  totalEmails: number;
  successfulEmails: number;
  failedEmails: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExcelUserService {
  private apiUrl = `${environment.apiUrl}/api/excel-users`;

  constructor(private http: HttpClient) {}

  uploadExcelFile(file: File, foireId: number): Observable<ExcelUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('foireId', foireId.toString());
    return this.http.post<ExcelUploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  getAllExcelUsers(): Observable<ExcelUser[]> {
    return this.http.get<ExcelUser[]>(`${this.apiUrl}`);
  }

  getExcelUsersByFoireId(foireId: number): Observable<ExcelUser[]> {
    return this.http.get<ExcelUser[]>(`${this.apiUrl}/foire/${foireId}`);
  }

  sendEmailsToAllUsers(foireId?: number, templateKey: string = 'excel-user-email'): Observable<EmailSendResponse> {
    let params = new HttpParams().set('templateKey', templateKey);
    if (foireId) {
      params = params.set('foireId', foireId.toString());
    }
    return this.http.post<EmailSendResponse>(`${this.apiUrl}/send-emails`, null, { params });
  }

  sendEmailsToSelected(request: { templateId: number; userIds: number[] }): Observable<EmailSendResponse> {
    return this.http.post<EmailSendResponse>(`${this.apiUrl}/send-emails-selected`, request);
  }

  deleteExcelUser(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  deleteExcelUsersByFoireId(foireId: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/foire/${foireId}`, { responseType: 'text' });
  }
}
