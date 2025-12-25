import { Component, OnInit } from '@angular/core';
import { DashboardStatisticsService, LatestReservation } from '../../../../services/dashboard-statistics.service';

@Component({
  selector: 'app-latest-rev',
  templateUrl: './latest-rev.component.html',
  styleUrl: './latest-rev.component.scss'
})
export class LatestRevComponent implements OnInit {
  reservations: LatestReservation[] = [];
  isLoading = true;

  constructor(private dashboardStatisticsService: DashboardStatisticsService) {}

  ngOnInit(): void {
    this.loadLatestReservations();
  }

  private loadLatestReservations(): void {
    this.isLoading = true;
    
    this.dashboardStatisticsService.getLatestReservations(10).subscribe({
      next: (data) => {
        this.reservations = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching latest reservations', error);
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'COMPLETED': 'status-completed',
      'BLOCKED': 'status-blocked'
    };
    return statusMap[status] || 'status-pending';
  }

  getStatusLabel(status: string): string {
    const labelMap: { [key: string]: string } = {
      'PENDING': 'En attente',
      'CONFIRMED': 'Confirmée',
      'COMPLETED': 'Terminée',
      'BLOCKED': 'Bloquée'
    };
    return labelMap[status] || status;
  }
}
