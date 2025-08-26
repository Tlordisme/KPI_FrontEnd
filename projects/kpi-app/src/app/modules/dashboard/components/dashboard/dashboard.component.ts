import { Component, OnInit } from '@angular/core';
import { AuthService, LoginResponse } from 'projects/kpi-app/src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  school = {
    name: 'Trường THPT ABC'
  };

  principal: any = {
    name: '',
    code: '',
    term: '2020 - 2025',
    email: '',
    phone: '',
    role: ''
  };

  // Dữ liệu khác vẫn giữ nguyên
  overview = {
    percent: 76,
    total: 120,
    done: 85,
    inProgress: 25,
    ontime: 90,
    late: 5
  };

  deputies = [
    { name: 'Phó hiệu trưởng 1', progress: 75, ontime: 40, late: 3 },
    { name: 'Phó hiệu trưởng 2', progress: 62, ontime: 30, late: 6 }
  ];

  topUnits = [
    { unit: 'Tổ Toán', progress: 90, ontime: 45, late: 1 },
    { unit: 'Tổ Văn', progress: 85, ontime: 38, late: 2 }
  ];

  weakUnits = [
    { unit: 'Tổ Lý', progress: 55, ontime: 20, late: 5 },
    { unit: 'Tổ Hóa', progress: 40, ontime: 10, late: 7 }
  ];

  alerts = [
    { kpi: 'Hoàn thành giáo án', unit: 'Tổ Toán', status: 'Trễ hạn', due: '20/08' },
    { kpi: 'Báo cáo chuyên đề', unit: 'Tổ Văn', status: 'Đúng hạn', due: '30/08' }
  ];

  monthly = [60, 70, 75, 80, 78, 82, 85, 90];

  actionsOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user: LoginResponse | null = this.authService.getUser();
    if (user) {
      this.principal = {
        name: user.fullName,
        code: `ID${user.userID}`, // ví dụ gán userID làm mã CB
        term: '2020 - 2025',
        email: user.email,
        phone: user.phoneNumber,
        role: user.role
      };
    }
  }

  widthPct(val: number): string {
    return `${val}%`;
  }

  toggleActions() {
    this.actionsOpen = !this.actionsOpen;
  }
}
