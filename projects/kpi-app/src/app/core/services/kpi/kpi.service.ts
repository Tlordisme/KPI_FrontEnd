import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { KpiItem } from '../../../modules/kpi/template-kpi/template-kpi.component';
import { Assignment } from '../../../modules/kpi/assigement-kpi/assigement-kpi.component';

@Injectable({
  providedIn: 'root',
})
export class KpiService {
  private apiUrl = 'http://localhost:5118/api/Kpi'; // port KPI service
  private url = 'http://localhost:5118/api'

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
  }

  // Template
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
  getTemplateById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/templates/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
  getItems(): Observable<any> {
  return this.http.get(`${this.apiUrl}/items`,{
    headers:this.getAuthHeaders()
  });
}



  // Item
  createItem(dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/items`, dto, {
      headers: this.getAuthHeaders(),
    });
  }

  getCreatedItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/items/creator`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Phương thức mới để cập nhật KPI
  updateItem(id: number, dto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/items/${id}`, dto, {
      headers: this.getAuthHeaders(),
    });
  }

  // Phương thức mới để xóa KPI
  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/items/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
 // assigement
 createAssignment(assignment: Assignment): Observable<Assignment> {
  return this.http.post<Assignment>(`${this.url}/Assignment`, assignment, {
    headers: this.getAuthHeaders()
  });
 }

 getUnits(): Observable<any[]> {
  return this.http.get<any[]>(`${this.url}/Unit/units`, {
    headers: this.getAuthHeaders(),
  });
}




}
