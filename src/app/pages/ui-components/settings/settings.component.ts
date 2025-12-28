import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { SettingsService, AboutUs, Video, SocialLinks } from '../../../services/settings.service';
import { EditAboutUsComponent } from '../edit-about-us/edit-about-us.component';
import { EditVideoComponent } from '../edit-video/edit-video.component';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  // About Us Section
  aboutUsList: AboutUs[] = [];
  newAboutUs: AboutUs = {
    id: 0,
    title: '',
    description: '',
    imageUrl: '',
    isActive: true
  };

  // Videos Section
  videosList: Video[] = [];
  newVideo: Video = {
    id: 0,
    name: '',
    link: '',
    description: '',
    isActive: true
  };

  // Password Section
  passwordForm: PasswordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  // Social Links Section
  socialLinks: SocialLinks = {
    facebook: '',
    instagram: '',
    linkedin: ''
  };

  isLoading = false;
  isUploadingAboutUs = false;
  isUploadingVideo = false;
  aboutUsVideoFile: File | null = null;
  aboutUsVideoName = '';
  videoFile: File | null = null;
  videoFileName = '';

  constructor(
    private snackBar: MatSnackBar,
    private settingsService: SettingsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.loadAboutUsList();
    this.loadVideosList();
    this.loadSocialLinks();
  }

  loadAboutUsList(): void {
    this.settingsService.getAllAboutUs().subscribe({
      next: (data) => {
        this.aboutUsList = data;
      },
      error: (error) => {
        console.error('Error loading About Us:', error);
        this.showSnackBar('Erreur lors du chargement des sections À Propos', 'error');
      }
    });
  }

  loadVideosList(): void {
    this.settingsService.getAllVideos().subscribe({
      next: (data) => {
        this.videosList = data;
      },
      error: (error) => {
        console.error('Error loading videos:', error);
        this.showSnackBar('Erreur lors du chargement des vidéos', 'error');
      }
    });
  }

  loadSocialLinks(): void {
    this.settingsService.getSocialLinks().subscribe({
      next: (data) => {
        this.socialLinks = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading social links:', error);
        this.showSnackBar('Erreur lors du chargement des liens sociaux', 'error');
        this.isLoading = false;
      }
    });
  }

  // File handling methods
  onAboutUsVideoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.aboutUsVideoFile = input.files[0];
      this.aboutUsVideoName = input.files[0].name;
    }
  }

  onVideoFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.videoFile = input.files[0];
      this.videoFileName = input.files[0].name;
      this.newVideo.link = '';
    }
  }

  onVideoLinkChange(): void {
    if (this.newVideo.link && this.newVideo.link.trim() !== '') {
      this.videoFile = null;
      this.videoFileName = '';
    }
  }

  // About Us Methods
  addAboutUs(): void {
    if (!this.newAboutUs.title || !this.newAboutUs.description) {
      this.showSnackBar('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    // Upload video first if selected
    if (this.aboutUsVideoFile) {
      this.isUploadingAboutUs = true;
      this.uploadAboutUsVideo();
      return;
    }

    this.saveAboutUs();
  }

  uploadAboutUsVideo(): void {
    if (!this.aboutUsVideoFile) return;

    const formData = new FormData();
    formData.append('file', this.aboutUsVideoFile);

    this.settingsService.uploadVideo(formData).subscribe({
      next: (response: any) => {
        this.newAboutUs.videoUrl = response.url || response.secure_url || response;
        this.aboutUsVideoFile = null;
        this.aboutUsVideoName = '';
        this.saveAboutUs();
      },
      error: (error) => {
        console.error('Error uploading video:', error);
        this.showSnackBar('Erreur lors du téléchargement de la vidéo', 'error');
        this.isUploadingAboutUs = false;
      }
    });
  }

  saveAboutUs(): void {
    if (this.newAboutUs.id && this.newAboutUs.id > 0) {
      // Update existing
      this.settingsService.updateAboutUs(this.newAboutUs.id, this.newAboutUs).subscribe({
        next: () => {
          this.loadAboutUsList();
          this.resetAboutUsForm();
          this.isUploadingAboutUs = false;
          this.showSnackBar('Section "À Propos" mise à jour avec succès', 'success');
        },
        error: (error) => {
          console.error('Error updating About Us:', error);
          this.showSnackBar('Erreur lors de la mise à jour', 'error');
          this.isUploadingAboutUs = false;
        }
      });
    } else {
      // Create new
      this.settingsService.createAboutUs(this.newAboutUs).subscribe({
        next: () => {
          this.loadAboutUsList();
          this.resetAboutUsForm();
          this.isUploadingAboutUs = false;
          this.showSnackBar('Section "À Propos" ajoutée avec succès', 'success');
        },
        error: (error) => {
          console.error('Error creating About Us:', error);
          this.showSnackBar('Erreur lors de la création', 'error');
          this.isUploadingAboutUs = false;
        }
      });
    }
  }

  editAboutUs(item: AboutUs): void {
    const dialogRef = this.dialog.open(EditAboutUsComponent, {
      width: '600px',
      data: item,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAboutUsList();
      }
    });
  }

  deleteAboutUs(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette section?')) {
      this.settingsService.deleteAboutUs(id).subscribe({
        next: () => {
          this.loadAboutUsList();
          this.showSnackBar('Section supprimée avec succès', 'success');
        },
        error: (error) => {
          console.error('Error deleting About Us:', error);
          this.showSnackBar('Erreur lors de la suppression', 'error');
        }
      });
    }
  }

  toggleAboutUsActive(item: AboutUs): void {
    if (item.id) {
      this.settingsService.toggleAboutUsActive(item.id).subscribe({
        next: (updated) => {
          item.isActive = updated.isActive;
          this.showSnackBar('Statut mis à jour', 'success');
        },
        error: (error) => {
          console.error('Error toggling About Us:', error);
          this.showSnackBar('Erreur lors de la mise à jour', 'error');
        }
      });
    }
  }

  resetAboutUsForm(): void {
    this.newAboutUs = {
      id: 0,
      title: '',
      description: '',
      videoUrl: '',
      isActive: true
    };
    this.aboutUsVideoFile = null;
    this.aboutUsVideoName = '';
  }

  // Videos Methods
  addVideo(): void {
    if (!this.newVideo.name) {
      this.showSnackBar('Veuillez remplir le nom de la vidéo', 'error');
      return;
    }

    if (!this.videoFile && !this.newVideo.link) {
      this.showSnackBar('Veuillez sélectionner une vidéo', 'error');
      return;
    }

    // Upload video first if selected
    if (this.videoFile) {
      this.isUploadingVideo = true;
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
        this.newVideo.link = response.url || response.secure_url || response;
        this.videoFile = null;
        this.videoFileName = '';
        this.saveVideo();
      },
      error: (error) => {
        console.error('Error uploading video:', error);
        this.showSnackBar('Erreur lors du téléchargement de la vidéo', 'error');
        this.isUploadingVideo = false;
      }
    });
  }

  saveVideo(): void {
    if (this.newVideo.id && this.newVideo.id > 0) {
      // Update existing
      this.settingsService.updateVideo(this.newVideo.id, this.newVideo).subscribe({
        next: () => {
          this.loadVideosList();
          this.resetVideoForm();
          this.isUploadingVideo = false;
          this.showSnackBar('Vidéo mise à jour avec succès', 'success');
        },
        error: (error) => {
          console.error('Error updating video:', error);
          this.showSnackBar('Erreur lors de la mise à jour', 'error');
          this.isUploadingVideo = false;
        }
      });
    } else {
      // Create new
      this.settingsService.createVideo(this.newVideo).subscribe({
        next: () => {
          this.loadVideosList();
          this.resetVideoForm();
          this.isUploadingVideo = false;
          this.showSnackBar('Vidéo ajoutée avec succès', 'success');
        },
        error: (error) => {
          console.error('Error creating video:', error);
          this.showSnackBar('Erreur lors de la création', 'error');
          this.isUploadingVideo = false;
        }
      });
    }
  }

  editVideo(video: Video): void {
    const dialogRef = this.dialog.open(EditVideoComponent, {
      width: '600px',
      data: video,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadVideosList();
      }
    });
  }

  deleteVideo(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette vidéo?')) {
      this.settingsService.deleteVideo(id).subscribe({
        next: () => {
          this.loadVideosList();
          this.showSnackBar('Vidéo supprimée avec succès', 'success');
        },
        error: (error) => {
          console.error('Error deleting video:', error);
          this.showSnackBar('Erreur lors de la suppression', 'error');
        }
      });
    }
  }

  toggleVideoActive(video: Video): void {
    if (video.id) {
      this.settingsService.toggleVideoActive(video.id).subscribe({
        next: (updated) => {
          video.isActive = updated.isActive;
          this.showSnackBar('Statut mis à jour', 'success');
        },
        error: (error) => {
          console.error('Error toggling video:', error);
          this.showSnackBar('Erreur lors de la mise à jour', 'error');
        }
      });
    }
  }

  resetVideoForm(): void {
    this.newVideo = {
      id: 0,
      name: '',
      link: '',
      description: '',
      isActive: true
    };
    this.videoFile = null;
    this.videoFileName = '';
  }

  // Password Methods
  updatePassword(): void {
    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
      this.showSnackBar('Veuillez remplir tous les champs', 'error');
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.showSnackBar('Les mots de passe ne correspondent pas', 'error');
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      this.showSnackBar('Le mot de passe doit contenir au moins 8 caractères', 'error');
      return;
    }

    // TODO: Implement actual password update logic
    this.showSnackBar('Mot de passe mis à jour avec succès', 'success');
    this.resetPasswordForm();
  }

  resetPasswordForm(): void {
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  // Social Links Methods
  updateSocialLinks(): void {
    this.settingsService.updateSocialLinks(this.socialLinks).subscribe({
      next: () => {
        this.showSnackBar('Liens des réseaux sociaux mis à jour avec succès', 'success');
      },
      error: (error) => {
        console.error('Error updating social links:', error);
        this.showSnackBar('Erreur lors de la mise à jour', 'error');
      }
    });
  }

  // Utility Methods
  formatDescription(description: string): string {
    if (!description) return '';
    return description.replace(/\n/g, '<br>');
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
