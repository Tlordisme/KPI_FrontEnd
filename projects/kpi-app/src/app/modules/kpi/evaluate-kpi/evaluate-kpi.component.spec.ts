import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluateKpiComponent } from './evaluate-kpi.component';

describe('EvaluateKpiComponent', () => {
  let component: EvaluateKpiComponent;
  let fixture: ComponentFixture<EvaluateKpiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EvaluateKpiComponent]
    });
    fixture = TestBed.createComponent(EvaluateKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
