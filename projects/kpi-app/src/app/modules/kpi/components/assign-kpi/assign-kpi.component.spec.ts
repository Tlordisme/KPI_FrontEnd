import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignKpiComponent } from './assign-kpi.component';

describe('AssignKpiComponent', () => {
  let component: AssignKpiComponent;
  let fixture: ComponentFixture<AssignKpiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssignKpiComponent]
    });
    fixture = TestBed.createComponent(AssignKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
