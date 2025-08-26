// src/app/services/kpi.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KpiService {
  constructor() { }

  getQuickStats() {
    return {
      kpiToApprove: 23,
      schoolProgress: 85,
      strategicKpiAssigned: 12,
      averageScore: 8.5
    };
  }

  getUnitProgressData() {
    return [
      { name: 'Phòng Đào tạo', value: 92 },
      { name: 'Phòng TCCB', value: 85 },
      { name: 'Khoa CNTT', value: 78 },
      { name: 'Khoa Ngoại ngữ', value: 95 }
    ];
  }

  getKpiTypeData() {
    return [
      { name: 'KPI Chức năng', value: 60 },
      { name: 'KPI Mục tiêu', value: 30 },
      { name: 'KPI Kỷ luật', value: 10 }
    ];
  }

  getApprovalQueue() {
    return [
      { unit: 'Khoa CNTT', kpi: 'Tỷ lệ sinh viên có việc làm', status: 'Chờ phê duyệt cuối cùng', lastUpdated: '2025-08-10' },
      { unit: 'Phòng Đào tạo', kpi: 'Tổ chức hội thảo khoa học', status: 'Chờ phê duyệt cuối cùng', lastUpdated: '2025-08-08' },
      { unit: 'Phòng TCCB', kpi: 'Tỷ lệ cán bộ được đào tạo', status: 'Chờ phê duyệt cuối cùng', lastUpdated: '2025-08-05' }
    ];
  }
}
