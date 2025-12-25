import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SettingsService, Video } from 'src/app/services/settings.service';

interface VideoReel {
  id: number;
  thumbnail: string;
  title: string;
  link: string;
  description?: string;
}

@Component({
  selector: 'app-video-section',
  templateUrl: './video-section.component.html',
  styleUrls: ['./video-section.component.scss', './video-player-modal.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VideoSectionComponent implements OnInit {
  currentVideoSlide = 0;
  visibleVideos = 5;
  videoReels: VideoReel[] = [];
  isLoading = true;
  hasError = false;
  selectedVideoId: number | null = null;

  itemWidth = 280;
  itemGap = 20;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.updateVisibleVideos();
    window.addEventListener('resize', () => this.updateVisibleVideos());
    this.loadVideos();
  }

  loadVideos(): void {
    this.isLoading = true;
    this.hasError = false;

    this.settingsService.getActiveVideos().subscribe({
      next: (videos: Video[]) => {
        this.videoReels = this.mapVideosToReels(videos);
        this.currentVideoSlide = 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading videos:', error);
        this.hasError = true;
        this.isLoading = false;
        this.loadFallbackVideos();
        this.currentVideoSlide = 0;
      }
    });
  }

  private mapVideosToReels(videos: Video[]): VideoReel[] {
    return videos.map(video => ({
      id: video.id || 0,
      title: video.name,
      thumbnail: this.extractYoutubeThumbnail(video.link),
      link: video.link,
      description: video.description
    }));
  }

  private extractYoutubeThumbnail(url: string): string {
    // Extract YouTube video ID and generate thumbnail URL
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    
    if (match && match[1]) {
      const videoId = match[1];
      
      // Check if it's a YouTube Short (vertical video)
      if (url.includes('/shorts/')) {
        // For Shorts, try maxresdefault first (best quality for vertical videos)
        // Falls back gracefully in browser if not available
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      
      // For regular videos, use hqdefault (480x360, always available)
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    
    // Fallback thumbnail
    return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80';
  }

  private loadFallbackVideos(): void {
    this.videoReels = [
      { id: 1, thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80", title: "Paris 2023", link: "" },
      { id: 2, thumbnail: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600&q=80", title: "Lyon 2023", link: "" },
      { id: 3, thumbnail: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80", title: "Bruxelles 2023", link: "" }
    ];
  }

  updateVisibleVideos(): void {
    const width = window.innerWidth;
    
    // Match SCSS breakpoints for card width
    if (width <= 480) {
      this.itemWidth = 220;
    } else if (width <= 768) {
      this.itemWidth = 240;
    } else {
      this.itemWidth = 280;
    }

    // Calculate container padding based on SCSS breakpoints
    // > 768px: 60px * 2 = 120px
    // <= 768px: 40px * 2 = 80px (based on bottom media query)
    // <= 480px: 32px * 2 = 64px
    let containerPadding = 120;
    if (width <= 480) {
      containerPadding = 64;
    } else if (width <= 768) {
      containerPadding = 80;
    }

    const availableWidth = width - containerPadding;
    
    // Calculate how many items fit fully
    this.visibleVideos = Math.floor(availableWidth / (this.itemWidth + this.itemGap));
    
    // Ensure at least 1 is considered visible
    if (this.visibleVideos < 1) this.visibleVideos = 1;

    // Adjust current slide if it's out of bounds after resize
    const maxSlide = Math.max(0, this.videoReels.length - this.visibleVideos);
    if (this.currentVideoSlide > maxSlide) {
      this.currentVideoSlide = maxSlide;
    }
  }

  nextVideoSlide(): void {
    if (this.currentVideoSlide < this.videoReels.length - this.visibleVideos) {
      this.currentVideoSlide++;
    }
  }

  prevVideoSlide(): void {
    if (this.currentVideoSlide > 0) {
      this.currentVideoSlide--;
    }
  }

  canVideoSlidePrev(): boolean {
    return this.currentVideoSlide > 0;
  }

  canVideoSlideNext(): boolean {
    return this.currentVideoSlide < this.videoReels.length - this.visibleVideos;
  }

  getVideoTransformStyle(): string {
    const translateAmount = this.currentVideoSlide * (this.itemWidth + this.itemGap);
    return `translateX(-${translateAmount}px)`;
  }

  playVideo(video: VideoReel): void {
    this.selectedVideoId = video.id;
  }

  closeVideo(): void {
    this.selectedVideoId = null;
  }

  isVideoPlaying(videoId: number): boolean {
    return this.selectedVideoId === videoId;
  }

  getEmbedUrl(url: string): string {
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|shorts\/)([a-zA-Z0-9_-]{11})|youtu\.be\/([a-zA-Z0-9_-]{11}))/;
    const match = url.match(youtubeRegex);
    
    if (match) {
      const videoId = match[1] || match[2];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    
    return url;
  }
}