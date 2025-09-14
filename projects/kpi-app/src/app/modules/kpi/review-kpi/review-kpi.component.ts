// src/app/modules/kpi/review-kpi/review-kpi.component.ts
import { Component, OnInit } from '@angular/core';
import { KpiService } from '../../../core/services/kpi/kpi.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface ApproveKpiAssignmentBulkDto {
  assignmentIds: number[];
  action: string; // THÊM TRƯỜNG ACTION NÀY
  comment?: string;
}

interface KpiItemGroup {
  type: string;
  items: any[];
}

@Component({
  selector: 'app-review-kpi',
  templateUrl: './review-kpi.component.html',
  styleUrls: ['./review-kpi.component.scss'],
})
export class ReviewKpiComponent implements OnInit {
  sidebarOpen: boolean = false;
  selectedYear: number = new Date().getFullYear();
  availableYears: number[] = [2024, 2025, 2026];

  allUsers: any[] = [];
  allKpiItems: any[] = [];

  private _rawUnitAssignments: any[] = [];
  private _rawMemberAssignments: any[] = [];

  // THÊM CÁC BIẾN PUBLIC MỚI NÀY
  unitDropdownOptions: any[] = []; // Dùng để hiển thị trong dropdown chọn đơn vị
  memberDropdownOptions: any[] = []; // Dùng để hiển thị trong dropdown chọn thành viên

  filteredUnitAssignments: any[] = [];
  selectedUnitForReviewId: number = 0;
  expandedUnitId: number | null = null;

  filteredMemberAssignments: any[] = [];
  selectedMemberForReviewId: number = 0;
  expandedMemberId: number | null = null;

  showRejectDialog: boolean = false;
  currentRejectAssignment: any = null;
  rejectReason: string = '';
  rejectAssignmentType: 'Unit' | 'Member' | null = null;

