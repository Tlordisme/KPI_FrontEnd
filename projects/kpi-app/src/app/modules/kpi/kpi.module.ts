import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { AssignKpiComponent } from './components/assign-kpi/assign-kpi.component';
import { TemplateKpiComponent } from './template-kpi/template-kpi.component';


const routes: Routes = [
  { path: 'assign', component: AssignKpiComponent },
  { path: 'template',component:TemplateKpiComponent}
];

@NgModule({
  declarations: [AssignKpiComponent, TemplateKpiComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class KpiModule {}
