import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KpiService } from '../../../../core/services/kpi/kpi.service';
import {
  AuthService,
  LoginResponse,
} from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-assign-kpi',
  templateUrl: './assign-kpi.component.html',
  styleUrls: ['./assign-kpi.component.scss'],
})
export class AssignKpiComponent implements OnInit {
  principal: any = {};
  templates: any[] = [];
  selectedTemplateId: number | null = null;
  itemsByTemplate: any[] = [];

  showNewTemplateForm = false;
  newTemplate = { templateName: '', description: '' };

  sidebarOpen: boolean = false;
  item = {
    kpiName: '',
    kpiType: 'Chức năng',
    deadLine: '',
    weight: 0,
    calculationFormula: '',
  };
  kpiItems: any[] = []; // Chắc chắn khai báo là mảng

  // Biến mới cho chức năng sửa
  isEditing = false;
  editingItem: any = {};

  constructor(
    private kpiService: KpiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user: LoginResponse | null = this.authService.getUser();
    if (user) {
      this.principal = { name: user.fullName };
    }
    this.loadTemplatesAndItems();
  }

  loadTemplatesAndItems() {
    this.kpiService.getTemplates().subscribe((res) => {
      this.templates = res;

      this.kpiService.getCreatedItems().subscribe((res) => {
        this.kpiItems = res;

        // Tự động load item của template đầu tiên nếu có
        if (this.templates.length > 0 && this.selectedTemplateId === null) {
          this.selectedTemplateId = this.templates[0].id;
        }

        // Chỉ gọi khi selectedTemplateId chắc chắn khác null
        if (this.selectedTemplateId !== null) {
          this.loadItemsByTemplate(this.selectedTemplateId);
        }
      });
    });
  }
  loadItemsByTemplate(templateId: number) {
    this.selectedTemplateId = templateId;
    this.itemsByTemplate = this.kpiItems.filter(
      (item: any) => item.kpiTemplateId === templateId
    );
  }

  onTemplateChange() {
    if (this.selectedTemplateId !== null) {
      this.showNewTemplateForm = false;
      this.isEditing = false; // Khi đổi template, ẩn form sửa
      this.loadItemsByTemplate(this.selectedTemplateId);
    }
  }

  openNewTemplate() {
    this.showNewTemplateForm = true;
    this.selectedTemplateId = null;
    this.itemsByTemplate = [];
    this.newTemplate = { templateName: '', description: '' };
  }

  cancelNewTemplate() {
    this.showNewTemplateForm = false;
  }

  createTemplate() {
    if (!this.newTemplate.templateName || !this.newTemplate.description) {
      alert('Tên và mô tả template không được để trống.');
      return;
    }
    this.kpiService.createTemplate(this.newTemplate).subscribe((res) => {
      this.templates.push(res);
      this.selectedTemplateId = res.id;
      this.showNewTemplateForm = false;
    });
  }

  createItem() {
    if (!this.selectedTemplateId) {
      alert('Vui lòng chọn Template trước');
      return;
    }
    const dto = {
      ...this.item,
      kpiTemplateId: this.selectedTemplateId,
    };
    this.kpiService.createItem(dto).subscribe(() => {
      alert('✅ Tạo KPI thành công');
      this.loadTemplatesAndItems(); // Tải lại danh sách sau khi tạo
    });
  }

  goDashboard() {
    this.router.navigate(['/dashboard']);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // Phương thức mới để sửa KPI
  editItem(item: any) {
    this.isEditing = true;
    this.editingItem = { ...item }; // Sao chép đối tượng để không ảnh hưởng trực tiếp đến data
    // Nếu deadLine là chuỗi ISO, cần chuyển đổi sang định dạng 'yyyy-MM-dd' cho input type="date"
    if (this.editingItem.deadLine) {
      this.editingItem.deadLine = this.editingItem.deadLine.substring(0, 10);
    }
  }

  // Phương thức mới để hủy sửa
  cancelEdit() {
    this.isEditing = false;
    this.editingItem = {};
  }

  // Phương thức mới để cập nhật KPI
  updateItem() {
    this.kpiService.updateItem(this.editingItem.id, this.editingItem).subscribe(
      () => {
        alert('✅ Cập nhật KPI thành công');
        this.loadTemplatesAndItems(); // Tải lại danh sách sau khi cập nhật
        this.isEditing = false;
      },
      (error) => {
        alert('❌ Lỗi khi cập nhật KPI');
      }
    );
  }

  // Phương thức mới để xóa KPI
  deleteItem(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa KPI này không?')) {
      this.kpiService.deleteItem(id).subscribe(
        () => {
          alert('✅ Xóa KPI thành công');
          this.loadTemplatesAndItems(); // Tải lại danh sách sau khi xóa
        },
        (error) => {
          alert('❌ Lỗi khi xóa KPI');
        }
      );
    }
  }
}
