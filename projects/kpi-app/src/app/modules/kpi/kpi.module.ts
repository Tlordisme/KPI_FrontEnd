import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { AssignKpiComponent } from './components/assign-kpi/assign-kpi.component';
import { TemplateKpiComponent } from './template-kpi/template-kpi.component';
import { AssigementKpiComponent } from './assigement-kpi/assigement-kpi.component';
import { ReviewKpiComponent } from './review-kpi/review-kpi.component';

const routes: Routes = [
  { path: 'assign', component: AssignKpiComponent },
  { path: 'template', component: TemplateKpiComponent },
  { path: 'assigement', component: AssigementKpiComponent },
  { path: 'review', component: ReviewKpiComponent },
];

@NgModule({
  declarations: [
    AssignKpiComponent,
    TemplateKpiComponent,
    AssigementKpiComponent,
    ReviewKpiComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatSnackBarModule,
    MatIconModule,
  ],
})
export class KpiModule {}