  // KHAI BÁO BIẾN MỚI NÀY
  assignmentsToProcess: number[] = [];
  constructor(
    private kpiService: KpiService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadInitialDataAndAssignments();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  loadInitialDataAndAssignments(): void {
    forkJoin({
      users: this.authService.getUsers(),
      kpiItems: this.kpiService.getAllKpiItems(),
    }).subscribe({
      next: (data) => {
        this.allUsers = data.users;
        this.allKpiItems = data.kpiItems;
        console.log('Fetched allKpiItems:', this.allKpiItems);
        this.loadAssignments();
      },
      error: (err) =>
        console.error('Lỗi khi tải dữ liệu ban đầu (users, kpiItems):', err),
    });
  }

  loadAssignments(): void {
    forkJoin({
      unitAssignments: this.kpiService.getUnitAssignments(this.selectedYear),
      memberAssignments: this.kpiService.getAssignmentsByUnitMembers(
        this.selectedYear
      ),
    }).subscribe({
      next: (data) => {
        this._rawUnitAssignments = this.mapAssignments(
          data.unitAssignments,
          'unit'
        );
        this._rawMemberAssignments = this.mapAssignments(
          data.memberAssignments,
          'member'
        );

        // GÁN GIÁ TRỊ TỪ BIẾN PRIVATE SANG BIẾN PUBLIC Ở ĐÂY
        this.unitDropdownOptions = [...this._rawUnitAssignments];
        this.memberDropdownOptions = [...this._rawMemberAssignments];

        console.log('Mapped Unit Assignments (raw):', this._rawUnitAssignments);
        console.log(
          'Mapped Member Assignments (raw):',
          this._rawMemberAssignments
        );

        this.filterUnitAssignments();
        this.filterMemberAssignments();
      },
      error: (err) => console.error('Lỗi khi tải assignments:', err),
    });
  }

  mapAssignments(assignments: any[], type: 'unit' | 'member'): any[] {
    return assignments.map((assignment) => {
      const mappedItems = assignment.kpiItems.map((item: any) => {
        const kpiDefinition = this.allKpiItems.find(
          (k) => k.id === item.kpiItemId
        );
        if (!kpiDefinition) {
          console.warn(
            `Không tìm thấy định nghĩa KPI gốc cho kpiItemId: ${item.kpiItemId}`
          );
        }
        return {
          ...item,
          kpiName: kpiDefinition?.kpiName || 'Không rõ tên KPI',
          kpiType: kpiDefinition?.kpiType || 'Chưa phân loại',
          deadLine: kpiDefinition?.deadLine
            ? new Date(kpiDefinition.deadLine)
            : null,
        };
      });

      const processedAssignment = {
        ...assignment,
        kpiItems: mappedItems,
        groupedKpiItems: this.groupKpiItems(mappedItems),
      };

      if (type === 'unit') {
        const headOfUnit = this.allUsers.find(
          (u) => u.id === assignment.userId
        );
        return {
          ...processedAssignment,
          headOfUnitName: headOfUnit ? headOfUnit.fullName : 'Không rõ',
        };
      } else {
        const user = this.allUsers.find((u) => u.id === assignment.userId);
        return {
          ...processedAssignment,
          userName: user ? user.fullName : 'Không rõ',
        };
      }
    });
  }

  groupKpiItems(kpiItems: any[]): KpiItemGroup[] {
    const grouped: { [key: string]: any[] } = {};
    kpiItems.forEach((item) => {
      const type =
        item.kpiType && item.kpiType.trim() !== ''
          ? item.kpiType
          : 'Chưa phân loại';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(item);
    });

    const result: KpiItemGroup[] = Object.keys(grouped).map((type) => ({
      type: type,
      items: grouped[type],
    }));

    result.sort((a, b) => a.type.localeCompare(b.type));
    console.log('Result of groupKpiItems:', result);
    return result;
  }

  filterUnitAssignments(): void {
    if (this.selectedUnitForReviewId === 0) {
      this.filteredUnitAssignments = [...this._rawUnitAssignments];
    } else {
      this.filteredUnitAssignments = this._rawUnitAssignments.filter(
        (assignment) => assignment.unitId === this.selectedUnitForReviewId
      );
    }
    console.log(
      'Filtered Unit Assignments after filter:',
      this.filteredUnitAssignments
    );
  }

  filterMemberAssignments(): void {
    if (this.selectedMemberForReviewId === 0) {
      this.filteredMemberAssignments = [...this._rawMemberAssignments];
    } else {
      this.filteredMemberAssignments = this._rawMemberAssignments.filter(
        (assignment) => assignment.userId === this.selectedMemberForReviewId
      );
    }
    console.log(
      'Filtered Unit Assignments after filter:',
      this.filteredMemberAssignments
    );
  }

  toggleUnitExpansion(unitId: number): void {
    this.expandedUnitId = this.expandedUnitId === unitId ? null : unitId;
    if (
      this.showRejectDialog &&
      this.currentRejectAssignment?.unitId !== unitId &&
      this.rejectAssignmentType === 'Unit'
    ) {
      this.hideRejectDialog();
    }
  }

  isUnitExpanded(unitId: number): boolean {
    return this.expandedUnitId === unitId;
  }

  toggleMemberExpansion(userId: number): void {
    this.expandedMemberId = this.expandedMemberId === userId ? null : userId;
    if (
      this.showRejectDialog &&
      this.currentRejectAssignment?.userId !== userId &&
      this.rejectAssignmentType === 'Member'
    ) {
      this.hideRejectDialog();
    }
  }

  isMemberExpanded(userId: number): boolean {
    return this.expandedMemberId === userId;
  }

  getStatusName(status: string): string {
    switch (status) {
      case 'Assigned':
        return 'Đã Giao';
      case 'Evaluated':
        return 'Đã hoàn thành đánh giá';
      case 'Approved':
        return 'Đã phê duyệt';
      case 'Rejected':
        return 'Từ chối';
      default:
        return 'Không rõ';
    }
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'Assigned':
        return 'assigned';
      case 'Evaluated':
        return 'evaluated';
      case 'Approved':
        return 'approved';
      case 'Rejected':
        return 'rejected';
      default:
        return '';
    }
  }

  //  private getAssignmentIdsForEntity(entity: any, type: 'Unit' | 'Member'): number[] {
  //   let assignments: any[] = [];
  //   if (type === 'Unit') {
  //     // Tìm đối tượng đơn vị trong mảng dữ liệu gốc
  //     const foundEntity = this._rawUnitAssignments.find(a => a.unitId === entity.unitId);
  //     if (foundEntity && foundEntity.kpiItems) {
  //       assignments = foundEntity.kpiItems;
  //     }
  //   } else {
  //     // Tìm đối tượng thành viên trong mảng dữ liệu gốc
  //     const foundEntity = this._rawMemberAssignments.find(a => a.userId === entity.userId);
  //     if (foundEntity && foundEntity.kpiItems) {
  //       assignments = foundEntity.kpiItems;
  //     }
  //   }

