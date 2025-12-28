import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService, AboutUs, AboutUsQA } from '../../../services/settings.service';

@Component({
  selector: 'app-edit-about-us',
  templateUrl: './edit-about-us.component.html',
  styleUrls: ['./edit-about-us.component.scss']
})
export class EditAboutUsComponent implements OnInit {
  aboutUs: AboutUs;
  imageFile: File | null = null;
  imageFileName = '';
  videoFile: File | null = null;
  videoFileName = '';
  isUploading = false;
  
  newQuestion = '';
  newResponse = '';

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
    if (this.aboutUs.videoUrl) {
      this.videoFileName = this.aboutUs.videoUrl.split('/').pop() || '';
    }
    if (!this.aboutUs.qaList) {
      this.aboutUs.qaList = [];
    }
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
      this.imageFileName = input.files[0].name;
    }
  }

  onVideoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.videoFile = input.files[0];
      this.videoFileName = input.files[0].name;
      this.aboutUs.videoUrl = '';
    }
  }

  onVideoUrlChange(): void {
    if (this.aboutUs.videoUrl && this.aboutUs.videoUrl.trim() !== '') {
      this.videoFile = null;
      this.videoFileName = '';
    }
  }

  onSave(): void {
    if (!this.aboutUs.title) {
      this.showSnackBar('Veuillez remplir le titre', 'error');
      return;
    }

    if (!this.aboutUs.qaList || this.aboutUs.qaList.length === 0) {
      this.showSnackBar('Veuillez ajouter au moins une question et réponse', 'error');
      return;
    }

    // Upload video first if new file selected
    if (this.videoFile) {
      this.isUploading = true;
      this.uploadVideo();
      return;
    }

    this.saveAboutUs();
  }

  uploadVideo(): void {
    if (!this.videoFile) return;

    const formData = new FormData();
    formData.append('file', this.videoFile);

    this.settingsService.uploadVideo(formData).subscribe({
      next: (response: any) => {
        this.aboutUs.videoUrl = response.url || response.secure_url || response;
        this.videoFile = null;
        this.saveAboutUs();
      },
      error: (error) => {
        console.error('Error uploading video:', error);
        this.showSnackBar('Erreur lors du téléchargement de la vidéo', 'error');
        this.isUploading = false;
      }
    });
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

  addQA(): void {
    if (!this.newQuestion.trim() || !this.newResponse.trim()) {
      this.showSnackBar('Veuillez remplir la question et la réponse', 'error');
      return;
    }

    const qa: AboutUsQA = {
      question: this.newQuestion,
      response: this.newResponse,
      displayOrder: this.aboutUs.qaList ? this.aboutUs.qaList.length : 0
    };

    if (!this.aboutUs.qaList) {
      this.aboutUs.qaList = [];
    }
    this.aboutUs.qaList.push(qa);
    
    this.newQuestion = '';
    this.newResponse = '';
  }

  removeQA(index: number): void {
    if (this.aboutUs.qaList) {
      this.aboutUs.qaList.splice(index, 1);
      this.aboutUs.qaList.forEach((qa, idx) => {
        qa.displayOrder = idx;
      });
    }
  }

  moveQAUp(index: number): void {
    if (this.aboutUs.qaList && index > 0) {
      const temp = this.aboutUs.qaList[index];
      this.aboutUs.qaList[index] = this.aboutUs.qaList[index - 1];
      this.aboutUs.qaList[index - 1] = temp;
      this.updateDisplayOrders();
    }
  }

  moveQADown(index: number): void {
    if (this.aboutUs.qaList && index < this.aboutUs.qaList.length - 1) {
      const temp = this.aboutUs.qaList[index];
      this.aboutUs.qaList[index] = this.aboutUs.qaList[index + 1];
      this.aboutUs.qaList[index + 1] = temp;
      this.updateDisplayOrders();
    }
  }

  private updateDisplayOrders(): void {
    if (this.aboutUs.qaList) {
      this.aboutUs.qaList.forEach((qa, index) => {
        qa.displayOrder = index;
      });
    }
  }
}
