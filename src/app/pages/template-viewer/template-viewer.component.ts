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
    if (this.slug) {
      this.loadTemplate();
    } else {
      this.error = true;
      this.isLoading = false;
    }
  }

  loadTemplate(): void {
    this.customTemplateService.getTemplateBySlug(this.slug).subscribe({
      next: (template) => {
        this.template = template;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading template:', error);
        this.error = true;
        this.isLoading = false;
      }
    });
  }
}
