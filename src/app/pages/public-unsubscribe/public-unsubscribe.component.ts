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
  token = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    
    if (this.token) {
      this.unsubscribe();
    } else {
      this.loading = false;
      this.error = true;
      this.message = 'Invalid unsubscribe link. Please check your email and try again.';
    }
  }

  unsubscribe(): void {
    this.http.get(`${environment.apiUrl}/api/public/unsubscribe/${this.token}`)
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          this.success = true;
          this.message = response.message || 'You have been successfully unsubscribed from our newsletter.';
        },
        error: (error) => {
          this.loading = false;
          this.error = true;
          this.message = error.error?.error || 'An error occurred while processing your request. Please try again later.';
        }
      });
  }
}
