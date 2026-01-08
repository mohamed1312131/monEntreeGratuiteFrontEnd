import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Foire } from '../../../services/foire.service';

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
  endTime: string;
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
    @Inject(MAT_DIALOG_DATA) public data: { foire: Foire },
    private snackBar: MatSnackBar
  ) {
    this.foire = data.foire;
  }

  ngOnInit(): void {
    this.generateDayTimeSlots();
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
      endTime: '',
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
        if (timeSlot.isEnabled && (!timeSlot.startTime || !timeSlot.endTime)) {
          hasErrors = true;
        }
      });
    });

    if (hasErrors) {
      this.showSnackBar('Veuillez remplir toutes les heures de début et de fin pour les créneaux actifs', 'error');
      return;
    }

    // TODO: Save to backend
    this.showSnackBar('Configuration des horaires enregistrée avec succès', 'success');
    this.dialogRef.close(this.dayTimeSlots);
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
