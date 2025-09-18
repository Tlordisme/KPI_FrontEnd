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
  kpiName: string;
  kpiType: string;
  deadLine: Date;
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
  filteredUsers: any[] = [];
  templates: any[] = [];
  selectedTemplateId: number | null = null;
  itemsByTemplate: any[] = [];
  selectedItems: number[] = [];
  dropdownOpen = false;
  // Assignment data
  selectedUserId: number[] = [];
  selectedUnitId: number = 0;
  contributionWeight: number | null = null;
  selectedYear: number = new Date().getFullYear();

  constructor(
    private kpiService: KpiService,
    private authService: AuthService
  ) {
    document.addEventListener('click', () => {
      this.dropdownOpen = false;
    });
  }

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

  onUnitChange() {
    if (this.selectedUnitId) {
      this.filteredUsers = this.users.filter(
        (u: any) => u.unitId === this.selectedUnitId
      );
    } else {
      this.filteredUsers = [];
    }
    this.selectedUserId = [];
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
  onUserSelectionChange(userId: number, event: any) {
    if (event.target.checked) {
      this.selectedUserId.push(userId);
    } else {
      this.selectedUserId = this.selectedUserId.filter((id) => id !== userId);
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
      this.selectedUserId.length === 0 ||
      !this.selectedUnitId ||
      !this.selectedYear ||
      this.selectedTemplateId === null
    ) {
      alert(
        'Vui lòng điền đầy đủ thông tin: Người nhận, Đơn vị, Năm và Template.'
      );
      return;
    }

    if (this.selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một KPI Item.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const total = this.selectedUserId.length * this.selectedItems.length;

    this.selectedUserId.forEach((userId) => {
      this.selectedItems.forEach((itemId) => {
          const selectedItem = this.itemsByTemplate.find(i => i.id === itemId);
          if (!selectedItem) return;
        const dto: AssignItemDto = {
          userId: userId,
          unitId: this.selectedUnitId,
          kpiItemId: itemId,
          year: this.selectedYear,
          contributionWeight: this.contributionWeight ?? 0,
          kpiName: selectedItem.kpiName,
          kpiType: selectedItem.kpiType,
          deadLine: new Date(selectedItem.deadLine)
        };

        this.kpiService.assignItem(dto).subscribe({
          next: () => {
            successCount++;
            if (successCount + errorCount === total) {
              alert(`Giao thành công ${successCount}, lỗi ${errorCount}`);
              this.resetForm();
            }
          },
          error: (err) => {
            errorCount++;
            console.error(
              `Lỗi khi giao KPI cho user ${userId}, item ${itemId}:`,
              err
            );
            if (successCount + errorCount === total) {
              alert(`Giao thành công ${successCount}, lỗi ${errorCount}`);
              this.resetForm();
            }
          },
        });
      });
    });
  }
  get selectedUserNames() {
    return this.filteredUsers
      .filter((u) => this.selectedUserId.includes(u.id))
      .map((u) => u.fullName);
  }
  toggleDropdown(event: Event) {
    this.dropdownOpen = !this.dropdownOpen;
    event.stopPropagation();
  }

  resetForm() {
    this.selectedUserId = [];
    this.selectedUnitId = 0;
    this.selectedTemplateId = null;
    this.itemsByTemplate = [];
    this.selectedItems = [];
    this.contributionWeight = null;
    this.selectedYear = new Date().getFullYear();
  }
}
