import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { KpiItem } from '../../../modules/kpi/template-kpi/template-kpi.component';
import { AssignItemDto } from '../../../modules/kpi/assigement-kpi/assigement-kpi.component';
import { ApproveKpiAssignmentBulkDto } from '../../../modules/kpi/review-kpi/review-kpi.component';

@Injectable({
  providedIn: 'root',
})
export class KpiService {
  private apiUrl = 'http://localhost:5118/api/Kpi'; // port KPI service
  private url = 'http://localhost:5118/api';

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

  createTemplate(dto: {
    templateName: string;
    description: string;
  }): Observable<any> {
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
    return this.http.get(`${this.apiUrl}/items`, {
      headers: this.getAuthHeaders(),
    });
  }
  // Thêm phương thức mới để lấy KPI Items theo Template Id
  getTemplateItems(templateId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/templates/${templateId}/items`,
      {
        headers: this.getAuthHeaders(),
      }
    );
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
  // Assignment
  createAssignment(assignment: any): Observable<any> {
    // Note: Removed type `Assignment` for flexibility
    return this.http.post<any>(`${this.url}/Assignment`, assignment, {
      headers: this.getAuthHeaders(),
    });
  }

  getUnits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/Unit/units`, {
      headers: this.getAuthHeaders(),
    });
  }

  assignItem(dto: AssignItemDto): Observable<any> {
    return this.http.post(`${this.url}/Assignment/assign-item`, dto, {
      headers: this.getAuthHeaders(),
    });
  }

  //Export Template Excel

  exportTemplateToExcel(templateId: number): Observable<Blob> {
    // Note the 'responseType: "blob"' which is crucial for file downloads
    return this.http.get(`${this.apiUrl}/export-template/${templateId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob',
    });
  }

  //Get Assignment
  // Lấy assignments của các thành viên trong đơn vị của tôi
  getAssignmentsByUnitMembers(year: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/Assignment/unit-members/${year}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Lấy assignments của các trưởng đơn vị
  getUnitAssignments(year: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/Assignment/units/${year}`, {
      headers: this.getAuthHeaders(),
    });
  }
  //GetALl Kpi Items
  // Phương thức mới: Lấy tất cả KPI items
  getAllKpiItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/items`, {
      headers: this.getAuthHeaders(),
    });
  }

// Gửi yêu cầu phê duyệt hàng loạt các KPI Assignment
  approveKpiAssignmentsBulk(dto: ApproveKpiAssignmentBulkDto): Observable<any> {
    // Gọi endpoint bulk-approve mới
    return this.http.post(`${this.url}/Approval/bulk-approve`, dto, {
      headers: this.getAuthHeaders(),
    });
  }

  // Gửi yêu cầu từ chối hàng loạt các KPI Assignment
  rejectKpiAssignmentsBulk(dto: ApproveKpiAssignmentBulkDto): Observable<any> {
    // Gọi endpoint bulk-reject mới
    return this.http.post(`${this.url}/Approval/bulk-reject`, dto, {
      headers: this.getAuthHeaders(),
    });
  }
}
