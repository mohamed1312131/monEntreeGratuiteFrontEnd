import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FoireService } from '../../../services/foire.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-foire',
  templateUrl: './add-foire.component.html',
  styleUrls: ['./add-foire.component.scss']
})
export class AddFoireComponent implements OnInit {
  form!: FormGroup;
  selectedFile: File | null = null;
  imageError = false;
  isSubmitting = false;
  dateRanges: Array<{startDate: string, endDate: string}> = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddFoireComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { countryCode: string; countryName: string },
    private foireService: FoireService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nomFoire: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required]
    });
    // Initialize with one empty date range
    this.addDateRange();
  }

  onFileChange(event: Event): void {
    this.imageError = false;
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
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
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

  addDateRange(): void {
    this.dateRanges.push({ startDate: '', endDate: '' });
  }

  removeDateRange(index: number): void {
    if (this.dateRanges.length > 1) {
      this.dateRanges.splice(index, 1);
    }
  }

  submit(): void {
    // Mark all form fields as touched to show validation errors
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });

    // Validate all required fields
    if (!this.form.valid) {
      this.showSnackBar('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    if (!this.selectedFile) {
      this.imageError = true;
      this.showSnackBar('Veuillez sélectionner une image', 'error');
      return;
    }

    // Validate date ranges - must have at least one complete range
    const hasValidDateRanges = this.dateRanges.length > 0 && 
                               this.dateRanges.every(range => range.startDate && range.endDate);
    
    if (!hasValidDateRanges) {
      this.showSnackBar('Veuillez remplir au moins une période complète (date de début et fin)', 'error');
      return;
    }

    // Validate that end date is after or equal to start date
    const hasValidDateOrder = this.dateRanges.every(range => {
      const start = new Date(range.startDate);
      const end = new Date(range.endDate);
      return end >= start;
    });

    if (!hasValidDateOrder) {
      this.showSnackBar('La date de fin doit être après ou égale à la date de début', 'error');
      return;
    }

    // All validations passed, submit the form
    this.isSubmitting = true;
    
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('countryCode', this.data.countryCode);
    formData.append('name', this.form.get('nomFoire')?.value.trim());
    formData.append('location', this.form.get('location')?.value.trim());
    formData.append('description', this.form.get('description')?.value.trim());
    
    // Convert date ranges to JSON
    formData.append('dateRanges', JSON.stringify(this.dateRanges));

    this.foireService.addFoire(formData).subscribe({
      next: (response) => {
        this.showSnackBar('Foire créée avec succès', 'success');
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error creating foire:', error);
        const errorMsg = error?.error?.error || 'Erreur lors de la création de la foire';
        this.showSnackBar(errorMsg, 'error');
        this.isSubmitting = false;
      }
    });
  }

  showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snack-bar-success' : 'snack-bar-error'
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
