import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EmailTemplateService } from '../../../services/email-template.service';
import { EmailTemplateConfig, TemplateSection, AVAILABLE_DYNAMIC_FIELDS, FONT_FAMILIES, FONT_SIZES, PRESET_COLORS, DynamicFieldOption } from '../../../models/email-template-config.interface';


@Component({
  selector: 'app-email-template-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatTabsModule,
    MatSelectModule,
    MatExpansionModule,
    MatCheckboxModule
  ],
  templateUrl: './email-template-editor.component.html',
  styleUrl: './email-template-editor.component.scss'
})
export class EmailTemplateEditorComponent implements OnInit {
  templateForm!: FormGroup;
  templateId: string | null = null;
  isViewMode = false;
  loading = false;
  saving = false;
  
  dynamicFields = AVAILABLE_DYNAMIC_FIELDS;
  fontFamilies = FONT_FAMILIES;
  fontSizes = FONT_SIZES;
  presetColors = PRESET_COLORS;

  headerImageFile: File | null = null;
  headerImagePreview: string | null = null;
  galleryFiles: File[] = [];
  galleryPreviews: string[] = [];
  uploadingImage = false;
  uploadedImages: any[] = [];

  socialLinks: any[] = [];
  
  @ViewChild('htmlEditor') htmlEditor!: ElementRef<HTMLTextAreaElement>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private emailTemplateService: EmailTemplateService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.templateId = this.route.snapshot.paramMap.get('id');
    this.isViewMode = this.route.snapshot.queryParamMap.get('view') === 'true';

    if (this.isViewMode) {
      this.templateForm.disable();
    }

    if (this.templateId) {
      this.loadTemplate();
    }
  }

  initForm(): void {
    this.templateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      htmlContent: ['', Validators.required],
      isActive: [true]
    });
  }

  loadTemplate(): void {
    if (!this.templateId) return;

    this.loading = true;
    this.emailTemplateService.getTemplateById(+this.templateId).subscribe({
      next: (template) => {
        this.templateForm.patchValue({
          name: template.name,
          subject: template.subject,
          htmlContent: template.htmlContent,
          isActive: template.isActive
        });
        this.uploadedImages = template.images || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading template:', error);
        this.snackBar.open('Error loading template', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  insertDynamicField(field: string): void {
    const textarea = this.htmlEditor?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = this.templateForm.get('htmlContent')?.value || '';
    
    const newValue = currentValue.substring(0, start) + field + currentValue.substring(end);
    this.templateForm.patchValue({ htmlContent: newValue });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + field.length, start + field.length);
    }, 0);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Please select an image file', 'Close', { duration: 3000 });
      return;
    }

    if (!this.templateId) {
      this.snackBar.open('Please save the template first before uploading images', 'Close', { duration: 3000 });
      return;
    }

    this.uploadingImage = true;
    this.emailTemplateService.uploadImage(+this.templateId, file).subscribe({
      next: (image) => {
        this.uploadedImages.push(image);
        this.snackBar.open('Image uploaded successfully', 'Close', { duration: 2000 });
        this.uploadingImage = false;
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.snackBar.open('Error uploading image', 'Close', { duration: 3000 });
        this.uploadingImage = false;
      }
    });
  }

  copyImageUrl(imageUrl: string): void {
    navigator.clipboard.writeText(imageUrl).then(() => {
      this.snackBar.open('Image URL copied to clipboard', 'Close', { duration: 2000 });
    });
  }

  deleteImage(imageId: number): void {
    if (!this.templateId || !confirm('Are you sure you want to delete this image?')) return;

    this.emailTemplateService.deleteImage(+this.templateId, imageId).subscribe({
      next: () => {
        this.uploadedImages = this.uploadedImages.filter(img => img.id !== imageId);
        this.snackBar.open('Image deleted successfully', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error deleting image:', error);
        this.snackBar.open('Error deleting image', 'Close', { duration: 3000 });
      }
    });
  }

  getPreviewHtml(): SafeHtml {
    let html = this.templateForm.get('htmlContent')?.value || '';
    
    this.dynamicFields.forEach(field => {
      const regex = new RegExp(field.key.replace(/[{}]/g, '\\$&'), 'gi');
      html = html.replace(regex, `<span class="dynamic-field">${field.placeholder}</span>`);
    });

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  saveTemplate(): void {
    if (this.templateForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.saving = true;
    const templateData = this.templateForm.value;

    if (this.templateId) {
      this.emailTemplateService.updateTemplate(+this.templateId, templateData).subscribe({
        next: () => {
          this.snackBar.open('Template updated successfully', 'Close', { duration: 2000 });
          this.saving = false;
          this.goBack();
        },
        error: (error) => {
          console.error('Error updating template:', error);
          this.snackBar.open('Error updating template', 'Close', { duration: 3000 });
          this.saving = false;
        }
      });
    } else {
      this.emailTemplateService.createTemplate(templateData).subscribe({
        next: (template) => {
          this.snackBar.open('Template created successfully', 'Close', { duration: 2000 });
          this.saving = false;
          this.router.navigate(['/admin/ui-components/email-templates/editor', template.id]);
        },
        error: (error) => {
          console.error('Error creating template:', error);
          this.snackBar.open('Error creating template', 'Close', { duration: 3000 });
          this.saving = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/ui-components/email-templates']);
  }
}
