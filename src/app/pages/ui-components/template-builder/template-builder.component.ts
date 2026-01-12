import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CustomTemplateService, CustomTemplate, TemplateImage, CreateCustomTemplateRequest } from '../../../services/custom-template.service';
import { UploadService } from '../../../services/upload.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-template-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    MatDialogModule,
    DragDropModule
  ],
  templateUrl: './template-builder.component.html',
  styleUrls: ['./template-builder.component.scss']
})
export class TemplateBuilderComponent implements OnInit {
  // Static data for testing
  templateName: string = 'Test Template';
  backgroundColor: string = '#ffffff';
  images: TemplateImage[] = [
    { imageUrl: 'https://via.placeholder.com/300x200', displayOrder: 0, altText: 'Image 1' },
    { imageUrl: 'https://via.placeholder.com/300x200', displayOrder: 1, altText: 'Image 2' }
  ];
  templates: CustomTemplate[] = [
    {
      id: 1,
      name: 'Static Template 1',
      slug: 'static-template-1',
      backgroundColor: '#ffffff',
      publicUrl: 'http://example.com/static-template-1',
      images: [
        { id: 1, imageUrl: 'https://via.placeholder.com/300x200', displayOrder: 0, altText: 'Static Image 1' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: false
    },
    {
      id: 2,
      name: 'Static Template 2',
      slug: 'static-template-2',
      backgroundColor: '#f0f0f0',
      publicUrl: 'http://example.com/static-template-2',
      images: [
        { id: 2, imageUrl: 'https://via.placeholder.com/300x200', displayOrder: 0, altText: 'Static Image 2' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: false
    }
  ];
  
  isUploading = false;
  isCreating = false;
  isLoading = false;
  
  displayedColumns: string[] = ['preview', 'order', 'url', 'actions'];

  constructor(
    private customTemplateService: CustomTemplateService,
    private uploadService: UploadService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('=== TemplateBuilderComponent ngOnInit START (STATIC MODE) ===');
    console.log('Component initialized at:', new Date().toISOString());
    console.log('Current route:', this.router.url);
    console.log('Using static data - no API calls');
    // this.loadTemplates(); // COMMENTED OUT - using static data
  }

  // COMMENTED OUT - using static data
  // loadTemplates(): void {
  //   console.log('=== loadTemplates() called ===');
  //   console.log('Setting isLoading to true');
  //   this.isLoading = true;
  //   
  //   console.log('Calling customTemplateService.getAllTemplates()...');
  //   this.customTemplateService.getAllTemplates().subscribe({
  //     next: (templates) => {
  //       console.log('=== getAllTemplates SUCCESS ===');
  //       console.log('Received templates:', templates);
  //       console.log('Number of templates:', templates.length);
  //       this.templates = templates;
  //       this.isLoading = false;
  //       console.log('isLoading set to false');
  //     },
  //     error: (error) => {
  //       console.error('=== getAllTemplates ERROR ===');
  //       console.error('Error object:', error);
  //       console.error('Error status:', error.status);
  //       console.error('Error message:', error.message);
  //       console.error('Error statusText:', error.statusText);
  //       console.error('Full error:', JSON.stringify(error, null, 2));
  //       this.showSnackBar('Erreur lors du chargement des templates', 'error');
  //       this.isLoading = false;
  //       console.log('isLoading set to false after error');
  //     }
  //   });
  // }

  loadTemplates(): void {
    console.log('loadTemplates() called - using static data');
  }

  onFileSelected(event: Event): void {
    console.log('onFileSelected() called - DISABLED in static mode');
    // const input = event.target as HTMLInputElement;
    // if (input.files && input.files.length > 0) {
    //   const files = Array.from(input.files);
    //   this.uploadImages(files);
    // }
  }

  // COMMENTED OUT - using static data
  // uploadImages(files: File[]): void {
  //   this.isUploading = true;
  //   let uploadedCount = 0;
  //   let failedCount = 0;
  //
  //   files.forEach((file, index) => {
  //     this.uploadService.uploadImage(file).subscribe({
  //       next: (response) => {
  //         const newImage: TemplateImage = {
  //           imageUrl: response.url,
  //           displayOrder: this.images.length,
  //           altText: file.name
  //         };
  //         this.images.push(newImage);
  //         uploadedCount++;
  //         
  //         if (uploadedCount + failedCount === files.length) {
  //           this.isUploading = false;
  //           this.showSnackBar(`${uploadedCount} image(s) téléchargée(s) avec succès`, 'success');
  //         }
  //       },
  //       error: (error) => {
  //         console.error('Error uploading image:', error);
  //         failedCount++;
  //         
  //         if (uploadedCount + failedCount === files.length) {
  //           this.isUploading = false;
  //           this.showSnackBar(`${failedCount} image(s) échouée(s)`, 'error');
  //         }
  //       }
  //     });
  //   });
  // }

  uploadImages(files: File[]): void {
    console.log('uploadImages() called - DISABLED in static mode');
  }

  drop(event: CdkDragDrop<TemplateImage[]>): void {
    moveItemInArray(this.images, event.previousIndex, event.currentIndex);
    this.updateImageOrders();
  }

  updateImageOrders(): void {
    this.images.forEach((img, index) => {
      img.displayOrder = index;
    });
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
    this.updateImageOrders();
  }

  moveUp(index: number): void {
    if (index > 0) {
      [this.images[index], this.images[index - 1]] = [this.images[index - 1], this.images[index]];
      this.updateImageOrders();
    }
  }

  moveDown(index: number): void {
    if (index < this.images.length - 1) {
      [this.images[index], this.images[index + 1]] = [this.images[index + 1], this.images[index]];
      this.updateImageOrders();
    }
  }

  createTemplate(): void {
    console.log('createTemplate() called - DISABLED in static mode');
    this.showSnackBar('Mode statique - création désactivée', 'error');
    // if (!this.templateName.trim()) {
    //   this.showSnackBar('Veuillez entrer un nom de template', 'error');
    //   return;
    // }
    //
    // if (this.images.length === 0) {
    //   this.showSnackBar('Veuillez ajouter au moins une image', 'error');
    //   return;
    // }
    //
    // this.isCreating = true;
    //
    // const request: CreateCustomTemplateRequest = {
    //   name: this.templateName,
    //   backgroundColor: this.backgroundColor,
    //   images: this.images
    // };
    //
    // this.customTemplateService.createTemplate(request).subscribe({
    //   next: (template) => {
    //     this.isCreating = false;
    //     this.showSnackBar('Template créé avec succès!', 'success');
    //     
    //     // Show the public URL
    //     this.showTemplateUrl(template);
    //     
    //     // Reset form
    //     this.resetForm();
    //     this.loadTemplates();
    //   },
    //   error: (error) => {
    //     console.error('Error creating template:', error);
    //     this.showSnackBar('Erreur lors de la création du template', 'error');
    //     this.isCreating = false;
    //   }
    // });
  }

  showTemplateUrl(template: CustomTemplate): void {
    const message = `Template créé! URL: ${template.publicUrl}`;
    this.snackBar.open(message, 'Copier', {
      duration: 10000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: 'snack-bar-success'
    }).onAction().subscribe(() => {
      this.copyToClipboard(template.publicUrl);
    });
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.showSnackBar('URL copiée dans le presse-papiers', 'success');
    }).catch(err => {
      console.error('Error copying to clipboard:', err);
    });
  }

  resetForm(): void {
    this.templateName = '';
    this.backgroundColor = '#ffffff';
    this.images = [];
  }

  deleteTemplate(id: number): void {
    console.log('deleteTemplate() called - DISABLED in static mode');
    this.showSnackBar('Mode statique - suppression désactivée', 'error');
    // if (confirm('Êtes-vous sûr de vouloir supprimer ce template?')) {
    //   this.customTemplateService.deleteTemplate(id).subscribe({
    //     next: () => {
    //       this.showSnackBar('Template supprimé', 'success');
    //       this.loadTemplates();
    //     },
    //     error: (error) => {
    //       console.error('Error deleting template:', error);
    //       this.showSnackBar('Erreur lors de la suppression', 'error');
    //     }
    //   });
    // }
  }

  viewTemplate(slug: string): void {
    console.log('viewTemplate() called with slug:', slug);
    window.open(`/${slug}`, '_blank');
  }

  showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snack-bar-success' : 'snack-bar-error'
    });
  }
}
