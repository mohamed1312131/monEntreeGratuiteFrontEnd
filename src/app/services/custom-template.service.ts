import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TemplateImage {
  id?: number;
  imageUrl: string;
  displayOrder: number;
  altText?: string;
}

export interface CustomTemplate {
  id: number;
  name: string;
  slug: string;
  backgroundColor: string;
  images: TemplateImage[];
  createdAt: string;
  updatedAt: string;
  active: boolean;
  publicUrl: string;
}

export interface CreateCustomTemplateRequest {
  name: string;
  backgroundColor: string;
  images: TemplateImage[];
}

@Injectable({
  providedIn: 'root'
})
export class CustomTemplateService {
  private apiUrl = `${environment.apiUrl}/custom-templates`;

  constructor(private http: HttpClient) {}

  createTemplate(request: CreateCustomTemplateRequest): Observable<CustomTemplate> {
    return this.http.post<CustomTemplate>(this.apiUrl, request);
  }

  getAllTemplates(): Observable<CustomTemplate[]> {
    console.log('=== CustomTemplateService.getAllTemplates() ===');
    console.log('API URL:', this.apiUrl);
    console.log('Making HTTP GET request...');
    return this.http.get<CustomTemplate[]>(this.apiUrl);
  }

  getTemplateById(id: number): Observable<CustomTemplate> {
    return this.http.get<CustomTemplate>(`${this.apiUrl}/${id}`);
  }

  getTemplateBySlug(slug: string): Observable<CustomTemplate> {
    return this.http.get<CustomTemplate>(`${this.apiUrl}/slug/${slug}`);
  }

  updateTemplate(id: number, request: CreateCustomTemplateRequest): Observable<CustomTemplate> {
    return this.http.put<CustomTemplate>(`${this.apiUrl}/${id}`, request);
  }

  deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
