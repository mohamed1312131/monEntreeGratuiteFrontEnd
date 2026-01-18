import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserVisitService } from 'src/app/services/user-visit.service';

@Component({
  selector: 'app-reservation-page',
  templateUrl: './reservation-page.component.html',
  styleUrls: ['./reservation-page.component.scss']
})
export class ReservationPageComponent implements OnInit {

  constructor(
    private router: Router,
    private userVisitService: UserVisitService
  ) {}

  ngOnInit(): void {
    this.userVisitService.trackVisit().subscribe({
      next: () => console.log('User visit tracked'),
      error: (err) => console.error('Error tracking visit:', err)
    });
    
    // Redirect to home page - this component is deprecated in favor of FrontOffice V2
    this.router.navigate(['/']);
  }
}
