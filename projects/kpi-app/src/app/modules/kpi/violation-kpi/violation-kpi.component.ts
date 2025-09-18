import { Component, OnInit } from '@angular/core';
import { KpiService } from '../../../core/services/kpi/kpi.service';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth/auth.service';
import { EditField } from '../../../shared/components/form-edit/form-edit.component';
import { MatSnackBar } from '@angular/material/snack-bar';
export interface ViolationDetail {
  categoryId: number;
  categoryName: string;
  totalCount: number;
  totalComponent: number;
}

export interface ViolationSummary {
  userId: number;
  userName?: string;
  unitName?: string;
  details: ViolationDetail[];
  totalDeduction: number;
}
export interface ViolationLevel {
  id: number;
  categoryId: number;
  maxDeduction: number;
  violationCount: number;
  description: string;
}

export interface ViolationItem {
  id: number;
  name: string;
  targetValue?: number;
  calculationFormula?: string;
  levels?: ViolationLevel[];
}
export interface ViolationSelfEvaluate {
  userId: number;
  unitId: number;
  categoryId: number;
  violationCount: number;
  violationDate: string;
}
export interface ViolationLevelCreate {
  categoryId: number;
  categoryName?: string;
  maxDeduction: number;
  violationCount: number;
  description: string;
}

@Component({
  selector: 'app-violation-kpi',
  templateUrl: './violation-kpi.component.html',
  styleUrls: ['./violation-kpi.component.scss'],
})
export class ViolationKpiComponent implements OnInit {
  violations: ViolationSummary[] = [];
  personalKpis: ViolationItem[] = [];
  unitKpis: ViolationItem[] = [];
  units: any[] = [];
  users: any[] = [];
  filteredUsers: any[] = [];
  createCategory: any = null;
  categories: any[] = [];
  sidebarOpen = false;
  createViolation: ViolationSelfEvaluate | null = null;

