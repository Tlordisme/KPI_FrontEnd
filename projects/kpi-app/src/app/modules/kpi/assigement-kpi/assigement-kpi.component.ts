import { Component, OnInit } from '@angular/core';
import { KpiService } from '../../../core/services/kpi/kpi.service';
import { AuthService } from '../../../core/services/auth/auth.service';

// Interface mới cho DTO gửi đi
export interface AssignItemDto {
  userId: number;
  unitId: number;
  kpiItemId: number;
  contributionWeight?: number;
  year: number;
}

@Component({
  selector: 'app-assigement-kpi',
  templateUrl: './assigement-kpi.component.html',
  styleUrls: ['./assigement-kpi.component.scss'],
})
export class AssigementKpiComponent implements OnInit {
  // Variables for UI logic
  sidebarOpen: boolean = false;
  units: any[] = [];
  users: any[] = [];
  filteredUnits: any[] = [];
  templates: any[] = [];
  selectedTemplateId: number | null = null;
  itemsByTemplate: any[] = [];
  selectedItems: number[] = [];

  // Assignment data
  selectedUserId: number = 0;
  selectedUnitId: number = 0;
  contributionWeight: number | null = null;
  selectedYear: number = new Date().getFullYear();

  constructor(
    private kpiService: KpiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUnitsAndUsers();
    this.loadTemplates();
  }

  // UI logic
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  get selectedUserUnitName(): string {
    if (!this.selectedUserId) return 'Chưa chọn người dùng';
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
      if (this.filteredUnits.length > 0) {
        this.selectedUnitId = this.filteredUnits[0].id;
      } else {
        this.selectedUnitId = 0;
      }
    } else {
      this.filteredUnits = [];
      this.selectedUnitId = 0;
    }
  }

  // Load data from API
  loadUnitsAndUsers() {
    this.kpiService.getUnits().subscribe({
      next: (units) => {
        this.units = units;
        this.authService.getUsers().subscribe((users) => {
          this.users = users.map((u: any) => {
            const unit = this.units.find((x: any) => x.id === u.unitId);
            return { ...u, unitName: unit ? unit.name : 'Chưa có đơn vị' };
          });
        });
      },
      error: (err) => console.error('Lỗi khi lấy Units hoặc Users:', err),
    });
  }

  loadTemplates() {
    this.kpiService.getTemplates().subscribe({
      next: (templates) => (this.templates = templates),
      error: (err) => console.error('Lỗi khi lấy Templates:', err),
    });
  }

  onTemplateChange() {
    this.selectedItems = []; // Reset danh sách đã chọn
    if (this.selectedTemplateId !== null) {
      this.kpiService.getTemplateItems(this.selectedTemplateId).subscribe({
        next: (items) => {
          this.itemsByTemplate = items.map((item: any) => ({
            ...item,
            isSelected: true, // MẶC ĐỊNH CHỌN TẤT CẢ
          }));
          this.selectedItems = this.itemsByTemplate.map((item) => item.id);
        },
        error: (err) => {
          console.error('Lỗi khi lấy KPI Items của Template:', err);
          this.itemsByTemplate = [];
        },
      });
    } else {
      this.itemsByTemplate = [];
    }
  }

  onItemSelectionChange(itemId: number, event: any) {
    const isChecked = event.target.checked;
    const item = this.itemsByTemplate.find((i) => i.id === itemId);
    if (item) {
      item.isSelected = isChecked;
    }
    if (isChecked) {
      this.selectedItems.push(itemId);
    } else {
      this.selectedItems = this.selectedItems.filter((id) => id !== itemId);
    }
  }

  // Hàm giao KPI duy nhất, sử dụng AssignItemDto cho mỗi item được chọn
  assignKpis() {
    if (
      !this.selectedUserId ||
      !this.selectedUnitId ||
      !this.selectedYear ||
      this.selectedTemplateId === null
    ) {
      alert(
        'Vui lòng điền đầy đủ thông tin: Người nhận, Đơn vị, Năm và chọn Template.'
      );
      return;
    }

    if (this.selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một KPI Item.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const totalItems = this.selectedItems.length;

    this.selectedItems.forEach((itemId) => {
      const dto: AssignItemDto = {
        userId: this.selectedUserId,
        unitId: this.selectedUnitId,
        kpiItemId: itemId,
        year: this.selectedYear,
        contributionWeight: this.contributionWeight ?? undefined,
      };

      this.kpiService.assignItem(dto).subscribe({
        next: () => {
          successCount++;
          if (successCount + errorCount === totalItems) {
            alert(
              `Giao thành công ${successCount} KPI Items. Có ${errorCount} lỗi.`
            );
            this.resetForm();
          }
        },
        error: (err) => {
          errorCount++;
          console.error(`Lỗi khi giao KPI Item ${itemId}:`, err);
          if (successCount + errorCount === totalItems) {
            alert(
              `Giao thành công ${successCount} KPI Items. Có ${errorCount} lỗi.`
            );
            this.resetForm();
          }
        },
      });
    });
  }

  resetForm() {
    this.selectedUserId = 0;
    this.selectedUnitId = 0;
    this.selectedTemplateId = null;
    this.itemsByTemplate = [];
    this.selectedItems = [];
    this.contributionWeight = null;
    this.selectedYear = new Date().getFullYear();
  }
}
