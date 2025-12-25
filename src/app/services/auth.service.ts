import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  token: string;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private tokenKey = 'admin_token';
  private userKey = 'admin_user';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          this.setSession(response);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem(this.tokenKey, authResult.token);
    localStorage.setItem(this.userKey, JSON.stringify({
      username: authResult.username,
      email: authResult.email
    }));
    localStorage.setItem('login_time', Date.now().toString());
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('login_time');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/admin/authentication/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  isLoggedIn(): boolean {
    const hasToken = this.hasToken();
    console.log('AuthService.isLoggedIn() called, hasToken:', hasToken);
    if (hasToken) {
      const token = this.getToken();
      console.log('Token:', token?.substring(0, 20) + '...');
    }
    return hasToken;
  }

  getCurrentUser(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }
}
