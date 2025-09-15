import { Component, OnInit } from '@angular/core';
import { KpiService } from '../../../core/services/kpi/kpi.service';
import { AuthService, LoginResponse } from '../../../core/services/auth/auth.service';

export interface SelfEvaluateDto {
  assignmentId: number;
  actualResults: number;
}

@Component({
  selector: 'app-evaluate-kpi',
  templateUrl: './evaluate-kpi.component.html',
  styleUrls: ['./evaluate-kpi.component.scss'],
})
export class EvaluateKpiComponent implements OnInit {
  assignments: any[] = [];
  userId: number | null = null;
  sidebarOpen: boolean = false;

  constructor(
    private kpiService: KpiService,
    private authService: AuthService
  ) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  ngOnInit(): void {
    const currentUser: LoginResponse | null = this.authService.getUser();
    if (currentUser) {
      this.userId = currentUser.userID;
      this.loadAssignments(this.userId);
    } else {
      console.error('Người dùng chưa đăng nhập hoặc không có thông tin');
    }
  }

  loadAssignments(userId: number) {
    this.kpiService.getUserAssignments(userId).subscribe({
      next: (res: any[]) => {
        this.assignments = res
          .filter(a => a.status === 'Pending' || a.status === 'PendingApproval')
          .map(a => ({ ...a, actualResultsInput: a.actualResults }));
      },
      error: (err) => {
        console.error('Lỗi khi lấy assignments:', err);
      },
    });
  }

  saveAll() {
    // Chuẩn bị danh sách DTO
    const dtos: SelfEvaluateDto[] = this.assignments.map(a => ({
      assignmentId: a.id,
      actualResults: a.actualResultsInput
    }));

    // Gọi API lần lượt (có thể dùng forkJoin để gọi đồng thời)
    let successCount = 0;
    let errorCount = 0;

    dtos.forEach(dto => {
      this.kpiService.selfEvaluate(dto).subscribe({
        next: (res) => {
          successCount++;
          // Cập nhật trong bảng
          const item = this.assignments.find(a => a.id === dto.assignmentId);
          if (item) {
            item.componentScore = res.componentScore;
            item.status = res.status;
          }

          if (successCount + errorCount === dtos.length) {
            alert(`Đã lưu thành công ${successCount} KPI, lỗi ${errorCount}`);
          }
        },
        error: (err) => {
          errorCount++;
          if (successCount + errorCount === dtos.length) {
            alert(`Đã lưu thành công ${successCount} KPI, lỗi ${errorCount}`);
          }
        }
      });
    });
  }
}
