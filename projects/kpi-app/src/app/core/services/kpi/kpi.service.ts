import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { KpiItem } from '../../../modules/kpi/template-kpi/template-kpi.component';
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
  getItems(): Observable<any> {
  return this.http.get(`${this.apiUrl}/items`,{
    headers:this.getAuthHeaders()
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
  updateItem(id: number, dto: any) {
  return this.http.put<KpiItem>(`${this.apiUrl}/items/${id}`, dto,{
     headers: this.getAuthHeaders()
  });
}
  deleteItem(id: number) {
  return this.http.delete(`${this.apiUrl}/items/${id}`,{
    headers: this.getAuthHeaders()
  });
}
  
}
