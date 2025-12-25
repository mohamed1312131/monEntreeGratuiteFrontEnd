import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmailTemplateService } from '../../../services/email-template.service';

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  htmlContent: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images?: any[];
}

@Component({
  selector: 'app-email-template-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './email-template-list.component.html',
  styleUrl: './email-template-list.component.scss'
})
export class EmailTemplateListComponent implements OnInit {
  templates: EmailTemplate[] = [];
  displayedColumns: string[] = ['name', 'subject', 'status', 'createdAt', 'actions'];
  
  loading = false;
  searchTerm = '';
  
  pageSize = 10;
  pageIndex = 0;
  totalElements = 0;

  constructor(
    private emailTemplateService: EmailTemplateService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.emailTemplateService.getAllTemplates(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.templates = response.content;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.snackBar.open('Error loading templates', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTemplates();
  }

  searchTemplates(): void {
    this.pageIndex = 0;
    this.loadTemplates();
  }

  createTemplate(): void {
    this.router.navigate(['/admin/ui-components/email-templates/editor']);
  }

  editTemplate(template: EmailTemplate): void {
    this.router.navigate(['/admin/ui-components/email-templates/editor', template.id]);
  }

  viewTemplate(template: EmailTemplate): void {
    this.router.navigate(['/admin/ui-components/email-templates/editor', template.id], { 
      queryParams: { view: true } 
    });
  }

  deleteTemplate(template: EmailTemplate): void {
    if (confirm(`Are you sure you want to delete template "${template.name}"?`)) {
      this.emailTemplateService.deleteTemplate(template.id).subscribe({
        next: () => {
          this.snackBar.open('Template deleted successfully', 'Close', { duration: 3000 });
          this.loadTemplates();
        },
        error: (error) => {
          console.error('Error deleting template:', error);
          this.snackBar.open('Error deleting template', 'Close', { duration: 3000 });
        }
      });
    }
  }

  toggleStatus(template: EmailTemplate): void {
    const updatedTemplate = { ...template, isActive: !template.isActive };
    this.emailTemplateService.updateTemplate(template.id, updatedTemplate).subscribe({
      next: () => {
        template.isActive = !template.isActive;
        this.snackBar.open('Template status updated', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error updating template status:', error);
        this.snackBar.open('Error updating status', 'Close', { duration: 3000 });
      }
    });
  }

  getFilteredTemplates(): EmailTemplate[] {
    if (!this.searchTerm) {
      return this.templates;
    }
    const term = this.searchTerm.toLowerCase();
    return this.templates.filter(t => 
      t.name.toLowerCase().includes(term) || 
      t.subject.toLowerCase().includes(term)
    );
  }
}
