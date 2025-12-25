import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoireDetailsComponent } from './foire-details.component';

describe('FoireDetailsComponent', () => {
  let component: FoireDetailsComponent;
  let fixture: ComponentFixture<FoireDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoireDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FoireDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
