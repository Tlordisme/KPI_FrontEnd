import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { AssignKpiComponent } from './components/assign-kpi/assign-kpi.component';
import { TemplateKpiComponent } from './template-kpi/template-kpi.component';
import { AssigementKpiComponent } from './assigement-kpi/assigement-kpi.component';


const routes: Routes = [
  { path: 'assign', component: AssignKpiComponent },
  { path: 'template',component:TemplateKpiComponent},
  { path: 'assigement',component:AssigementKpiComponent}
];

@NgModule({
  declarations: [AssignKpiComponent, TemplateKpiComponent, AssigementKpiComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    SharedModule,
  ]
})
export class KpiModule {}
