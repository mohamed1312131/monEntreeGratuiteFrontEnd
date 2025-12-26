import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // Check if this is a public endpoint that should NOT have auth header
    const isPublicEndpoint = this.isPublicEndpoint(req.url, req.method);

    console.log('Interceptor - URL:', req.url);
    console.log('Interceptor - Has token:', !!token);
    console.log('Interceptor - Is public endpoint:', isPublicEndpoint);

    // Clone request and add authorization header if token exists AND it's not a public endpoint
    if (token && !isPublicEndpoint) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Interceptor - Added Authorization header');
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Interceptor - Error:', error.status, error.message);
        console.error('Interceptor - Current URL:', this.router.url);
        
        // Only redirect to login if we're on an admin route AND have a 401/403 error
        if ((error.status === 401 || error.status === 403) && this.router.url.startsWith('/admin')) {
          console.error('Interceptor - Logging out due to 401/403 error');
          // Unauthorized or Forbidden - logout and redirect to login
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }

  private isPublicEndpoint(url: string, method: string): boolean {
    // Public frontoffice endpoints that don't require authentication
    if (url.includes('/api/sliders/active')) return true;
    if (url.includes('/api/sliders/ordered')) return true;
    if (url.includes('/api/foires/getAllActive')) return true;
    if (url.includes('/api/settings/about-us/active')) return true;
    if (url.includes('/api/settings/videos/active')) return true;
    if (url.includes('/api/settings/social-links')) return true;
    
    // Public unsubscribe endpoint - no auth required
    if (url.includes('/api/public/unsubscribe')) return true;
    
    // Public newsletter subscribe endpoint - no auth required
    if (url.includes('/api/newsletter-subscribers/subscribe') && method === 'POST') return true;
    
    // Public visit tracking endpoint - no auth required
    if (url.includes('/api/visits/track') && method === 'POST') return true;
    
    // Only POST to /api/reservations is public (for creating reservations from frontoffice)
    // GET /api/reservations/* requires auth (for admin dashboard)
    if (url.includes('/api/reservations') && method === 'POST' && url.endsWith('/api/reservations')) {
      return true;
    }
    
    return false;
  }
}
