import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevByAgeComponent } from './rev-by-age.component';

describe('RevByAgeComponent', () => {
  let component: RevByAgeComponent;
  let fixture: ComponentFixture<RevByAgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevByAgeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RevByAgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
