import { Component, OnInit, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService, SocialLinks } from 'src/app/services/settings.service';

@Component({
  selector: 'app-header-section',
  templateUrl: './header-section.component.html',
  styleUrls: ['./header-section.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderSectionComponent implements OnInit {
  // State
  isMenuOpen = false;
  socialLinks: SocialLinks | null = null;

  // Output events to communicate with parent component
  @Output() navigationClick = new EventEmitter<string>();

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.loadSocialLinks();
  }

  loadSocialLinks(): void {
    this.settingsService.getSocialLinks().subscribe({
      next: (data: SocialLinks) => {
        this.socialLinks = data;
      },
      error: (error) => {
        console.error('Error loading social links:', error);
      }
    });
  }

  /**
   * Toggle mobile menu open/closed
   */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /**
   * Scroll to a section by ID
   * @param sectionId - The ID of the section to scroll to
   */
  scrollToSection(sectionId: string): void {
    // Close mobile menu if open
    this.isMenuOpen = false;
    
    // Emit event to parent component
    this.navigationClick.emit(sectionId);
    
    // Alternatively, handle scrolling directly in the component
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}