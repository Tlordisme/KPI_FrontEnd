import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiScoreComponent } from './kpi-score.component';

describe('KpiScoreComponent', () => {
  let component: KpiScoreComponent;
  let fixture: ComponentFixture<KpiScoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KpiScoreComponent]
    });
    fixture = TestBed.createComponent(KpiScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
