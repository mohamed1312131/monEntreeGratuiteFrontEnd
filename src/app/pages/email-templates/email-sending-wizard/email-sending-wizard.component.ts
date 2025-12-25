import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EmailTemplateService } from '../../../services/email-template.service';
import { InvitationService } from '../../../services/invitation.service';
import { FoireService } from '../../../services/foire.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  htmlContent: string;
  isActive: boolean;
}

interface Invitation {
  id: number;
  nom: string;
  email: string;
  date: string;
  heure: string;
  code: string;
  emailSent: boolean;
  foire?: { id: number; name: string };
  source?: string;
  createdAt?: string;
}

interface Foire {
  id: number;
  name: string;
}

@Component({
  selector: 'app-email-sending-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatBadgeModule
  ],
  templateUrl: './email-sending-wizard.component.html',
  styleUrl: './email-sending-wizard.component.scss'
})
export class EmailSendingWizardComponent implements OnInit {
  templateForm!: FormGroup;
  recipientsForm!: FormGroup;
  filtersForm!: FormGroup;
  
  templates: EmailTemplate[] = [];
  invitations: Invitation[] = [];
  filteredInvitations: Invitation[] = [];
  displayedInvitations: Invitation[] = [];
  foires: Foire[] = [];
  
  selectedTemplate: EmailTemplate | null = null;
  selectedInvitations: Invitation[] = [];
  previewInvitation: Invitation | null = null;
  
  loading = false;
  sending = false;
  sendProgress = 0;
  
  // Pagination
  pageSize = 50;
  pageIndex = 0;
  totalRecipients = 0;
  pageSizeOptions = [25, 50, 100, 200];
  
