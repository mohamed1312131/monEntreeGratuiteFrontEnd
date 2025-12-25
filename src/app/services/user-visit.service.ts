import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserVisitService {
  private apiUrl = `${environment.apiUrl}/api/track-visit`;

  constructor(private http: HttpClient) { }

  /**
   * Track a user visit to the site
   */
  trackVisit(): Observable<any> {
    return this.http.post(this.apiUrl, {});
  }
}
