import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-public-unsubscribe',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './public-unsubscribe.component.html',
  styleUrl: './public-unsubscribe.component.scss'
})
export class PublicUnsubscribeComponent implements OnInit {
  loading = true;
  success = false;
  error = false;
  message = '';
  email = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Get email from query parameter
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      
      if (this.email) {
        this.unsubscribe();
      } else {
        this.loading = false;
        this.error = true;
        this.message = 'Invalid unsubscribe link. No email address provided.';
      }
    });
  }

  unsubscribe(): void {
    // Use the email-based unsubscribe endpoint
    this.http.get(`${environment.apiUrl}/api/public/unsubscribe/email`, {
      params: { email: this.email }
    }).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = true;
        this.message = response.message || 'Vous avez été désinscrit avec succès de notre liste de diffusion.';
      },
      error: (error) => {
        this.loading = false;
        this.error = true;
        this.message = error.error?.error || 'Une erreur s\'est produite lors du traitement de votre demande. Veuillez réessayer plus tard.';
      }
    });
  }
}
