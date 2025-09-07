import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssigementKpiComponent } from './assigement-kpi.component';

describe('AssigementKpiComponent', () => {
  let component: AssigementKpiComponent;
  let fixture: ComponentFixture<AssigementKpiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssigementKpiComponent]
    });
    fixture = TestBed.createComponent(AssigementKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
