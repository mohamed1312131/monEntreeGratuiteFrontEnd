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
  templateName: string = '';
  backgroundColor: string = '#ffffff';
  images: TemplateImage[] = [];
  templates: CustomTemplate[] = [];
  
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
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.isLoading = true;
    this.customTemplateService.getAllTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.showSnackBar('Erreur lors du chargement des templates', 'error');
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.uploadImages(files);
    }
  }

  uploadImages(files: File[]): void {
    this.isUploading = true;
    let uploadedCount = 0;
    let failedCount = 0;

    files.forEach((file, index) => {
      this.uploadService.uploadImage(file).subscribe({
        next: (response) => {
          const newImage: TemplateImage = {
            imageUrl: response.url,
            displayOrder: this.images.length,
            altText: file.name
          };
          this.images.push(newImage);
          uploadedCount++;
          
          if (uploadedCount + failedCount === files.length) {
            this.isUploading = false;
            this.showSnackBar(`${uploadedCount} image(s) téléchargée(s) avec succès`, 'success');
          }
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          failedCount++;
          
          if (uploadedCount + failedCount === files.length) {
            this.isUploading = false;
            this.showSnackBar(`${failedCount} image(s) échouée(s)`, 'error');
          }
        }
      });
    });
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
    if (!this.templateName.trim()) {
      this.showSnackBar('Veuillez entrer un nom de template', 'error');
      return;
    }

    if (this.images.length === 0) {
      this.showSnackBar('Veuillez ajouter au moins une image', 'error');
      return;
    }

    this.isCreating = true;

    const request: CreateCustomTemplateRequest = {
      name: this.templateName,
      backgroundColor: this.backgroundColor,
      images: this.images
    };

    this.customTemplateService.createTemplate(request).subscribe({
      next: (template) => {
        this.isCreating = false;
        this.showSnackBar('Template créé avec succès!', 'success');
        
        // Show the public URL
        this.showTemplateUrl(template);
        
        // Reset form
        this.resetForm();
        this.loadTemplates();
      },
      error: (error) => {
        console.error('Error creating template:', error);
        this.showSnackBar('Erreur lors de la création du template', 'error');
        this.isCreating = false;
      }
    });
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
    if (confirm('Êtes-vous sûr de vouloir supprimer ce template?')) {
      this.customTemplateService.deleteTemplate(id).subscribe({
        next: () => {
          this.showSnackBar('Template supprimé', 'success');
          this.loadTemplates();
        },
        error: (error) => {
          console.error('Error deleting template:', error);
          this.showSnackBar('Erreur lors de la suppression', 'error');
        }
      });
    }
  }

  viewTemplate(slug: string): void {
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
