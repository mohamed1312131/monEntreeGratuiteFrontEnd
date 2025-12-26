import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddFoireComponent } from '../add-foire/add-foire.component';
import { FoireDetailsComponent } from '../foire-details/foire-details.component';
import { FoireService, Foire as FoireData } from '../../../services/foire.service';

interface Foire extends FoireData {
  reservationCount?: number;
}

interface Country {
  name: string;
  image: string;
  foires: Foire[];
  apiKey: string;
  pageIndex: number;
  pageSize: number;
}

@Component({
  selector: 'app-foires',
  templateUrl: './foires.component.html',
  styleUrls: ['./foires.component.scss']
})
export class FoiresComponent implements OnInit {
  
  countries: Country[] = [
    {
      name: 'France',
      image: 'assets/images/flags/France.png',
      apiKey: 'FR',
      pageIndex: 0,
      pageSize: 5,
      foires: []
    },
    {
      name: 'Belgique',
      image: 'assets/images/flags/Belgium.png',
      apiKey: 'BE',
      pageIndex: 0,
      pageSize: 5,
      foires: []
    },
    {
      name: 'Suisse',
      image: 'assets/images/flags/Switzerland.png',
      apiKey: 'CH',
      pageIndex: 0,
      pageSize: 5,
      foires: []
    }
  ];

  displayedColumns: string[] = ['image', 'url', 'nomfoire', 'datefoire', 'createdAt', 'reservations', 'actions'];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private foireService: FoireService
  ) {}

  ngOnInit(): void {
    this.loadAllFoires();
  }

  loadAllFoires(): void {
    this.countries.forEach(country => {
      this.loadFoiresByCountry(country);
    });
  }

  loadFoiresByCountry(country: Country): void {
    this.foireService.getFoiresByCountry(country.apiKey).subscribe({
      next: (foires) => {
        country.foires = foires.map(f => ({
          ...f,
          reservationCount: 0
        }));
        // Load reservation counts for each foire
        country.foires.forEach(foire => {
          this.loadReservationCount(foire);
        });
      },
      error: (error) => {
        console.error(`Error loading foires for ${country.name}:`, error);
        this.showSnackBar(`Erreur lors du chargement des foires pour ${country.name}`, 'error');
      }
    });
  }

  loadReservationCount(foire: Foire): void {
    this.foireService.countReservationsByStatus(foire.id).subscribe({
      next: (counts: any) => {
        foire.reservationCount = Object.values(counts).reduce((sum: number, count: any) => sum + Number(count), 0);
      },
      error: (error) => {
        console.error(`Error loading reservation count for foire ${foire.id}:`, error);
      }
    });
  }

  getPaginatedFoires(country: Country): Foire[] {
    const startIndex = country.pageIndex * country.pageSize;
    return country.foires.slice(startIndex, startIndex + country.pageSize);
  }

  getPages(country: Country): number[] {
    return Array(Math.ceil(country.foires.length / country.pageSize))
      .fill(0)
      .map((_, i) => i);
  }

  changePage(country: Country, pageIndex: number): void {
    country.pageIndex = pageIndex;
  }

  addFoire(country: Country): void {
    const dialogRef = this.dialog.open(AddFoireComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      data: { countryCode: country.apiKey, countryName: country.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Reload the foires for this country to show the new one
        this.loadFoiresByCountry(country);
      }
    });
  }

  deleteFoire(countryKey: string, foire: Foire): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la foire: ${foire.name}?`)) {
      this.foireService.deleteFoire(countryKey, foire.id).subscribe({
        next: () => {
          const country = this.countries.find(c => c.apiKey === countryKey);
          if (country) {
            this.loadFoiresByCountry(country);
          }
          this.showSnackBar('Foire supprimée avec succès', 'success');
        },
        error: (error) => {
          console.error('Error deleting foire:', error);
          this.showSnackBar('Erreur lors de la suppression', 'error');
        }
      });
    }
  }

  activateFoire(countryKey: string, foire: Foire): void {
    const action = foire.isActive ? this.foireService.disableFoire(countryKey, foire.id) : this.foireService.activateFoire(countryKey, foire.id);
    
    action.subscribe({
      next: () => {
        foire.isActive = !foire.isActive;
        const status = foire.isActive ? 'activée' : 'désactivée';
        this.showSnackBar(`Foire ${status} avec succès`, 'success');
      },
      error: (error) => {
        console.error('Error toggling foire status:', error);
        this.showSnackBar('Erreur lors de la modification du statut', 'error');
      }
    });
  }

  sendEmailReminders(foire: Foire): void {
    if (confirm(`Envoyer des rappels email à tous les participants de ${foire.name}?`)) {
      this.foireService.sendReminders(foire.id).subscribe({
        next: () => {
          this.showSnackBar(`Rappels email envoyés pour ${foire.name}`, 'success');
        },
        error: (error) => {
          console.error('Error sending reminders:', error);
          this.showSnackBar('Erreur lors de l\'envoi des rappels', 'error');
        }
      });
    }
  }

  viewDetails(foire: Foire): void {
    this.dialog.open(FoireDetailsComponent, {
      width: '900px',
      maxHeight: '90vh',
      data: foire
    });
  }

  getTotalFoires(): number {
    return this.countries.reduce((total, country) => total + country.foires.length, 0);
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
