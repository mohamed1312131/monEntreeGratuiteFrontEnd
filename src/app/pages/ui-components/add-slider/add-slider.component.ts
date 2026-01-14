import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SliderService } from '../../../services/slider.service';
import { FoireService, Foire } from '../../../services/foire.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-slider',
  templateUrl: './add-slider.component.html',
  styleUrls: ['./add-slider.component.scss']
})
export class AddSliderComponent implements OnInit {
  selectedFile: File | null = null;
  imageError = false;
  isSubmitting = false;
  foires: Foire[] = [];
  selectedFoireId: number | null = null;

  constructor(
    private dialogRef: MatDialogRef<AddSliderComponent>,
    private sliderService: SliderService,
    private foireService: FoireService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFoires();
  }

  loadFoires(): void {
    this.foireService.getAllFoires().subscribe({
      next: (foires) => {
        this.foires = foires;
      },
      error: (error) => {
        console.error('Error loading foires:', error);
        this.showSnackBar('Erreur lors du chargement des foires', 'error');
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.imageError = true;
        this.selectedFile = null;
        return;
      }

      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        this.imageError = true;
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
      this.imageError = false;
    }
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.imageError = false;
  }

  submitSlider(): void {
    if (this.selectedFile) {
      this.isSubmitting = true;

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      if (this.selectedFoireId) {
        formData.append('foireId', this.selectedFoireId.toString());
      }

      this.sliderService.createSlider(formData).subscribe({
        next: (slider) => {
          this.showSnackBar('Carrousel créé avec succès', 'success');
          this.dialogRef.close(slider);
        },
        error: (error) => {
          console.error('Error creating slider:', error);
          this.showSnackBar('Erreur lors de la création du carrousel', 'error');
          this.isSubmitting = false;
        }
      });
    } else {
      this.imageError = true;
      this.showSnackBar('Veuillez sélectionner une image', 'error');
    }
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
