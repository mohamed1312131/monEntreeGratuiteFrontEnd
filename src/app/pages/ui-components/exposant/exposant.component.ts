import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Exposant {
  id: number;
  pays: string;
  iconUrl: string;
  datesub: string;
  foire: string;
  personnes: number;
  nom: string;
  ville: string;
  email: string;
  phonesms: string;
  age: string;
  phone: string;
}

@Component({
  selector: 'app-exposant',
  templateUrl: './exposant.component.html',
  styleUrls: ['./exposant.component.scss']
})
export class ExposantComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'id', 'pays', 'datesub', 'foire', 'personnes', 'nom', 'ville', 'email', 'phonesms', 'age', 'phone'
  ];

  dataSource: MatTableDataSource<Exposant>;
  exposantCount: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Static mock data
  private mockExposants: Exposant[] = [
    {
      id: 1,
      pays: 'France',
      iconUrl: 'assets/images/country/france.png',
      datesub: '2024-11-15',
      foire: 'Salon de l\'Agriculture',
      personnes: 5,
      nom: 'Entreprise Agricole Dupont',
      ville: 'Paris',
      email: 'contact@dupont-agri.fr',
      phonesms: '+33 6 12 34 56 78',
      age: '35-50',
      phone: '+33 1 23 45 67 89'
    },
    {
      id: 2,
      pays: 'Belgique',
      iconUrl: 'assets/images/country/Belgium-logo-BEC81AA6BF-seeklogo.com.png',
      datesub: '2024-11-20',
      foire: 'Foire de Bruxelles',
      personnes: 3,
      nom: 'Tech Solutions Brussels',
      ville: 'Bruxelles',
      email: 'info@techsolutions.be',
      phonesms: '+32 4 12 34 56 78',
      age: '25-35',
      phone: '+32 2 123 45 67'
    },
    {
      id: 3,
      pays: 'France',
      iconUrl: 'assets/images/country/france.png',
      datesub: '2024-11-25',
      foire: 'Foire de Paris',
      personnes: 8,
      nom: 'Innovation France SA',
      ville: 'Lyon',
      email: 'contact@innovation-fr.com',
      phonesms: '+33 6 23 45 67 89',
      age: '40-55',
      phone: '+33 4 12 34 56 78'
    },
    {
      id: 4,
      pays: 'Suisse',
      iconUrl: 'assets/images/country/pngegg.png',
      datesub: '2024-12-01',
      foire: 'Foire de Genève',
      personnes: 4,
      nom: 'Swiss Expo Group',
      ville: 'Genève',
      email: 'info@swissexpo.ch',
      phonesms: '+41 22 123 45 67',
      age: '30-45',
      phone: '+41 22 987 65 43'
    },
    {
      id: 5,
      pays: 'France',
      iconUrl: 'assets/images/country/france.png',
      datesub: '2024-12-05',
      foire: 'Salon du Chocolat',
      personnes: 2,
      nom: 'Chocolaterie Artisanale',
      ville: 'Marseille',
      email: 'contact@choco-art.fr',
      phonesms: '+33 6 34 56 78 90',
      age: '28-40',
      phone: '+33 4 91 23 45 67'
    }
  ];

  constructor(private snackBar: MatSnackBar) {
    this.dataSource = new MatTableDataSource(this.mockExposants);
  }

  ngOnInit(): void {
    this.exposantCount = this.mockExposants.length;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  exportToExcel(): void {
    this.showSnackBar('Export Excel fonctionnalité à implémenter', 'success');
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
