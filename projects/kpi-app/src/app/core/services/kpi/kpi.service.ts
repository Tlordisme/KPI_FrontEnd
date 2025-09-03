import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class KpiService {
  private apiUrl = 'http://localhost:5118/api/Kpi'; // port KPI service

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
  }

  // Template
  getTemplates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/templates`, {
      headers: this.getAuthHeaders(),
    });
  }

  createTemplate(dto: { templateName: string; description: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/templates`, dto, {
      headers: this.getAuthHeaders(),
    });
  }

  // Item
  createItem(dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/items`, dto, {
      headers: this.getAuthHeaders(),
    });
  }
}