  constructor(
    private kpiService: KpiService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  maxLevelCount = 0;
  ngOnInit(): void {
    this.loadViolations();
    this.loadViolationCategories();
    this.loadUnitsAndUsers();
  }

  loadViolations() {
    this.kpiService.getAllUserViolations().subscribe({
      next: (res: ViolationSummary[]) => {
        // Tạo các request để lấy thông tin user
        const userRequests = res.map((v) =>
          this.authService.getUserById(v.userId)
        );
        forkJoin(userRequests).subscribe((users) => {
          // Gán tên user vào từng violation
          res.forEach((v, idx) => {
            const user = users[idx];
            v.userName = user?.fullName;
            // Gọi API lấy unit theo unitId của user
            this.kpiService.getUnitById(user.unitId).subscribe((unit) => {
              v.unitName = unit?.name;
            });
          });

          this.violations = res;
        });
      },
      error: (err) => console.error('Lỗi khi lấy dữ liệu vi phạm:', err),
    });
  }
  loadViolationCategories() {
    this.kpiService.getCategoryWithLevels().subscribe({
      next: (res: ViolationItem[]) => {
        this.personalKpis = res; // cá nhân có levels
        this.unitKpis = res.map((k) => ({
          id: k.id,
          name: k.name,
          targetValue: k.targetValue,
          calculationFormula: k.calculationFormula,
        }));
        // Cập nhật maxLevelCount để render đủ cột
        this.maxLevelCount = this.personalKpis.reduce(
          (max, kpi) => Math.max(max, kpi.levels?.length || 0),
          0
        );
        // Cập nhật options cho categoryId
        const categoryField = this.violationFields.find(
          (f) => f.key === 'categoryId'
        );
        if (categoryField) {
          categoryField.options = this.personalKpis.map((c) => ({
            value: c.id,
            label: c.name,
          }));
        }
        // Gán options cho levelFields
        const categoryFieldForLevel = this.levelFields.find(
          (f) => f.key === 'categoryId'
        );
        if (categoryFieldForLevel) {
          categoryFieldForLevel.options = this.personalKpis.map((c) => ({
            value: c.id,
            label: c.name,
          }));
        }
      },
      error: (err) => console.error(err),
    });
  }

  // Load data from API
  loadUnitsAndUsers() {
    const currentUser = this.authService.getUser();
    const currentUserId = currentUser?.userID;
    this.kpiService.getUnits().subscribe({
      next: (units) => {
        this.units = units;
        this.authService.getUsers().subscribe((users) => {
          this.users = users
            .filter((u: any) => u.userID !== currentUserId)
            .map((u: any) => {
              const unit = this.units.find((x: any) => x.id === u.unitId);
              const isHead = unit && unit.headOfUnitId === u.id; // check trưởng khoa
              let fullName = u.fullName;
              if (isHead) {
                fullName += ' (Trưởng khoa)';
              }
              return {
                ...u,
                unitName: unit ? unit.name : 'Chưa có đơn vị',
                fullName: fullName,
              };
            });
          const unitField = this.violationFields.find(
            (f) => f.key === 'unitId'
          );
          if (unitField) {
            unitField.options = this.units.map((u) => ({
              value: u.id,
              label: u.name,
            }));
          }
        });
      },
      error: (err) => console.error('Lỗi khi lấy Units hoặc Users:', err),
    });
  }
  loadCategories() {
    this.kpiService.getCategoryWithLevels().subscribe({
      next: (res: any[]) => {
        this.categories = res;

        // Nếu muốn cập nhật dropdown hoặc map gì đó thì làm ở đây
      },
      error: (err) => console.error('Lỗi khi lấy danh sách category:', err),
    });
  }
  // Tạo mới category
  onCreateCategory() {
    this.createCategory = {
      name: '',
      targetValue: 0,
      calculationFormula: '',
    };
  }
  onCreateLevel(category?: ViolationItem) {
    this.createLevel = {
      categoryId: category?.id || 0,
      categoryName: category?.name || '',
      maxDeduction: 0,
      violationCount: 0,
      description: '',
    };
  }

  // Submit category
  submitCategory(updatedItem: any) {
    if (!updatedItem) {
      alert('Dữ liệu category chưa được nhập!');
      return;
    }

    this.kpiService.createCategory(updatedItem).subscribe({
      next: (res) => {
        this.createCategory = null;
        this.snackBar.open(`Tạo category thành công: ${res.name}`, 'Đóng', {
          duration: 3000,
        });
      },
      error: (err) => {
        console.error(err);
        alert('Tạo category thất bại!');
      },
    });
  }
  submitLevel(updatedItem: any) {
    if (!updatedItem) {
      alert('Dữ liệu level chưa được nhập!');
      return;
    }

    this.kpiService.createCategoryLevel(updatedItem).subscribe({
      next: (res) => {
        alert(`Tạo level thành công cho categoryId: ${res.categoryId}`);
        this.createLevel = null;

        // Nếu muốn, load lại danh sách category + levels
        this.loadCategories();
        this.loadViolationCategories();
      },
      error: (err) => {
        console.error(err);
        alert('Tạo level thất bại!');
      },
    });
  }

  cancelLevel() {
    this.createLevel = null;
  }

  // Hủy edit
  cancelCategory() {
    this.createCategory = null;
  }

  onCreate() {
    this.createViolation = {
      userId: 0,
      unitId: 0,
      categoryId: 0,
      violationCount: 0,
      violationDate: new Date().toISOString(),
    };
  }

  violationFields: EditField[] = [
    {
      key: 'unitId',
      label: 'Đơn vị',
      type: 'select',
      options: [],
      onChange: (value) => this.onUnitChange(value),
    },
    { key: 'userId', label: 'Người vi phạm', type: 'select', options: [] },
    { key: 'categoryId', label: 'Loại vi phạm', type: 'select', options: [] },
    { key: 'violationCount', label: 'Số vi phạm', type: 'number' },
    { key: 'violationDate', label: 'Ngày vi phạm', type: 'date' },
  ];
  categoryFields: EditField[] = [
    { key: 'name', label: 'Tên KPI', type: 'text' },
    { key: 'targetValue', label: 'Mục tiêu', type: 'number' },
    { key: 'calculationFormula', label: 'Công thức tính', type: 'text' },
  ];
  createLevel: ViolationLevelCreate | null = null;

  levelFields: EditField[] = [
    {
      key: 'categoryId',
      label: 'Loại vi phạm',
      type: 'select',
      options: [],
    },
    {
      key: 'maxDeduction',
      label: 'Mức độ',
      type: 'select',
      options: [
        { value: 30, label: '30' },
        { value: 10, label: '10' },
        { value: 5, label: '5' },
        { value: 2, label: '2' },
        { value: 1, label: '1' },
      ],
    },
    { key: 'violationCount', label: 'Số lần vi phạm', type: 'number' },
    { key: 'description', label: 'Mô tả', type: 'text' },
  ];
  onUnitChange(unitId: number) {
    this.filteredUsers = this.users.filter((u) => u.unitId === unitId);

    // Cập nhật options cho dropdown userId
    const userField = this.violationFields.find((f) => f.key === 'userId');
    if (userField) {
      userField.options = this.filteredUsers.map((u) => ({
        value: u.id,
        label: u.fullName,
      }));
    }

    // Reset userId nếu user không còn trong filteredUsers
    if (
      this.createViolation &&
      !this.filteredUsers.find((u) => u.id === this.createViolation?.userId)
    ) {
      this.createViolation.userId = 0;
    }
  }

  // Nhận dữ liệu từ form-edit
  submit(updatedItem: any) {
    if (!updatedItem) {
      alert('Dữ liệu vi phạm chưa được nhập!');
      return;
    }

    this.kpiService.createViolation(updatedItem).subscribe({
      next: (res) => {
        // Reset form
        this.createViolation = null;
        alert(`Ghi vi phạm thành công cho userId: ${res.userId}`);

        // Load lại danh sách violations
        this.loadViolations();
      },
      error: (err) => {
        console.error(err);
        alert('Ghi vi phạm thất bại!');
      },
    });
  }
  // Huỷ edit
  cancel() {
    this.createViolation = null;
  }
}
