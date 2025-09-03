// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  userNameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  userID: number;
  email: string;
  userName: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  role: string;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5006/api/User';

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap({
        next: (res) => {
          console.log('✅ API response:', res);

          // Lưu token + user info vào localStorage
          this.saveToken(res.token);
          this.saveUser(res);
        },
        error: (err) => console.error('❌ API error:', err),
      })
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('jwtToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  saveUser(user: LoginResponse): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getUser(): LoginResponse | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  logout(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('currentUser');
  }


  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
