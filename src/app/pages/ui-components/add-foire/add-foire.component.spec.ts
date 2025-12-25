import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFoireComponent } from './add-foire.component';

describe('AddFoireComponent', () => {
  let component: AddFoireComponent;
  let fixture: ComponentFixture<AddFoireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFoireComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddFoireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
