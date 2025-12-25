import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestRevComponent } from './latest-rev.component';

describe('LatestRevComponent', () => {
  let component: LatestRevComponent;
  let fixture: ComponentFixture<LatestRevComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatestRevComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LatestRevComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
