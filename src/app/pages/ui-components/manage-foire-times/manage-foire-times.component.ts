import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Foire, FoireService } from '../../../services/foire.service';

interface DayTimeSlot {
  date: Date;
  dateString: string;
  displayDate: string;
  times: TimeSlot[];
  isExpanded: boolean;
}

interface TimeSlot {
  id: string;
  startTime: string;
  isEnabled: boolean;
}

@Component({
  selector: 'app-manage-foire-times',
  templateUrl: './manage-foire-times.component.html',
  styleUrls: ['./manage-foire-times.component.scss']
})
export class ManageFoireTimesComponent implements OnInit {
  foire: Foire;
  dayTimeSlots: DayTimeSlot[] = [];
  isLoading = false;

  constructor(
    private dialogRef: MatDialogRef<ManageFoireTimesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { foire: Foire; countryCode: string },
    private snackBar: MatSnackBar,
    private foireService: FoireService
  ) {
    this.foire = data.foire;
  }

  ngOnInit(): void {
    this.loadExistingTimeSlots();
  }

  loadExistingTimeSlots(): void {
    this.isLoading = true;
    this.generateDayTimeSlots();
    
    // Load existing time slots from backend if available
    if (this.foire.dayTimeSlots && this.foire.dayTimeSlots.length > 0) {
      this.mergeSavedTimeSlots(this.foire.dayTimeSlots);
    }
    
    this.isLoading = false;
  }

  generateDayTimeSlots(): void {
    this.dayTimeSlots = [];
    
    if (!this.foire.dateRanges || this.foire.dateRanges.length === 0) {
      return;
    }

    // Generate all days from all date ranges
    this.foire.dateRanges.forEach((range, rangeIndex) => {
      const startDate = new Date(range.startDate);
      const endDate = new Date(range.endDate);
      
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateString = this.formatDateToString(currentDate);
        const displayDate = this.formatDateToDisplay(currentDate);
        
        this.dayTimeSlots.push({
          date: new Date(currentDate),
          dateString: dateString,
          displayDate: displayDate,
          times: [],
          isExpanded: false
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
  }

  mergeSavedTimeSlots(savedSlots: any[]): void {
    savedSlots.forEach(savedSlot => {
      const daySlot = this.dayTimeSlots.find(d => d.dateString === savedSlot.date);
      if (daySlot && savedSlot.times) {
        daySlot.times = savedSlot.times.map((t: any) => ({
          id: t.id,
          startTime: t.startTime,
          isEnabled: t.isEnabled
        }));
      }
    });
  }

  formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateToDisplay(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('fr-FR', options);
  }

  addTimeSlot(daySlot: DayTimeSlot): void {
    const newTimeSlot: TimeSlot = {
      id: this.generateId(),
      startTime: '',
      isEnabled: true
    };
    daySlot.times.push(newTimeSlot);
    daySlot.isExpanded = true;
  }

  removeTimeSlot(daySlot: DayTimeSlot, timeSlot: TimeSlot): void {
    const index = daySlot.times.indexOf(timeSlot);
    if (index > -1) {
      daySlot.times.splice(index, 1);
    }
  }

  toggleTimeSlot(timeSlot: TimeSlot): void {
    timeSlot.isEnabled = !timeSlot.isEnabled;
  }

  toggleDayExpansion(daySlot: DayTimeSlot): void {
    daySlot.isExpanded = !daySlot.isExpanded;
  }

  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  hasTimeSlotsForDay(daySlot: DayTimeSlot): boolean {
    return daySlot.times.length > 0;
  }

  getActiveTimeSlotsCount(daySlot: DayTimeSlot): number {
    return daySlot.times.filter(t => t.isEnabled).length;
  }

  save(): void {
    // Validate all time slots
    let hasErrors = false;
    
    this.dayTimeSlots.forEach(daySlot => {
      daySlot.times.forEach(timeSlot => {
        if (timeSlot.isEnabled && !timeSlot.startTime) {
          hasErrors = true;
        }
      });
    });

    if (hasErrors) {
      this.showSnackBar('Veuillez remplir l\'heure d\'entrée pour tous les créneaux actifs', 'error');
      return;
    }

    // Prepare data for backend (only include days with times)
    const dayTimeSlotsData = this.dayTimeSlots
      .filter(daySlot => daySlot.times.length > 0)
      .map(daySlot => ({
        date: daySlot.dateString,
        times: daySlot.times.map(t => ({
          id: t.id,
          startTime: t.startTime,
          isEnabled: t.isEnabled
        }))
      }));

    this.isLoading = true;
    
    this.foireService.updateDayTimeSlots(this.data.countryCode, this.foire.id, dayTimeSlotsData).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSnackBar('Configuration des horaires enregistrée avec succès', 'success');
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error saving time slots:', error);
        this.showSnackBar('Erreur lors de l\'enregistrement des horaires', 'error');
      }
    });
  }

  close(): void {
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
