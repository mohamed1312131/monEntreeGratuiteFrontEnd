import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackByCountriesComponent } from './track-by-countries.component';

describe('TrackByCountriesComponent', () => {
  let component: TrackByCountriesComponent;
  let fixture: ComponentFixture<TrackByCountriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackByCountriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrackByCountriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
