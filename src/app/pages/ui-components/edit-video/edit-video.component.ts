import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService, Video } from '../../../services/settings.service';

@Component({
  selector: 'app-edit-video',
  templateUrl: './edit-video.component.html',
  styleUrls: ['./edit-video.component.scss']
})
export class EditVideoComponent implements OnInit {
  video: Video;
  videoFile: File | null = null;
  videoFileName = '';
  isUploading = false;
  hasManualLink = false;

  constructor(
    public dialogRef: MatDialogRef<EditVideoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Video,
    private settingsService: SettingsService,
    private snackBar: MatSnackBar
  ) {
    this.video = { ...data };
  }

  ngOnInit(): void {
    if (this.video.link) {
      this.videoFileName = this.video.link.split('/').pop() || '';
    }
  }

  onVideoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.videoFile = input.files[0];
      this.videoFileName = input.files[0].name;
      this.hasManualLink = false;
    }
  }

  onVideoLinkChange(): void {
    if (this.video.link && this.video.link.trim() !== '') {
      this.videoFile = null;
      this.videoFileName = '';
      this.hasManualLink = true;
    } else {
      this.hasManualLink = false;
    }
  }

  onSave(): void {
    if (!this.video.name) {
      this.showSnackBar('Veuillez remplir le nom de la vidéo', 'error');
      return;
    }

    // Upload video first if new file selected
    if (this.videoFile) {
      this.isUploading = true;
      this.uploadVideo();
      return;
    }

    this.saveVideo();
  }

  uploadVideo(): void {
    if (!this.videoFile) return;

    const formData = new FormData();
    formData.append('file', this.videoFile);

    this.settingsService.uploadVideo(formData).subscribe({
      next: (response: any) => {
        this.video.link = response.url || response.secure_url || response;
        this.videoFile = null;
        this.saveVideo();
      },
      error: (error) => {
        console.error('Error uploading video:', error);
        this.showSnackBar('Erreur lors du téléchargement de la vidéo', 'error');
        this.isUploading = false;
      }
    });
  }

  saveVideo(): void {
    if (!this.video.id) {
      this.isUploading = false;
      return;
    }

    this.settingsService.updateVideo(this.video.id, this.video).subscribe({
      next: (updated) => {
        this.isUploading = false;
        this.showSnackBar('Vidéo mise à jour avec succès', 'success');
        this.dialogRef.close(updated);
      },
      error: (error) => {
        console.error('Error updating video:', error);
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
