import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AboutUs {
  id?: number;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  eventsCount?: string;
  visitorsCount?: string;
  exhibitorsCount?: string;
  isActive: boolean;
}

export interface Video {
  id?: number;
  name: string;
  link: string;
  description?: string;
  foireId?: number;
  isActive: boolean;
}

export interface SocialLinks {
  id?: number;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter?: string;
  youtube?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${environment.apiUrl}/api/settings`;

  constructor(private http: HttpClient) {}

  // About Us methods
  getAllAboutUs(): Observable<AboutUs[]> {
    return this.http.get<AboutUs[]>(`${this.apiUrl}/about-us`);
  }

  getActiveAboutUs(): Observable<AboutUs[]> {
    return this.http.get<AboutUs[]>(`${this.apiUrl}/about-us/active`);
  }

  getAboutUsById(id: number): Observable<AboutUs> {
    return this.http.get<AboutUs>(`${this.apiUrl}/about-us/${id}`);
  }

  createAboutUs(aboutUs: AboutUs): Observable<AboutUs> {
    return this.http.post<AboutUs>(`${this.apiUrl}/about-us`, aboutUs);
  }

  updateAboutUs(id: number, aboutUs: AboutUs): Observable<AboutUs> {
    return this.http.put<AboutUs>(`${this.apiUrl}/about-us/${id}`, aboutUs);
  }

  deleteAboutUs(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/about-us/${id}`);
  }

  toggleAboutUsActive(id: number): Observable<AboutUs> {
    return this.http.put<AboutUs>(`${this.apiUrl}/about-us/${id}/toggle`, {});
  }

  // Video methods
  getAllVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/videos`);
  }

  getActiveVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/videos/active`);
  }

  getVideoById(id: number): Observable<Video> {
    return this.http.get<Video>(`${this.apiUrl}/videos/${id}`);
  }

  createVideo(video: Video): Observable<Video> {
    return this.http.post<Video>(`${this.apiUrl}/videos`, video);
  }

  updateVideo(id: number, video: Video): Observable<Video> {
    return this.http.put<Video>(`${this.apiUrl}/videos/${id}`, video);
  }

  deleteVideo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/videos/${id}`);
  }

  toggleVideoActive(id: number): Observable<Video> {
    return this.http.put<Video>(`${this.apiUrl}/videos/${id}/toggle`, {});
  }

  // Social Links methods
  getSocialLinks(): Observable<SocialLinks> {
    return this.http.get<SocialLinks>(`${this.apiUrl}/social-links`);
  }

  updateSocialLinks(socialLinks: SocialLinks): Observable<SocialLinks> {
    return this.http.put<SocialLinks>(`${this.apiUrl}/social-links`, socialLinks);
  }

  // File upload methods
  uploadImage(formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/upload/image`, formData);
  }

  uploadVideo(formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/upload/video`, formData);
  }
}
