import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevByCountriesComponent } from './rev-by-countries.component';

describe('RevByCountriesComponent', () => {
  let component: RevByCountriesComponent;
  let fixture: ComponentFixture<RevByCountriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevByCountriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RevByCountriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
