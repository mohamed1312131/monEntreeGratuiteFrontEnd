import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  showFiller = false;
  currentUser: any = null;

  constructor(
    public dialog: MatDialog,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
      this.authService.logout();
    }
  }
}
