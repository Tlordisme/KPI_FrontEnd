import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
const routes: Routes = [];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    FormsModule,
    MatSnackBarModule,
  ],
  exports: [RouterModule]
})
export class KpiRoutingModule { }
