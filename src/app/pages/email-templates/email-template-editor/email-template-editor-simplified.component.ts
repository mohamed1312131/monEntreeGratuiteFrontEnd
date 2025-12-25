import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EmailTemplateService } from '../../../services/email-template.service';
import { TemplateBuilderService } from '../../../services/template-builder.service';
import { UploadService } from '../../../services/upload.service';
import { EmailTemplateConfig, AVAILABLE_DYNAMIC_FIELDS, FONT_FAMILIES, FONT_SIZES, PRESET_COLORS } from '../../../models/email-template-config.interface';

@Component({
  selector: 'app-email-template-editor-simplified',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatTabsModule
  ],
  templateUrl: './email-template-editor-simplified.component.html',
  styleUrl: './email-template-editor.component.scss'
})
export class EmailTemplateEditorSimplifiedComponent implements OnInit {
  templateForm!: FormGroup;
  templateId: string | null = null;
  loading = false;
  saving = false;
  
  dynamicFields = AVAILABLE_DYNAMIC_FIELDS;
  fontFamilies = FONT_FAMILIES;
  fontSizes = FONT_SIZES;
  presetColors = PRESET_COLORS;

  headerImagePreview: string | null = null;
  headerImageUrl: string | null = null;
  uploadingHeader = false;
  
