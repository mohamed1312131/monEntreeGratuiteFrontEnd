import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CustomTemplateService, CustomTemplate } from '../../services/custom-template.service';

@Component({
  selector: 'app-template-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './template-viewer.component.html',
  styleUrls: ['./template-viewer.component.scss']
})
export class TemplateViewerComponent implements OnInit {
  template: CustomTemplate | null = null;
  isLoading = true;
  error = false;
  slug: string = '';

  constructor(
    private route: ActivatedRoute,
    private customTemplateService: CustomTemplateService
  ) {}

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    console.log('=== TemplateViewerComponent ngOnInit ===');
    console.log('Extracted slug from URL:', this.slug);
    console.log('Full URL:', window.location.href);
    if (this.slug) {
      this.loadTemplate();
    } else {
      console.error('No slug found in URL');
      this.error = true;
      this.isLoading = false;
    }
  }

  loadTemplate(): void {
    console.log('=== loadTemplate() called ===');
    console.log('Fetching template with slug:', this.slug);
    this.customTemplateService.getTemplateBySlug(this.slug).subscribe({
      next: (template) => {
        console.log('=== Template loaded successfully ===');
        console.log('Template:', template);
        console.log('Images count:', template.images.length);
        this.template = template;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('=== Error loading template ===');
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        this.error = true;
        this.isLoading = false;
      }
    });
  }
}
