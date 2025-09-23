import { Component, OnInit } from '@angular/core';
import { KpiService } from '../../../core/services/kpi/kpi.service';
import { forkJoin, Observable, of } from 'rxjs'; // Import 'of'
import { AuthService } from '../../../core/services/auth/auth.service';
import { EditField } from '../../../shared/components/form-edit/form-edit.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, mergeMap, catchError } from 'rxjs/operators'; // Import catchError

// Interfaces cho chi tiết vi phạm cá nhân
export interface ViolationDetail {
  categoryId: number;
  categoryName: string;
  totalCount: number;
  totalComponent: number;
}

// Interface gốc từ API getAllUserViolations
export interface ViolationSummary {
  userId: number;
  details: ViolationDetail[];
  totalDeduction: number;
}

// Interface mở rộng cho ViolationSummary để thêm thông tin unitId, userName, unitName sau khi xử lý
export interface EnhancedViolationSummary extends ViolationSummary {
  unitId?: number; // Thêm unitId vào đây sau khi fetch user info
  userName?: string; // Thêm userName
  unitName?: string; // Thêm unitName
  isExpanded?: boolean;
}

// Interface cho cấu trúc nhóm vi phạm theo đơn vị
export interface UnitViolationGroup {
  unitId: number;
  unitName: string;
  members: EnhancedViolationSummary[]; // Danh sách các thành viên vi phạm trong đơn vị này
  totalUnitDeduction: number; // Tổng điểm trừ của cả đơn vị
   isExpanded?: boolean;
}

// Interfaces cho cấu hình KPI cá nhân/đơn vị
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

// Interfaces cho form tạo mới
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

// Interfaces cho dữ liệu vi phạm Đơn vị từ API /Violation/unit/{unitId}
export interface UnitViolationDetailData { // Đổi tên để tránh trùng với ViolationDetail
  categoryId: number;
  categoryName: string;
  averageDeduction: number;
  totalComponent: number;
}

export interface UnitViolationData {
  unitId: number;
  unitName: string;
  details: UnitViolationDetailData[]; // Sử dụng UnitViolationDetailData
  totalDeduction: number;
  isExpanded?: boolean;
}


@Component({
  selector: 'app-violation-kpi',
  templateUrl: './violation-kpi.component.html',
  styleUrls: ['./violation-kpi.component.scss'],
})
export class ViolationKpiComponent implements OnInit {
  // Biến để lưu dữ liệu vi phạm của các cá nhân đã được nhóm theo đơn vị
  groupedViolations: UnitViolationGroup[] = [];

  // Biến để lưu dữ liệu vi phạm tổng hợp của TẤT CẢ các đơn vị
  allUnitsViolations: UnitViolationData[] = [];

  // Các biến khác cho KPI cá nhân, đơn vị, forms
  personalKpis: ViolationItem[] = [];
  unitKpis: ViolationItem[] = []; // Đây là KPI categories for units, không phải vi phạm của đơn vị
  units: any[] = [];
  users: any[] = [];
  filteredUsers: any[] = [];
  createCategory: any = null;
  categories: any[] = [];
  sidebarOpen = false;
  createViolation: ViolationSelfEvaluate | null = null;
  createLevel: ViolationLevelCreate | null = null;
  maxLevelCount = 0;

