import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SliderData {
  id: number;
  reference: string;
  imageUrl: string;
  order: number | null;
  isActive: boolean;
  foireId?: number;
  foireName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SliderService {
  private apiUrl = `${environment.apiUrl}/api/sliders`;

  constructor(private http: HttpClient) {}

  getAllSliders(): Observable<SliderData[]> {
    return this.http.get<SliderData[]>(this.apiUrl);
  }

  getActiveSliders(): Observable<SliderData[]> {
    return this.http.get<SliderData[]>(`${this.apiUrl}/active`);
  }

  createSlider(formData: FormData): Observable<SliderData> {
    return this.http.post<SliderData>(`${this.apiUrl}/create`, formData);
  }

  updateSlider(id: number, slider: Partial<SliderData>): Observable<SliderData> {
    return this.http.put<SliderData>(`${this.apiUrl}/${id}`, slider);
  }

  updateSliderWithImage(id: number, formData: FormData): Observable<SliderData> {
    return this.http.put<SliderData>(`${this.apiUrl}/${id}/update-with-image`, formData);
  }

  toggleActive(id: number): Observable<SliderData> {
    return this.http.put<SliderData>(`${this.apiUrl}/${id}/toggle-active`, {});
  }

  deleteSlider(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateSliderOrder(id: number, order: number): Observable<SliderData> {
    return this.http.put<SliderData>(`${this.apiUrl}/${id}/update-order?order=${order}`, {});
  }

  getSlidersByFoire(foireId: number): Observable<SliderData[]> {
    return this.http.get<SliderData[]>(`${this.apiUrl}/foire/${foireId}`);
  }

  getActiveSlidersByFoire(foireId: number): Observable<SliderData[]> {
    return this.http.get<SliderData[]>(`${this.apiUrl}/foire/${foireId}/active`);
  }

  updateSliderFoire(id: number, foireId: number | null): Observable<SliderData> {
    const url = foireId ? `${this.apiUrl}/${id}/update-foire?foireId=${foireId}` : `${this.apiUrl}/${id}/update-foire`;
    return this.http.put<SliderData>(url, {});
  }
}
