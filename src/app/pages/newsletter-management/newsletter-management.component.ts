import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { NewsletterSubscriberService, NewsletterSubscriber, NewsletterStatistics } from '../../services/newsletter-subscriber.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-newsletter-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  templateUrl: './newsletter-management.component.html',
  styleUrl: './newsletter-management.component.scss'
})
export class NewsletterManagementComponent implements OnInit {
  subscribers: NewsletterSubscriber[] = [];
  displayedColumns: string[] = ['email', 'name', 'status', 'subscribedAt', 'totalEmailsSent', 'actions'];
  
  filtersForm!: FormGroup;
  addSubscriberForm!: FormGroup;
  
  loading = false;
  showAddForm = false;
  
  // Pagination
  pageSize = 50;
  pageIndex = 0;
  totalSubscribers = 0;
  pageSizeOptions = [25, 50, 100, 200];
  
  // Statistics
  statistics: NewsletterStatistics = {
    active: 0,
    unsubscribed: 0,
    bounced: 0,
    complained: 0
  };
  
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'UNSUBSCRIBED', label: 'Unsubscribed' },
    { value: 'BOUNCED', label: 'Bounced' },
    { value: 'COMPLAINED', label: 'Complained' }
  ];

  constructor(
    private fb: FormBuilder,
    private subscriberService: NewsletterSubscriberService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadStatistics();
    this.loadSubscribers();
    this.setupFilters();
  }

  initForms(): void {
    this.filtersForm = this.fb.group({
      search: [''],
      status: [''],
      dateFrom: [''],
      dateTo: ['']
    });

    this.addSubscriberForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      phone: ['']
    });
  }

  setupFilters(): void {
    this.filtersForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadSubscribers();
      });
  }

  loadStatistics(): void {
    this.subscriberService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  loadSubscribers(): void {
    this.loading = true;
    const filters = this.filtersForm.value;

    this.subscriberService.searchSubscribers(
      filters.status || undefined,
      filters.search || undefined,
      filters.dateFrom ? new Date(filters.dateFrom).toISOString() : undefined,
      filters.dateTo ? new Date(filters.dateTo).toISOString() : undefined,
      this.pageIndex,
      this.pageSize
    ).subscribe({
      next: (response) => {
        this.subscribers = response.content;
        this.totalSubscribers = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading subscribers:', error);
        this.snackBar.open('Error loading subscribers', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSubscribers();
  }

  clearFilters(): void {
    this.filtersForm.reset({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.addSubscriberForm.reset();
    }
  }

  addSubscriber(): void {
    if (this.addSubscriberForm.invalid) return;

    const formValue = this.addSubscriberForm.value;
    this.subscriberService.subscribe(
      formValue.email,
      formValue.name,
      formValue.phone,
      'manual'
    ).subscribe({
      next: () => {
        this.snackBar.open('Subscriber added successfully', 'Close', { duration: 3000 });
        this.addSubscriberForm.reset();
        this.showAddForm = false;
        this.loadSubscribers();
        this.loadStatistics();
      },
      error: (error) => {
        this.snackBar.open(error.error?.error || 'Error adding subscriber', 'Close', { duration: 3000 });
      }
    });
  }

  unsubscribeSubscriber(subscriber: NewsletterSubscriber): void {
    if (!confirm(`Unsubscribe ${subscriber.email}?`)) return;

    this.subscriberService.unsubscribeByEmail(subscriber.email, 'Admin action').subscribe({
      next: () => {
        this.snackBar.open('Subscriber unsubscribed successfully', 'Close', { duration: 3000 });
        this.loadSubscribers();
        this.loadStatistics();
      },
      error: (error) => {
        this.snackBar.open('Error unsubscribing subscriber', 'Close', { duration: 3000 });
      }
    });
  }

  deleteSubscriber(subscriber: NewsletterSubscriber): void {
    if (!confirm(`Permanently delete ${subscriber.email}? This action cannot be undone.`)) return;

    this.subscriberService.deleteSubscriber(subscriber.id).subscribe({
      next: () => {
        this.snackBar.open('Subscriber deleted successfully', 'Close', { duration: 3000 });
        this.loadSubscribers();
        this.loadStatistics();
      },
      error: (error) => {
        this.snackBar.open('Error deleting subscriber', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'primary';
      case 'UNSUBSCRIBED': return 'warn';
      case 'BOUNCED': return 'accent';
      case 'COMPLAINED': return 'warn';
      default: return '';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