  constructor(
    private kpiService: KpiService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  ngOnInit(): void {
    this.loadViolations(); // Tải vi phạm cá nhân và nhóm theo đơn vị
    this.loadViolationCategories(); // Tải danh mục vi phạm (để điền dropdown và bảng KPI)
    this.loadUnitsAndUsers(); // Tải danh sách đơn vị và người dùng (dùng cho form Ghi vi phạm)
    this.loadAllUnitsViolations(); // Tải dữ liệu vi phạm tổng hợp của tất cả các đơn vị
  }

  /**
   * Tải tất cả vi phạm của người dùng, làm giàu thông tin unitId/userName/unitName,
   * sau đó nhóm chúng theo đơn vị.
   */
  loadViolations() {
    this.kpiService.getAllUserViolations().pipe(
      mergeMap((res: ViolationSummary[]) => {
        if (res.length === 0) return of([]);

        const enhancedViolations$: Observable<EnhancedViolationSummary>[] = res.map((v: ViolationSummary) =>
          this.authService.getUserById(v.userId).pipe(
            mergeMap((user: any) => {
              // Khởi tạo EnhancedViolationSummary với các giá trị mặc định
              let enhancedV: EnhancedViolationSummary = {
                ...v,
                unitId: 0, // Mặc định là 0 hoặc một giá trị không hợp lệ
                userName: 'Người dùng không xác định',
                unitName: 'Đơn vị không xác định',
                isExpanded: false // Mặc định là đóng
              };

              if (user) {
                enhancedV.userName = user.fullName || 'Người dùng không rõ tên';
                if (user.unitId) {
                  enhancedV.unitId = user.unitId;
                  // Nếu có unitId, fetch thông tin đơn vị
                  return this.kpiService.getUnitById(user.unitId).pipe(
                    map((unit: any) => {
                      enhancedV.unitName = unit?.name || 'Đơn vị không rõ tên';
                      return enhancedV;
                    }),
                    catchError(error => {
                      console.warn(`Lỗi khi lấy thông tin đơn vị cho unitId ${user.unitId}:`, error);
                      // Vẫn trả về enhancedV với thông tin đơn vị mặc định/lỗi
                      return of(enhancedV);
                    })
                  );
                }
              }
              // Trả về enhancedV nếu không có user, hoặc có user nhưng không có unitId
              return of(enhancedV);
            }),
            catchError(error => {
              console.warn(`Lỗi khi lấy thông tin người dùng cho userId ${v.userId}:`, error);
              // Nếu lỗi khi lấy người dùng, vẫn trả về vi phạm với thông tin lỗi
              const enhancedV: EnhancedViolationSummary = {
                ...v,
                unitId: 0,
                userName: 'Lỗi tải người dùng',
                unitName: 'Lỗi tải đơn vị',
                isExpanded: false
              };
              return of(enhancedV);
            })
          )
        );
        return forkJoin(enhancedViolations$);
      }),
      map((enhancedViolations: EnhancedViolationSummary[]) => {
        const grouped: { [unitId: number]: UnitViolationGroup } = {};

        enhancedViolations.forEach((v) => {
          const unitId = v.unitId || 0; // Đảm bảo luôn có unitId để nhóm
          const unitName = v.unitName || 'Đơn vị không xác định';

          if (!grouped[unitId]) {
            grouped[unitId] = {
              unitId: unitId,
              unitName: unitName,
              members: [],
              totalUnitDeduction: 0,
              isExpanded: false // Mặc định là đóng cho nhóm đơn vị
            };
          }
          // Kiểm tra xem thành viên đã tồn tại trong nhóm chưa để tránh trùng lặp
          // (đây là một trường hợp có thể xảy ra nếu API trả về nhiều ViolationSummary cho cùng một userId)
          // Nếu ViolationSummary đại diện cho TỔNG vi phạm của một user, thì không cần kiểm tra trùng lặp
          // Nếu ViolationSummary đại diện cho MỘT vi phạm cụ thể, thì cần cân nhắc logic này
          // Hiện tại, tôi giả định ViolationSummary là TỔNG vi phạm của một user, nên cứ push vào
          grouped[unitId].members.push(v);
          grouped[unitId].totalUnitDeduction += v.totalDeduction;
        });

        return Object.values(grouped).sort((a, b) => a.unitName.localeCompare(b.unitName));
      })
    ).subscribe({
      next: (groupedData: UnitViolationGroup[]) => {
        this.groupedViolations = groupedData;
        console.log('Grouped Violations by Unit:', this.groupedViolations);
      },
      error: (err) => console.error('Lỗi khi lấy dữ liệu vi phạm cá nhân:', err),
    });
  }

  /**
   * Tải dữ liệu vi phạm tổng hợp của tất cả các đơn vị.
   * Lấy danh sách đơn vị trước, sau đó gọi API lấy vi phạm cho từng đơn vị.
   */
  loadAllUnitsViolations(): void {
    this.kpiService.getUnits().pipe(
      mergeMap((units: any[]) => {
        if (units.length === 0) {
          return of([]); // Trả về Observable của mảng rỗng nếu không có đơn vị nào
        }
        const unitViolationRequests: Observable<UnitViolationData>[] = units.map((unit) =>
          this.kpiService.getUnitViolationsById(unit.id).pipe(
            // Nếu có lỗi khi lấy dữ liệu của một đơn vị, trả về một đối tượng rỗng cho đơn vị đó
            catchError((error) => {
              console.warn(`Lỗi khi lấy vi phạm cho đơn vị ${unit.name} (ID: ${unit.id}):`, error);
              return of({ unitId: unit.id, unitName: unit.name, details: [], totalDeduction: 0 });
            })
          )
        );
        return forkJoin(unitViolationRequests); // Chờ tất cả các request hoàn thành
      })
    ).subscribe({
      next: (allUnitViolationsData: UnitViolationData[]) => {
        this.allUnitsViolations = allUnitViolationsData;
        // console.log('Dữ liệu vi phạm của tất cả các đơn vị:', this.allUnitsViolations);
      },
      error: (err) => console.error('Lỗi khi tải vi phạm của tất cả các đơn vị:', err),
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
        // Cập nhật options cho categoryId trong form ghi vi phạm
        const categoryField = this.violationFields.find(
          (f) => f.key === 'categoryId'
        );
        if (categoryField) {
          categoryField.options = this.personalKpis.map((c) => ({
            value: c.id,
            label: c.name,
          }));
        }
        // Gán options cho categoryId trong form tạo level
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
      error: (err) => console.error('Lỗi khi tải danh mục vi phạm:', err),
    });
  }

  loadUnitsAndUsers() {
    const currentUser = this.authService.getUser();
    const currentUserId = currentUser?.userID;
    this.kpiService.getUnits().subscribe({
      next: (units) => {
        this.units = units;
        this.authService.getUsers().subscribe((users) => {
          this.users = users
            .filter((u) => u.id !== currentUserId)
            .map((u: any) => {
              const unit = this.units.find((x: any) => x.id === u.unitId);
              const isHead = unit && unit.headOfUnitId === u.id;
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
           // Cập nhật options cho dropdown userId sau khi filteredUsers đã sẵn sàng
           const userField = this.violationFields.find((f) => f.key === 'userId');
           if (userField) {
             userField.options = this.users.map((u) => ({
               value: u.id,
               label: u.fullName,
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
      },
      error: (err) => console.error('Lỗi khi lấy danh sách category:', err),
    });
  }

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
        this.loadViolationCategories(); // Tải lại để cập nhật danh sách và dropdown
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
        this.loadViolationCategories(); // Tải lại danh sách category + levels
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
  categoryFields: EditField[] = [
    { key: 'name', label: 'Tên KPI', type: 'text' },
    { key: 'targetValue', label: 'Mục tiêu', type: 'number' },
    { key: 'calculationFormula', label: 'Công thức tính', type: 'text' },
  ];

  onUnitChange(unitId: number) {
    this.filteredUsers = this.users.filter((u) => u.unitId === unitId);

    const userField = this.violationFields.find((f) => f.key === 'userId');
    if (userField) {
      userField.options = this.filteredUsers.map((u) => ({
        value: u.id,
        label: u.fullName,
      }));
    }

    if (
      this.createViolation &&
      !this.filteredUsers.find((u) => u.id === this.createViolation?.userId)
    ) {
      this.createViolation.userId = 0;
    }
  }

  submit(updatedItem: any) {
    if (!updatedItem) {
      alert('Dữ liệu vi phạm chưa được nhập!');
      return;
    }
    this.kpiService.createViolation(updatedItem).subscribe({
      next: (res) => {
        this.createViolation = null;
        alert(`Ghi vi phạm thành công cho userId: ${res.userId}`);
        this.loadViolations(); // Load lại danh sách violations cá nhân
        this.loadAllUnitsViolations(); // Load lại danh sách vi phạm đơn vị (nếu có ảnh hưởng)
      },
      error: (err) => {
        console.error(err);
        alert('Ghi vi phạm thất bại!');
      },
    });
  }

  cancel() {
    this.createViolation = null;
  }


  // Hàm để toggle trạng thái mở/đóng của một đơn vị
  toggleUnitExpansion(unitGroup: UnitViolationGroup): void {
    unitGroup.isExpanded = !unitGroup.isExpanded;
  }

  // Hàm để toggle trạng thái mở/đóng của một cá nhân
  toggleMemberExpansion(member: EnhancedViolationSummary): void {
    member.isExpanded = !member.isExpanded;
  }

  toggleAllUnitViolationExpansion(unitViolation: UnitViolationData): void {
    unitViolation.isExpanded = !unitViolation.isExpanded;
  }
  // Hàm sắp xếp maxDeduction hiển thị từ lớn đến nhỏ
  getSortedLevels() {
  return [...(this.personalKpis[0]?.levels ?? [])]
    .sort((a, b) => b.maxDeduction - a.maxDeduction);
}

}
