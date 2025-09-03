import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Thêm dòng này

import { SidebarComponent } from './components/sidebar/sidebar.component';

@NgModule({
  declarations: [
    SidebarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule // Cần thiết nếu sidebar có form hoặc ngModel
  ],
  exports: [
    SidebarComponent, // Rất quan trọng
    RouterModule, // Export RouterModule để các module khác sử dụng routerLink
    FormsModule, // Export FormsModule để các module khác sử dụng ngModel
  ]
})
export class SharedModule { }
