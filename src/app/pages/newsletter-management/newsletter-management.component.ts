import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NewsletterSubscriberService, NewsletterSubscriber, NewsletterStatistics } from '../../services/newsletter-subscriber.service';
import { EmailTemplateService, EmailTemplate } from '../../services/email-template.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-newsletter-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
    MatBadgeModule,
    MatCheckboxModule
  ],
  templateUrl: './newsletter-management.component.html',
  styleUrl: './newsletter-management.component.scss'
})
export class NewsletterManagementComponent implements OnInit {
  subscribers: NewsletterSubscriber[] = [];
  displayedColumns: string[] = ['select', 'email', 'name', 'status', 'subscribedAt', 'totalEmailsSent', 'actions'];
  
  selectedSubscribers = new Set<number>();
  emailTemplates: EmailTemplate[] = [];
  selectedTemplateId: number | null = null;
  sendingBulkEmail = false;
  
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
    unsubscribed: 0
  };
  
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'UNSUBSCRIBED', label: 'Unsubscribed' }
  ];

  constructor(
    private fb: FormBuilder,
    private subscriberService: NewsletterSubscriberService,
    private emailTemplateService: EmailTemplateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadStatistics();
    this.loadSubscribers();
    this.loadEmailTemplates();
    this.setupFilters();
  }

  initForms(): void {
    this.filtersForm = this.fb.group({
      search: [''],
      status: ['']
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

  loadEmailTemplates(): void {
    this.emailTemplateService.getActiveTemplates().subscribe({
      next: (templates) => {
        this.emailTemplates = templates;
      },
      error: (error) => {
        console.error('Error loading email templates:', error);
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
      status: ''
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
      default: return '';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  // Bulk selection methods
  isAllSelected(): boolean {
    return this.subscribers.length > 0 && this.subscribers.every(s => this.selectedSubscribers.has(s.id));
  }

  toggleAllSelection(): void {
    if (this.isAllSelected()) {
      this.selectedSubscribers.clear();
    } else {
      this.subscribers.forEach(s => this.selectedSubscribers.add(s.id));
    }
  }

  toggleSubscriberSelection(subscriberId: number): void {
    if (this.selectedSubscribers.has(subscriberId)) {
      this.selectedSubscribers.delete(subscriberId);
    } else {
      this.selectedSubscribers.add(subscriberId);
    }
  }

  isSelected(subscriberId: number): boolean {
    return this.selectedSubscribers.has(subscriberId);
  }

  getSelectedCount(): number {
    return this.selectedSubscribers.size;
  }

  clearSelection(): void {
    this.selectedSubscribers.clear();
  }

  sendBulkEmail(): void {
    if (this.selectedSubscribers.size === 0) {
      this.snackBar.open('Please select at least one subscriber', 'Close', { duration: 3000 });
      return;
    }

    if (!this.selectedTemplateId) {
      this.snackBar.open('Please select an email template', 'Close', { duration: 3000 });
      return;
    }

    const selectedIds = Array.from(this.selectedSubscribers);
    const activeCount = this.subscribers.filter(s => 
      selectedIds.includes(s.id) && s.status === 'ACTIVE'
    ).length;
    const unsubscribedCount = this.subscribers.filter(s => 
      selectedIds.includes(s.id) && s.status === 'UNSUBSCRIBED'
    ).length;

    let message = `Send email to ${activeCount} active subscriber(s)?`;
    if (unsubscribedCount > 0) {
      message += `\n\nNote: ${unsubscribedCount} unsubscribed user(s) will be automatically excluded.`;
    }

    if (!confirm(message)) return;

    this.sendingBulkEmail = true;
    this.subscriberService.sendBulkEmail(selectedIds, this.selectedTemplateId).subscribe({
      next: (result) => {
        const msg = `Email sent successfully!\n` +
          `Active: ${result.activeSubscribers}\n` +
          `Success: ${result.successCount}\n` +
          `Failed: ${result.failedCount}\n` +
          `Unsubscribed (filtered): ${result.unsubscribedFiltered}`;
        this.snackBar.open(msg, 'Close', { duration: 5000 });
        this.clearSelection();
        this.selectedTemplateId = null;
        this.loadSubscribers();
        this.sendingBulkEmail = false;
      },
      error: (error) => {
        this.snackBar.open('Error sending bulk email: ' + error.error?.error, 'Close', { duration: 5000 });
        this.sendingBulkEmail = false;
      }
    });
  }
}
