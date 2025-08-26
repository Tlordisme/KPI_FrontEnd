import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { AppRoutingModule } from './auth-routing.module';
import { HttpClientModule } from '@angular/common/http'; // 👈 thêm dòng này
import { RouterModule } from '@angular/router';
@NgModule({
  declarations: [
    LoginComponent,
    LogoutComponent,

  ],
  imports: [
    FormsModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule
  ]
})
export class AuthModule { }
