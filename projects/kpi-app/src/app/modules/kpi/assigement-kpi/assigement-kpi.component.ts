import { Component, OnInit } from '@angular/core';
import { KpiService } from '../../../core/services/kpi/kpi.service';
import { AuthService } from '../../../core/services/auth/auth.service';

export interface Assignment {
  userId: number;
  unitId: number;
  kpiItemId: number;
  targetValue: number;
  contributionWeight: number;
  year: number;
}

@Component({
  selector: 'app-assigement-kpi',
  templateUrl: './assigement-kpi.component.html',
  styleUrls: ['./assigement-kpi.component.scss'],
})
export class AssigementKpiComponent implements OnInit {
  constructor(
    private kpiService: KpiService,
    private authService: AuthService
  ) {}

  units: any[] = [];
  users: any[] = [];
  filteredUnits: any[] = [];
  kpiItems: any[] = [];

  // Sidebar
  sidebarOpen: boolean = false;
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  ngOnInit(): void {
    this.loadUnitsAndUsers();
    this.loadKpiItems();
  }
  loadKpiItems() {
    this.kpiService.getItems().subscribe({
      next: (res) => {
        this.kpiItems = res;
        console.log('KPI Items:', this.kpiItems);
      },
      error: (err) => {
        console.error('Lỗi khi lấy KPI Items:', err);
      },
    });
  }

  loadUnitsAndUsers() {
    this.kpiService.getUnits().subscribe({
      next: (res) => {
        this.units = res;
        console.log('Units:', this.units);

        this.authService.getUsers().subscribe((users) => {
          this.users = users.map((u: any) => {
            const unit = this.units.find((x: any) => x.id === u.unitId);
            return {
              ...u,
              unitName: unit ? unit.name : 'Chưa có đơn vị',
            };
          });
          console.log('Users:', this.users);
        });
      },
      error: (err) => {
        console.error('Lỗi khi lấy Units:', err);
      },
    });
  }

  get selectedUserUnitName(): string {
    if (!this.selectedUserId) return 'Chưa chọn user';
    const user = this.users.find((u) => u.id === this.selectedUserId);
    return user ? user.unitName : 'Chưa có đơn vị';
  }

  onUserChange() {
    const selectedUser = this.users.find(
      (u: any) => u.id === this.selectedUserId
    );

    if (selectedUser) {
      this.filteredUnits = this.units.filter(
        (unit: any) => unit.id === selectedUser.unitId
      );

      console.log('User chọn:', selectedUser);
      console.log('filteredUnits:', this.filteredUnits);

      if (this.filteredUnits.length > 0) {
        this.selectedUnitId = this.filteredUnits[0].id;
      } else {
        // User chưa có đơn vị
        this.selectedUnitId = 0;
      }
    } else {
      this.filteredUnits = [];
      this.selectedUnitId = 0;
    }
  }

  // Assignment info
  selectedUserId: number = 0;
  selectedUnitId: number = 0;
  selectedKpiItemId: number = 0;
  targetValue: number = 0;
  contributionWeight: number = 0;
  selectedYear: number = new Date().getFullYear();
  assignKpi() {}
  // Tạo Assignment
  createAssignment() {
    if (
      !this.selectedUserId ||
      !this.selectedUnitId ||
      !this.selectedKpiItemId
    ) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const assignment: Assignment = {
      userId: this.selectedUserId,
      unitId: this.selectedUnitId,
      kpiItemId: this.selectedKpiItemId,
      targetValue: this.targetValue,
      contributionWeight: this.contributionWeight,
      year: this.selectedYear,
    };

    console.log('Assignment object:', assignment);

    this.kpiService.createAssignment(assignment).subscribe({
      next: (res) => {
        console.log('Tạo Assignment thành công:', res);
        alert('Tạo Assignment thành công!');
      },
      error: (err) => {
        console.error('Lỗi khi tạo Assignment:', err);
        alert('Có lỗi xảy ra khi tạo Assignment.');
      },
    });
  }
}
