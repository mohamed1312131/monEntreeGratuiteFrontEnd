import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UploadResponse {
  url: string;
  public_id: string;
}

export interface UploadError {
  error: string;
  fileSize?: string;
  maxSize?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = `${environment.apiUrl}/api/upload`;
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  constructor(private http: HttpClient) {}

  /**
   * Validate file size before upload
   * @param file File to validate
   * @returns Error message if file is too large, null otherwise
   */
  validateFileSize(file: File): string | null {
    if (file.size > this.MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxSizeMB = (this.MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      return `File size (${fileSizeMB}MB) exceeds the ${maxSizeMB}MB limit. Please compress or resize the file.`;
    }
    return null;
  }

  uploadImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResponse>(`${this.apiUrl}/image`, formData);
  }

  uploadVideo(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResponse>(`${this.apiUrl}/video`, formData);
  }
}
