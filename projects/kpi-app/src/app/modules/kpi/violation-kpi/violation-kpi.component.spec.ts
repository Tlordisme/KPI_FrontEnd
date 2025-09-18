import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationKpiComponent } from './violation-kpi.component';

describe('ViolationKpiComponent', () => {
  let component: ViolationKpiComponent;
  let fixture: ComponentFixture<ViolationKpiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViolationKpiComponent]
    });
    fixture = TestBed.createComponent(ViolationKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
