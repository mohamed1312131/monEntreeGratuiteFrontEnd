import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpoChartComponent } from './expo-chart.component';

describe('ExpoChartComponent', () => {
  let component: ExpoChartComponent;
  let fixture: ComponentFixture<ExpoChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpoChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpoChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