  galleryPreviews: string[] = [];
  galleryImageUrls: string[] = [];
  uploadingGallery = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private emailTemplateService: EmailTemplateService,
    private templateBuilder: TemplateBuilderService,
    private uploadService: UploadService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.templateId = this.route.snapshot.paramMap.get('id');
    if (this.templateId) {
      this.loadTemplate();
    }
  }

  initForm(): void {
    this.templateForm = this.fb.group({
      // Basic Info
      name: ['', [Validators.required, Validators.minLength(3)]],
      subject: ['', [Validators.required]],
      isActive: [true],
      
      // Styling
      backgroundColor: ['#ffffff'],
      fontFamily: ['Arial, sans-serif'],
      fontSize: ['14px'],
      primaryColor: ['#1976D2'],
      
      // Header (removed from form, handled separately)
      headerImageUrl: [''],
      
      // Content Sections
      recipientNameText: [''],
      eventDateText: [''],
      eventTimeText: [''],
      ticketCodeText: [''],
      foireNameText: [''],
      customText1: [''],
      customText2: [''],
      
      // Button
      buttonEnabled: [false],
      buttonText: [''],
      buttonLink: [''],
      buttonBgColor: ['#1976D2'],
      buttonTextColor: ['#ffffff'],
      
      // GPS
      gpsEnabled: [false],
      gpsLabel: ['COORDONNÉES GPS'],
      gpsLatitude: [''],
      gpsLongitude: [''],
      
      // Gallery (removed from form, handled separately)
      galleryImageUrls: [''],
      
      // Footer
      includeSocialLinks: [true],
      includeUnsubscribe: [true]
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
          isActive: template.isActive
        });

        // Load configuration if exists
        if (template.templateConfig) {
          try {
            const config: EmailTemplateConfig = JSON.parse(template.templateConfig);
            this.loadConfigIntoForm(config);
          } catch (e) {
            console.error('Error parsing template config:', e);
          }
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading template:', error);
        this.snackBar.open('Error loading template', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadConfigIntoForm(config: EmailTemplateConfig): void {
    this.templateForm.patchValue({
      backgroundColor: config.backgroundColor,
      fontFamily: config.fontFamily,
      fontSize: config.fontSize,
      primaryColor: config.primaryColor,
      headerImageUrl: config.headerImage?.url || '',
      buttonEnabled: !!config.button,
      buttonText: config.button?.text || '',
      buttonLink: config.button?.link || '',
      buttonBgColor: config.button?.backgroundColor || '#1976D2',
      buttonTextColor: config.button?.textColor || '#ffffff',
      gpsEnabled: config.gpsCoordinates?.enabled || false,
      gpsLabel: config.gpsCoordinates?.label || 'COORDONNÉES GPS',
      gpsLatitude: config.gpsCoordinates?.latitude || '',
      gpsLongitude: config.gpsCoordinates?.longitude || '',
      includeSocialLinks: config.includeSocialLinks,
      includeUnsubscribe: config.includeUnsubscribe
    });

    if (config.headerImage?.url) {
      this.headerImagePreview = config.headerImage.url;
    }

    if (config.galleryImages && config.galleryImages.length > 0) {
      this.galleryPreviews = config.galleryImages;
      this.templateForm.patchValue({
        galleryImageUrls: config.galleryImages.join('\n')
      });
    }

    // Load sections into text fields
    if (config.sections) {
      config.sections.forEach((section, index) => {
        if (section.type === 'text') {
          if (index === 0) this.templateForm.patchValue({ customText1: section.content });
          if (index === 1) this.templateForm.patchValue({ customText2: section.content });
        }
      });
    }
  }

  buildConfigFromForm(): EmailTemplateConfig {
    const formValue = this.templateForm.value;
    
    const config: EmailTemplateConfig = {
      backgroundColor: formValue.backgroundColor,
      fontFamily: formValue.fontFamily,
      fontSize: formValue.fontSize,
      primaryColor: formValue.primaryColor,
      secondaryColor: formValue.primaryColor,
      
      headerImage: formValue.headerImageUrl ? {
        url: formValue.headerImageUrl,
        alt: 'Header Image'
      } : undefined,
      
      sections: this.buildSections(formValue),
      
      button: formValue.buttonEnabled ? {
        text: formValue.buttonText,
        link: formValue.buttonLink,
        backgroundColor: formValue.buttonBgColor,
        textColor: formValue.buttonTextColor
      } : undefined,
      
      gpsCoordinates: formValue.gpsEnabled ? {
        enabled: true,
        label: formValue.gpsLabel,
        latitude: formValue.gpsLatitude,
        longitude: formValue.gpsLongitude
      } : { enabled: false },
      
      galleryImages: formValue.galleryImageUrls ? 
        formValue.galleryImageUrls.split('\n').filter((url: string) => url.trim()) : [],
      
      includeSocialLinks: formValue.includeSocialLinks,
      includeUnsubscribe: formValue.includeUnsubscribe
    };
    
    return config;
  }

  buildSections(formValue: any): any[] {
    const sections = [];
    
    // Add dynamic fields and custom text in order
    // Use user's selected fontSize for all sections
    const userFontSize = formValue.fontSize || '16px';
    
    if (formValue.recipientNameText) {
      sections.push({
        id: 'name',
        type: 'dynamic-field',
        dynamicField: '{{NOM}}',
        styles: { fontSize: userFontSize, fontWeight: 'bold', textAlign: 'center' }
      });
    }
    
    if (formValue.eventDateText) {
      sections.push({
        id: 'date',
        type: 'dynamic-field',
        dynamicField: '{{DATE}}',
        styles: { fontSize: userFontSize, fontWeight: 'bold', textAlign: 'center' }
      });
    }
    
    if (formValue.eventTimeText) {
      sections.push({
        id: 'time',
        type: 'dynamic-field',
        dynamicField: '{{HEURE}}',
        styles: { fontSize: userFontSize, textAlign: 'center' }
      });
    }
    
    if (formValue.customText1) {
      sections.push({
        id: 'text1',
        type: 'text',
        content: formValue.customText1,
        styles: { textAlign: 'center', marginTop: '10px', fontSize: userFontSize }
      });
    }
    
    if (formValue.ticketCodeText) {
      sections.push({
        id: 'code',
        type: 'dynamic-field',
        dynamicField: 'Code: {{CODE}}',
        styles: { fontSize: userFontSize, fontWeight: 'bold', textAlign: 'center' }
      });
    }
    
    if (formValue.foireNameText) {
      sections.push({
        id: 'foire',
        type: 'dynamic-field',
        dynamicField: '{{FOIRE_NAME}}',
        styles: { fontSize: userFontSize, fontWeight: 'bold', textAlign: 'center', marginTop: '8px' }
      });
    }
    
    if (formValue.customText2) {
      sections.push({
        id: 'text2',
        type: 'text',
        content: formValue.customText2,
        styles: { textAlign: 'center', marginTop: '10px', fontSize: userFontSize }
      });
    }
    
    return sections;
  }

  getPreviewHtml(): SafeHtml {
    const config = this.buildConfigFromForm();
    const html = this.templateBuilder.generateHTML(config, []);
    const previewHtml = this.templateBuilder.replaceDynamicFields(html);
    return this.sanitizer.bypassSecurityTrustHtml(previewHtml);
  }

  onHeaderImageSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Please select an image file', 'Close', { duration: 3000 });
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.headerImagePreview = e.target.result;
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    this.uploadingHeader = true;
    this.uploadService.uploadImage(file).subscribe({
      next: (response) => {
        this.headerImageUrl = response.url;
        this.templateForm.patchValue({ headerImageUrl: response.url });
        this.snackBar.open('Header image uploaded successfully', 'Close', { duration: 2000 });
        this.uploadingHeader = false;
      },
      error: (error) => {
        console.error('Error uploading header image:', error);
        this.snackBar.open('Error uploading image', 'Close', { duration: 3000 });
        this.uploadingHeader = false;
        this.headerImagePreview = null;
      }
    });
  }

  removeHeaderImage(): void {
    this.headerImagePreview = null;
    this.headerImageUrl = null;
    this.templateForm.patchValue({ headerImageUrl: '' });
  }

  onGalleryImagesSelected(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    // Validate all files are images
    for (let i = 0; i < files.length; i++) {
      if (!files[i].type.startsWith('image/')) {
        this.snackBar.open('Please select only image files', 'Close', { duration: 3000 });
        return;
      }
    }

    this.uploadingGallery = true;
    const uploadPromises: Promise<string>[] = [];

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.galleryPreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const uploadPromise = new Promise<string>((resolve, reject) => {
        this.uploadService.uploadImage(file).subscribe({
          next: (response) => resolve(response.url),
          error: (error) => reject(error)
        });
      });
      uploadPromises.push(uploadPromise);
    }

    // Wait for all uploads to complete
    Promise.all(uploadPromises)
      .then((urls) => {
        this.galleryImageUrls.push(...urls);
        this.templateForm.patchValue({ 
          galleryImageUrls: this.galleryImageUrls.join('\n') 
        });
        this.snackBar.open(`${urls.length} image(s) uploaded successfully`, 'Close', { duration: 2000 });
        this.uploadingGallery = false;
      })
      .catch((error) => {
        console.error('Error uploading gallery images:', error);
        this.snackBar.open('Error uploading some images', 'Close', { duration: 3000 });
        this.uploadingGallery = false;
      });
  }

  removeGalleryImage(index: number): void {
    this.galleryPreviews.splice(index, 1);
    this.galleryImageUrls.splice(index, 1);
    this.templateForm.patchValue({ 
      galleryImageUrls: this.galleryImageUrls.join('\n') 
    });
  }

  saveTemplate(): void {
    if (this.templateForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.saving = true;
    const config = this.buildConfigFromForm();
    const html = this.templateBuilder.generateHTML(config, []);
    
    console.log('DEBUG - Generated HTML length:', html.length);
    console.log('DEBUG - Generated HTML preview:', html.substring(0, 200));
    console.log('DEBUG - Template config:', config);
    
    const templateData = {
      name: this.templateForm.value.name,
      subject: this.templateForm.value.subject,
      htmlContent: html,
      templateConfig: JSON.stringify(config),
      isActive: this.templateForm.value.isActive
    };

    if (this.templateId) {
      this.emailTemplateService.updateTemplate(+this.templateId, templateData).subscribe({
        next: () => {
          this.snackBar.open('Template updated successfully', 'Close', { duration: 2000 });
          this.saving = false;
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
