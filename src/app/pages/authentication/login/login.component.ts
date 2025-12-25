import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class AppSideLoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';
  loginAttempts = 0;
  maxAttempts = 5;
  isBlocked = false;
  blockTimer: any;
  returnUrl: string = '/dashboard';

  // Simple bot detection
  private formStartTime: number = 0;
  private minFormFillTime = 2000; // Minimum 2 seconds to fill form (bots are faster)

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Check if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/dashboard']);
      return;
    }

    this.initializeForm();
    this.checkRememberedUser();
    this.formStartTime = Date.now();
    
    // Get return URL from route parameters or default to '/admin/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
  }

  ngOnDestroy(): void {
    if (this.blockTimer) {
      clearTimeout(this.blockTimer);
    }
  }

  initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  checkRememberedUser(): void {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        rememberMe: true
      });
    }
  }

  onLogin(): void {
    if (this.loginForm.invalid || this.isBlocked) {
      return;
    }

    // Bot detection: Check if form was filled too quickly
    const formFillTime = Date.now() - this.formStartTime;
    if (formFillTime < this.minFormFillTime) {
      this.errorMessage = 'Suspicious activity detected. Please try again.';
      this.blockUser();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        // Successful login
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        this.showSnackBar('Connexion réussie!', 'success');
        this.isLoading = false;
        
        // Navigate to return URL or dashboard
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        // Failed login
        this.loginAttempts++;
        this.isLoading = false;
        
        if (this.loginAttempts >= this.maxAttempts) {
          this.blockUser();
          this.errorMessage = `Trop de tentatives échouées. Compte bloqué pendant 5 minutes.`;
        } else {
          this.errorMessage = error.error?.error || 'Email ou mot de passe incorrect';
          this.showSnackBar(`Tentative ${this.loginAttempts}/${this.maxAttempts}`, 'error');
        }
        
        // Reset form start time for next attempt
        this.formStartTime = Date.now();
      }
    });
  }

  private blockUser(): void {
    this.isBlocked = true;
    this.loginForm.disable();
    
    // Unblock after 5 minutes
    this.blockTimer = setTimeout(() => {
      this.isBlocked = false;
      this.loginAttempts = 0;
      this.loginForm.enable();
      this.errorMessage = '';
      this.showSnackBar('Vous pouvez réessayer maintenant', 'success');
    }, 300000); // 5 minutes
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snack-bar-success' : 'snack-bar-error'
    });
  }
}
