import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { FormEditComponent } from './components/form-edit/form-edit.component';
@NgModule({
  declarations: [
    SidebarComponent,
    TopbarComponent,
    FormEditComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,

  ],
  exports: [
    MatIconModule,
    MatButtonModule,
    FormEditComponent,
    TopbarComponent,
    SidebarComponent, // Rất quan trọng
    RouterModule, // Export RouterModule để các module khác sử dụng routerLink
    FormsModule, // Export FormsModule để các module khác sử dụng ngModel
  ]
})
export class SharedModule { }
