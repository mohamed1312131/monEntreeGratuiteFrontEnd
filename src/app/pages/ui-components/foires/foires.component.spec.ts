import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoiresComponent } from './foires.component';

describe('FoiresComponent', () => {
  let component: FoiresComponent;
  let fixture: ComponentFixture<FoiresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoiresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FoiresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
