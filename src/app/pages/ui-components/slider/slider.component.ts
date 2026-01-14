import { Component, ViewChild, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddSliderComponent } from '../add-slider/add-slider.component';
import { SliderService, SliderData } from '../../../services/slider.service';
import { FoireService, Foire } from '../../../services/foire.service';


@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit {
  displayedColumns: string[] = [
    'image', 'reference', 'foire', 'order', 'isActive', 'actions'
  ];
  dataSource: MatTableDataSource<SliderData>;
  orderOptions: number[] = [];
  sliders: SliderData[] = [];
  foires: Foire[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sliderService: SliderService,
    private foireService: FoireService
  ) {
    this.dataSource = new MatTableDataSource<SliderData>([]);
  }

  ngOnInit(): void {
    this.loadFoires();
    this.loadSliders();
  }

  loadFoires(): void {
    this.foireService.getAllFoires().subscribe({
      next: (foires) => {
        this.foires = foires;
      },
      error: (error) => {
        console.error('Error loading foires:', error);
      }
    });
  }

  loadSliders(): void {
    this.sliderService.getAllSliders().subscribe({
      next: (sliders) => {
        this.sliders = sliders;
        this.dataSource.data = sliders;
        this.updateOrderOptions(sliders.length);
      },
      error: (error) => {
        console.error('Error loading sliders:', error);
        this.showSnackBar('Erreur lors du chargement des carrousels', 'error');
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  updateOrderOptions(length: number): void {
    this.orderOptions = Array.from({ length }, (_, i) => i + 1);
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddSliderComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Reload sliders to show the new one
        this.loadSliders();
      }
    });
  }

  deleteRow(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce carrousel ?')) {
      this.sliderService.deleteSlider(id).subscribe({
        next: () => {
          this.loadSliders();
          this.showSnackBar('Carrousel supprimé avec succès', 'success');
        },
        error: (error) => {
          console.error('Error deleting slider:', error);
          this.showSnackBar('Erreur lors de la suppression', 'error');
        }
      });
    }
  }

  toggleActive(slider: SliderData): void {
    this.sliderService.toggleActive(slider.id).subscribe({
      next: (updated) => {
        const index = this.sliders.findIndex(s => s.id === slider.id);
        if (index > -1) {
          this.sliders[index] = updated;
          this.dataSource.data = [...this.sliders];
        }
        this.showSnackBar(
          updated.isActive ? 'Carrousel activé' : 'Carrousel désactivé',
          'success'
        );
      },
      error: (error) => {
        console.error('Error toggling slider:', error);
        this.showSnackBar('Erreur lors de la modification', 'error');
      }
    });
  }

  onSave(): void {
    // Validate duplicate orders
    const orderSet = new Set<number>();
    for (let row of this.dataSource.data) {
      if (row.order !== null && orderSet.has(row.order)) {
        this.showSnackBar(`L'ordre ${row.order} est en double. Veuillez choisir un ordre unique.`, 'error');
        return;
      }
      if (row.order !== null) {
        orderSet.add(row.order);
      }
    }

    // Save all sliders with updated orders
    const updatePromises = this.dataSource.data.map(slider => 
      this.sliderService.updateSlider(slider.id, { order: slider.order }).toPromise()
    );

    Promise.all(updatePromises).then(() => {
      this.showSnackBar('Modifications enregistrées avec succès', 'success');
      this.loadSliders();
    }).catch(error => {
      console.error('Error saving changes:', error);
      this.showSnackBar('Erreur lors de la sauvegarde', 'error');
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  updateSliderFoire(slider: SliderData, foireId: number | null): void {
    this.sliderService.updateSliderFoire(slider.id, foireId).subscribe({
      next: (updated) => {
        const index = this.sliders.findIndex(s => s.id === slider.id);
        if (index > -1) {
          this.sliders[index] = updated;
          this.dataSource.data = [...this.sliders];
        }
        this.showSnackBar('Foire mise à jour avec succès', 'success');
      },
      error: (error) => {
        console.error('Error updating slider foire:', error);
        this.showSnackBar('Erreur lors de la mise à jour de la foire', 'error');
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
}