  // Source options
  sourceOptions = [
    { value: 'invitation', label: 'Invitations' },
    { value: 'newsletter', label: 'Newsletter Subscribers' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private emailTemplateService: EmailTemplateService,
    private invitationService: InvitationService,
    private foireService: FoireService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadTemplates();
    this.loadFoires();
    this.loadInvitations();
    this.setupFilters();
  }

  initForms(): void {
    this.templateForm = this.fb.group({
      templateId: ['', Validators.required]
    });

    this.recipientsForm = this.fb.group({
      selectAll: [false]
    });
    
    this.filtersForm = this.fb.group({
      search: [''],
      foireId: [''],
      source: [''],
      dateFrom: [''],
      dateTo: [''],
      emailSent: [false]
    });
  }

  loadTemplates(): void {
    this.loading = true;
    this.emailTemplateService.getActiveTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.snackBar.open('Error loading templates', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadFoires(): void {
    this.foireService.getAllFoires().subscribe({
      next: (foires) => {
        this.foires = foires;
      },
      error: (error) => {
        console.error('Error loading foires:', error);
      }
    });
  }

  loadInvitations(): void {
    this.loading = true;
    // Load larger dataset for filtering
    this.invitationService.getInvitations(0, 10000, false).subscribe({
      next: (response: any) => {
        this.invitations = response.content || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading invitations:', error);
        this.snackBar.open('Error loading invitations', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
  
  setupFilters(): void {
    this.filtersForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }
  
  applyFilters(): void {
    const filters = this.filtersForm.value;
    
    this.filteredInvitations = this.invitations.filter(invitation => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          invitation.nom?.toLowerCase().includes(searchLower) ||
          invitation.email?.toLowerCase().includes(searchLower) ||
          invitation.code?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Foire filter
      if (filters.foireId) {
        if (invitation.foire?.id !== filters.foireId) return false;
      }
      
      // Source filter (invitation vs newsletter)
      if (filters.source) {
        if (invitation.source !== filters.source) return false;
      }
      
      // Date range filter
      if (filters.dateFrom) {
        const invitationDate = new Date(invitation.createdAt || invitation.date);
        if (invitationDate < new Date(filters.dateFrom)) return false;
      }
      
      if (filters.dateTo) {
        const invitationDate = new Date(invitation.createdAt || invitation.date);
        if (invitationDate > new Date(filters.dateTo)) return false;
      }
      
      // Email sent filter
      if (filters.emailSent !== null && filters.emailSent !== '') {
        if (invitation.emailSent !== filters.emailSent) return false;
      }
      
      return true;
    });
    
    this.totalRecipients = this.filteredInvitations.length;
    this.pageIndex = 0;
    this.updateDisplayedInvitations();
  }
  
  updateDisplayedInvitations(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedInvitations = this.filteredInvitations.slice(startIndex, endIndex);
  }
  
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedInvitations();
  }
  
  clearFilters(): void {
    this.filtersForm.reset({
      search: '',
      foireId: '',
      source: '',
      dateFrom: '',
      dateTo: '',
      emailSent: false
    });
  }

  onTemplateSelected(): void {
    const templateId = this.templateForm.get('templateId')?.value;
    this.selectedTemplate = this.templates.find(t => t.id === templateId) || null;
  }

  toggleSelectAll(event: any): void {
    if (event.checked) {
      this.selectedInvitations = [...this.filteredInvitations];
    } else {
      this.selectedInvitations = [];
    }
    this.updateSelectAllState();
  }
  
  toggleSelectPage(event: any): void {
    if (event.checked) {
      this.displayedInvitations.forEach(inv => {
        if (!this.isSelected(inv)) {
          this.selectedInvitations.push(inv);
        }
      });
    } else {
      this.displayedInvitations.forEach(inv => {
        const index = this.selectedInvitations.findIndex(i => i.id === inv.id);
        if (index > -1) {
          this.selectedInvitations.splice(index, 1);
        }
      });
    }
    this.updateSelectAllState();
  }
  
  updateSelectAllState(): void {
    const allSelected = this.filteredInvitations.length > 0 && 
      this.selectedInvitations.length === this.filteredInvitations.length;
    this.recipientsForm.patchValue({ selectAll: allSelected }, { emitEvent: false });
  }

  toggleInvitation(invitation: Invitation): void {
    const index = this.selectedInvitations.findIndex(i => i.id === invitation.id);
    if (index > -1) {
      this.selectedInvitations.splice(index, 1);
    } else {
      this.selectedInvitations.push(invitation);
    }
    this.updateSelectAllState();
  }

  isSelected(invitation: Invitation): boolean {
    return this.selectedInvitations.some(i => i.id === invitation.id);
  }

  setPreviewInvitation(invitation: Invitation): void {
    this.previewInvitation = invitation;
  }

  getPreviewSubject(): string {
    if (!this.selectedTemplate || !this.previewInvitation) return '';
    
    let subject = this.selectedTemplate.subject;
    subject = subject.replace(/\{\{NOM\}\}/gi, this.previewInvitation.nom);
    subject = subject.replace(/\{\{EMAIL\}\}/gi, this.previewInvitation.email);
    subject = subject.replace(/\{\{DATE\}\}/gi, this.previewInvitation.date);
    subject = subject.replace(/\{\{HEURE\}\}/gi, this.previewInvitation.heure);
    subject = subject.replace(/\{\{CODE\}\}/gi, this.previewInvitation.code);
    
    return subject;
  }

  getPreviewHtml(): SafeHtml {
    if (!this.selectedTemplate || !this.previewInvitation) return '';
    
    let html = this.selectedTemplate.htmlContent;
    html = html.replace(/\{\{NOM\}\}/gi, this.previewInvitation.nom);
    html = html.replace(/\{\{EMAIL\}\}/gi, this.previewInvitation.email);
    html = html.replace(/\{\{DATE\}\}/gi, this.previewInvitation.date);
    html = html.replace(/\{\{HEURE\}\}/gi, this.previewInvitation.heure);
    html = html.replace(/\{\{CODE\}\}/gi, this.previewInvitation.code);
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  sendEmails(): void {
    if (!this.selectedTemplate || this.selectedInvitations.length === 0) {
      this.snackBar.open('Please select a template and recipients', 'Close', { duration: 3000 });
      return;
    }

    this.sending = true;
    this.sendProgress = 0;

    const request = {
      templateId: this.selectedTemplate.id,
      invitationIds: this.selectedInvitations.map(i => i.id)
    };

    this.invitationService.sendBulkEmails(request).subscribe({
      next: (response) => {
        this.sendProgress = 100;
        this.snackBar.open(
          `Emails sent! ${response.successfulEmails} successful, ${response.failedEmails} failed`,
          'Close',
          { duration: 5000 }
        );
        this.sending = false;
        
        setTimeout(() => {
          this.router.navigate(['/admin/ui-components/email-templates']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error sending emails:', error);
        this.snackBar.open('Error sending emails: ' + (error.error?.message || 'Unknown error'), 'Close', { duration: 5000 });
        this.sending = false;
        this.sendProgress = 0;
      }
    });

    const progressInterval = setInterval(() => {
      if (this.sendProgress < 90 && this.sending) {
        this.sendProgress += 10;
      } else {
        clearInterval(progressInterval);
      }
    }, 500);
  }

  cancel(): void {
    this.router.navigate(['/admin/ui-components/email-templates']);
  }
}
