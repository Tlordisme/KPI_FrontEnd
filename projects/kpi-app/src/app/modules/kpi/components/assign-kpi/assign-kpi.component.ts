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
  onSubmit() {
    throw new Error('Method not implemented.');
  }
  principal: any = {};
  templates: any[] = [];
  selectedTemplateId: number | null = null;

  // Form tạo template mới
  showNewTemplateForm = false;
  newTemplate = { templateName: '', description: '' };

  // Sidebar
    sidebarOpen: boolean = false;
  // Form tạo Item
  item = {
    kpiName: '',
    kpiType: 'Chức năng',
    deadLine: '',
    weight: 0,
    calculationFormula: '',
  };
  model: any;
  users: any;
  units: any;
  kpiItems: any;

  constructor(
    private kpiService: KpiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // lấy user login
    const user: LoginResponse | null = this.authService.getUser();
    if (user) {
      this.principal = { name: user.fullName };
    }

    // load template
    this.kpiService.getTemplates().subscribe((res) => (this.templates = res));
  }

  onTemplateChange() {
    // Nếu người dùng chọn một template có sẵn, ẩn form tạo mới
    if (this.selectedTemplateId !== null) {
      this.showNewTemplateForm = false;
    }
  }

  openNewTemplate() {
    this.showNewTemplateForm = true;
    this.selectedTemplateId = null;
    this.newTemplate = { templateName: '', description: '' };
  }

  cancelNewTemplate() {
    this.showNewTemplateForm = false;
  }

  createTemplate() {
    // Kiểm tra form không được để trống
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
  goDashboard() {
    this.router.navigate(['/dashboard']);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
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
      this.item = { kpiName: "", kpiType: "Chức năng", deadLine:"",weight:0,calculationFormula:""};
    });
  }
}
