import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateKpiComponent } from './template-kpi.component';

describe('TemplateKpiComponent', () => {
  let component: TemplateKpiComponent;
  let fixture: ComponentFixture<TemplateKpiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TemplateKpiComponent]
    });
    fixture = TestBed.createComponent(TemplateKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
