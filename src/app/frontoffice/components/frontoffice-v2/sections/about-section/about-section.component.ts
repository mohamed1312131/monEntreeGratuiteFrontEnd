import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { SettingsService, AboutUs } from 'src/app/services/settings.service';

@Component({
  selector: 'app-about-section',
  templateUrl: './about-section.component.html',
  styleUrls: ['./about-section.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AboutSectionComponent implements OnInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  
  aboutData: AboutUs | null = null;
  isLoading = true;
  hasError = false;
  isPlaying = false;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.loadAboutData();
  }

  loadAboutData(): void {
    this.isLoading = true;
    this.hasError = false;

    this.settingsService.getActiveAboutUs().subscribe({
      next: (data: AboutUs[]) => {
        // Get the first active About Us entry
        this.aboutData = data.length > 0 ? data[0] : null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading About Us data:', error);
        this.hasError = true;
        this.isLoading = false;
        // Use fallback static data
        this.loadFallbackData();
      }
    });
  }

  togglePlay(): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;

    if (this.isPlaying) {
      video.pause();
      this.isPlaying = false;
    } else {
      video.play();
      this.isPlaying = true;
    }
  }

  formatDescription(description: string): string {
    if (!description) return '';
    return description.replace(/\n/g, '<br>');
  }

  private loadFallbackData(): void {
    this.aboutData = {
      id: 0,
      title: 'Qui Sommes Nous',
      description: 'Depuis plus de 20 ans, nous organisons les plus grands événements de foires et salons en Europe. Notre mission est de connecter les exposants et les visiteurs dans des espaces d\'exception. Avec plus de 100 événements par an et des millions de visiteurs, nous sommes le leader incontesté dans l\'organisation de foires et salons professionnels.',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      isActive: true
    };
  }
}
