import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthService,
  LoginResponse,
} from '../../../core/services/auth/auth.service';
@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}
  principal: any = {};
  goDashboard() {
    this.router.navigate(['/dashboard']);
  }
  ngOnInit(): void {
    // lấy user login
    const user: LoginResponse | null = this.authService.getUser();
    if (user) {
      this.principal = { name: user.fullName };
    }
  }
  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);

  }
}
