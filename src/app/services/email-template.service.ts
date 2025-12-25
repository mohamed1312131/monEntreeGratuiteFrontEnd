import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  htmlContent: string;
  templateConfig?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images: EmailTemplateImage[];
}

export interface EmailTemplateImage {
  id: number;
  templateId: number;
  imageUrl: string;
  imageName: string;
  imageOrder: number;
  createdAt: string;
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
export class EmailTemplateService {
  private apiUrl = `${environment.apiUrl}/api/email-templates`;

  constructor(private http: HttpClient) {}

  createTemplate(template: Partial<EmailTemplate>): Observable<EmailTemplate> {
    return this.http.post<EmailTemplate>(this.apiUrl, template);
  }

  getAllTemplates(page: number = 0, size: number = 10, sortBy: string = 'createdAt', sortDir: string = 'DESC'): Observable<PagedResponse<EmailTemplate>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    
    return this.http.get<PagedResponse<EmailTemplate>>(this.apiUrl, { params });
  }

  getActiveTemplates(): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(`${this.apiUrl}/active`);
  }

  getTemplateById(id: number): Observable<EmailTemplate> {
    return this.http.get<EmailTemplate>(`${this.apiUrl}/${id}`);
  }

  updateTemplate(id: number, template: Partial<EmailTemplate>): Observable<EmailTemplate> {
    return this.http.put<EmailTemplate>(`${this.apiUrl}/${id}`, template);
  }

  deleteTemplate(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  uploadImage(templateId: number, file: File): Observable<EmailTemplateImage> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<EmailTemplateImage>(`${this.apiUrl}/${templateId}/images`, formData);
  }

  getTemplateImages(templateId: number): Observable<EmailTemplateImage[]> {
    return this.http.get<EmailTemplateImage[]>(`${this.apiUrl}/${templateId}/images`);
  }

  deleteImage(templateId: number, imageId: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${templateId}/images/${imageId}`, { responseType: 'text' });
  }
}
