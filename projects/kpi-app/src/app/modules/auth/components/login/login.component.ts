import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthService,
  LoginRequest,
} from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  onLogin() {
    const request: LoginRequest = {
      userNameOrEmail: this.username,
      password: this.password,
    };
    this.authService.login(request).subscribe({
      next: (response: any) => {
        this.authService.saveToken(response.token);
        this.authService.saveUser(response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        alert('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      },
    });
  }
}
