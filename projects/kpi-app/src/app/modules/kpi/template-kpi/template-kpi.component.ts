import { Component, OnInit } from '@angular/core';
import { KpiService } from '../../../core/services/kpi/kpi.service';
import { EditField } from '../../../shared/components/form-edit/form-edit.component';
import { Router } from '@angular/router';
export interface KpiItem {
  id: number;
  kpiName: string;
  kpiType: string;
  weight: number;
  calculationFormula: string;
  kpiTemplateId: number;
  deadLine: string;
}
export interface KpiTemplate {
  id: number;
  templateName: string;
}

@Component({
  selector: 'app-template-kpi',
  templateUrl: './template-kpi.component.html',
  styleUrls: ['./template-kpi.component.scss'],
})
export class TemplateKpiComponent implements OnInit {
  data: KpiItem[] = [];
  templates: KpiTemplate[] = [];
  selectedTemplateId: number | '' = '';
  filterText = '';
  filteredData: KpiItem[] = [];
  groupedData: { type: string; items: KpiItem[] }[] = [];

  constructor(private kpiService: KpiService, private router: Router) {}

  // Sidebar
  sidebarOpen: boolean = false;

  ngOnInit(): void {
    this.loadTemplates();
    this.loadItems();
  }

  loadTemplates(): void {
    this.kpiService.getTemplates().subscribe({
      next: (res: KpiTemplate[]) => {
        this.templates = res;
      },
      error: (err) => console.error('Lỗi load templates:', err),
    });
  }

  loadItems(): void {
    this.kpiService.getItems().subscribe({
      next: (res: KpiItem[]) => {
        this.data = res;
        this.filteredData = [];
        this.groupedData = [];
      },
      error: (err) => console.error('Lỗi load items:', err),
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  applyFilter(): void {
    if (!this.selectedTemplateId) {
      this.filteredData = [];
      this.groupedData = [];
      return;
    }
    // Lọc theo templateId
    let filtered = [...this.data];
    const id = Number(this.selectedTemplateId);
    filtered = filtered.filter((item) => item.kpiTemplateId === id);

    // Lọc theo text search
    if (this.filterText.trim()) {
      const text = this.filterText.toLowerCase();
      filtered = filtered.filter((item) =>
        item.kpiName.toLowerCase().includes(text)
      );
    }

    this.filteredData = filtered;

    // Group theo kpiType
    const groups = filtered.reduce((acc, item) => {
      if (!acc[item.kpiType]) acc[item.kpiType] = [];
      acc[item.kpiType].push(item);
      return acc;
    }, {} as { [key: string]: KpiItem[] });

    this.groupedData = Object.keys(groups).map((key) => ({
      type: key,
      items: groups[key],
    }));
  }

  getTemplate(templateId: number): string {
    const template = this.templates.find((t) => t.id === templateId);
    return template ? template.templateName : `Template ${templateId}`;
  }

  editItem: KpiItem | null = null;

  kpiFields: EditField[] = [
    { key: 'kpiName', label: 'Tên KPI', type: 'text' },
    {
      key: 'kpiType',
      label: 'Loại KPI',
      type: 'select',
      options: [
        { value: 'Chức năng', label: 'Chức năng' },
        { value: 'Mục tiêu', label: 'Mục tiêu' },
        { value: 'Tuân thủ', label: 'Tuân thủ' },
      ],
    },
    { key: 'weight', label: 'Trọng số', type: 'number' },
    { key: 'deadLine', label: 'Ngày hết hạn', type: 'date' },
    { key: 'kpiTemplateId', label: 'Template', type: 'number', readonly: true },
    { key: 'calculationFormula', label: 'Công thức KPI', type: 'text' },
  ];

  // Mở form
  onEdit(item: KpiItem) {
    this.editItem = { ...item };
  }

  // Huỷ edit
  cancelEdit() {
    this.editItem = null;
  }

  // Submit edit
  submitEdit(updatedItem: KpiItem) {
    const updateDto = { ...updatedItem };
    this.kpiService.updateItem(updatedItem.id, updateDto).subscribe({
      next: (res) => {
        const index = this.data.findIndex((i) => i.id === res.id);
        if (index !== -1) this.data[index] = res;
        this.applyFilter();
        this.editItem = null;
        alert(`Cập nhật KPI "${res.kpiName}" thành công!`);
      },
      error: (err) => alert('Cập nhật KPI thất bại!'),
    });
  }

  onDelete(item: KpiItem) {
    if (!confirm(`Bạn có chắc muốn xoá KPI "${item.kpiName}" không?`)) return;

    this.kpiService.deleteItem(item.id).subscribe({
      next: () => {
        // Xoá khỏi db
        this.data = this.data.filter((i) => i.id !== item.id);
        this.applyFilter(); // cập nhật lại
      },
      error: (err) => {
        alert('Xoá KPI thất bại!');
      },
    });
  }


  exportToExcel(): void {
    if (this.selectedTemplateId) {
      this.kpiService.exportTemplateToExcel(Number(this.selectedTemplateId)).subscribe({
        next: (response: Blob) => {
          // Tạo một URL tạm thời cho blob
          const url = window.URL.createObjectURL(response);
          // Tạo một thẻ <a> ẩn để tải file
          const a = document.createElement('a');
          a.href = url;
          // Lấy tên template để đặt tên file
          const templateName = this.templates.find(t => t.id === Number(this.selectedTemplateId))?.templateName || 'Template';
          a.download = `KPI_${templateName}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
          alert('Đang tải file Excel...');
        },
        error: (err) => {
          console.error('Lỗi khi xuất file Excel:', err);
          alert('Không thể xuất file Excel. Vui lòng thử lại.');
        },
      });
    } else {
      alert('Vui lòng chọn một Template để xuất file.');
    }
  }
}
