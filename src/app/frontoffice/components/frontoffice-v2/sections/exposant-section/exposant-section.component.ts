import { Component, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-exposant-section',
  templateUrl: './exposant-section.component.html',
  styleUrls: ['./exposant-section.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExposantSectionComponent {
  @Output() exhibitorFormOpened = new EventEmitter<void>();

  openExhibitorForm(): void {
    this.exhibitorFormOpened.emit();
  }
}