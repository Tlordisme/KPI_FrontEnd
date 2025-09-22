import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { AssignKpiComponent } from './components/assign-kpi/assign-kpi.component';
import { TemplateKpiComponent } from './template-kpi/template-kpi.component';
import { AssigementKpiComponent } from './assigement-kpi/assigement-kpi.component';
import { ReviewKpiComponent } from './review-kpi/review-kpi.component';
import { EvaluateKpiComponent } from './evaluate-kpi/evaluate-kpi.component';
import { ViolationKpiComponent } from './violation-kpi/violation-kpi.component';
import { KpiScoreComponent } from './kpi-score/kpi-score.component';


const routes: Routes = [
  { path: 'assign', component: AssignKpiComponent },
  { path: 'template', component: TemplateKpiComponent },
  { path: 'assigement', component: AssigementKpiComponent },
  { path: 'review', component: ReviewKpiComponent },
  { path: 'evaluate', component:EvaluateKpiComponent},
  { path: 'violation', component:ViolationKpiComponent},
  { path: 'score', component:KpiScoreComponent}
];

@NgModule({
  declarations: [
    AssignKpiComponent,
    TemplateKpiComponent,
    AssigementKpiComponent,
    ReviewKpiComponent,
    EvaluateKpiComponent,
    ViolationKpiComponent,
    KpiScoreComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class KpiModule {}
