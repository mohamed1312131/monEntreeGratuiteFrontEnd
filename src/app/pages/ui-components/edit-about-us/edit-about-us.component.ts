import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService, AboutUs } from '../../../services/settings.service';

@Component({
  selector: 'app-edit-about-us',
  templateUrl: './edit-about-us.component.html',
  styleUrls: ['./edit-about-us.component.scss']
})
export class EditAboutUsComponent implements OnInit {
  aboutUs: AboutUs;
  imageFile: File | null = null;
  imageFileName = '';
  isUploading = false;

  constructor(
    public dialogRef: MatDialogRef<EditAboutUsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AboutUs,
    private settingsService: SettingsService,
    private snackBar: MatSnackBar
  ) {
    this.aboutUs = { ...data };
  }

  ngOnInit(): void {
    if (this.aboutUs.imageUrl) {
      this.imageFileName = this.aboutUs.imageUrl.split('/').pop() || '';
    }
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
      this.imageFileName = input.files[0].name;
    }
  }

  onSave(): void {
    if (!this.aboutUs.title || !this.aboutUs.description) {
      this.showSnackBar('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    // Upload image first if new file selected
    if (this.imageFile) {
      this.isUploading = true;
      this.uploadImage();
      return;
    }

    this.saveAboutUs();
  }

  uploadImage(): void {
    if (!this.imageFile) return;

    const formData = new FormData();
    formData.append('file', this.imageFile);

    this.settingsService.uploadImage(formData).subscribe({
      next: (response: any) => {
        this.aboutUs.imageUrl = response.url || response.secure_url || response;
        this.imageFile = null;
        this.saveAboutUs();
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.showSnackBar('Erreur lors du téléchargement de l\'image', 'error');
        this.isUploading = false;
      }
    });
  }

  saveAboutUs(): void {
    if (!this.aboutUs.id) {
      this.isUploading = false;
      return;
    }

    this.settingsService.updateAboutUs(this.aboutUs.id, this.aboutUs).subscribe({
      next: (updated) => {
        this.isUploading = false;
        this.showSnackBar('Section mise à jour avec succès', 'success');
        this.dialogRef.close(updated);
      },
      error: (error) => {
        console.error('Error updating About Us:', error);
        this.showSnackBar('Erreur lors de la mise à jour', 'error');
        this.isUploading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snack-bar-success' : 'snack-bar-error'
    });
  }
}