  //   // Lọc ra những kpiItems có status là 'Evaluated' và map lấy assignmentId
  //   return assignments
  //     .filter(item => item.status === 'Evaluated') // Chỉ phê duyệt những cái đã được đánh giá
  //     .map(item => item.assignmentId);
  // }

  // Phương thức phê duyệt (đã được sửa ở câu trả lời trước, không cần sửa lại)
  approveAssignment(assignment: any, type: 'Unit' | 'Member'): void {
    // CHỈ CẦN KIỂM TRA TRẠNG THÁI CỦA ASSIGNMENT CHA
    if (assignment.status !== 'Evaluated') {
      this.snackBar.open(
        `Chỉ có thể phê duyệt khi Assignment đang ở trạng thái "Đã đánh giá". Hiện tại: ${this.getStatusName(assignment.status)}`,
        'Đóng',
        { duration: 3000, panelClass: ['snackbar-error'] }
      );
      return;
    }

    const confirmApprove = confirm(
      `Bạn có chắc muốn phê duyệt tất cả KPI của ${
        type === 'Unit' ? assignment.unitName : assignment.userName
      } không?`
    );

    if (confirmApprove) {
      // Lấy danh sách IDs của tất cả KPI items từ assignment này
      const assignmentIdsToApprove = assignment.kpiItems.map((item: any) => item.assignmentId);

      const dto: any = {
        assignmentIds: assignmentIdsToApprove,
        action: 'Approve',
        comment: 'Đã phê duyệt',
      };

      this.kpiService.approveKpiAssignmentsBulk(dto).subscribe({
        next: () => {
          this.snackBar.open('Phê duyệt thành công!', 'Đóng', {
            duration: 3000,
            panelClass: ['snackbar-success'],
          });
          this.loadAssignments();
        },
        error: (err) => {
          console.error('Lỗi khi phê duyệt Assignment:', err);
          this.snackBar.open('Lỗi khi phê duyệt: ' + (err.error?.message || err.message), 'Đóng', {
            duration: 5000,
            panelClass: ['snackbar-error'],
          });
        },
      });
    }
  }

  // Phương thức hiển thị dialog từ chối
  showRejectAssignmentDialog(assignment: any, type: 'Unit' | 'Member'): void {
    // CHỈ CẦN KIỂM TRA TRẠNG THÁI CỦA ASSIGNMENT CHA
    if (assignment.status !== 'Evaluated') {
      this.snackBar.open(
        `Chỉ có thể từ chối khi Assignment đang ở trạng thái "Đã đánh giá". Hiện tại: ${this.getStatusName(assignment.status)}`,
        'Đóng',
        { duration: 3000, panelClass: ['snackbar-error'] }
      );
      return;
    }

    this.currentRejectAssignment = assignment;
    this.rejectAssignmentType = type;
    this.rejectReason = '';
    this.showRejectDialog = true;

    // Lưu danh sách IDs từ kpiItems của assignment cha vào biến mới đã khai báo
    this.assignmentsToProcess = assignment.kpiItems.map((item: any) => item.assignmentId);
  }

  // Phương thức xác nhận từ chối
  confirmRejectAssignment(): void {
    if (!this.rejectReason.trim()) {
      this.snackBar.open('Vui lòng nhập lý do từ chối.', 'Đóng', {
        duration: 3000,
      });
      return;
    }

    const dto: any = {
      assignmentIds: this.assignmentsToProcess,
      action: 'Rejected',
      comment: this.rejectReason,
    };

    this.kpiService.rejectKpiAssignmentsBulk(dto).subscribe({
      next: () => {
        this.snackBar.open('Từ chối thành công!', 'Đóng', {
          duration: 3000,
          panelClass: ['snackbar-success'],
        });
        this.hideRejectDialog();
        this.loadAssignments();
      },
      error: (err) => {
        console.error('Lỗi khi từ chối Assignment:', err);
        this.snackBar.open('Lỗi khi từ chối: ' + (err.error?.message || err.message), 'Đóng', {
          duration: 5000,
          panelClass: ['snackbar-error'],
        });
      },
    });
  }

  hideRejectDialog(): void {
    this.showRejectDialog = false;
    this.currentRejectAssignment = null;
    this.rejectReason = '';
    this.rejectAssignmentType = null;
  }
}
