// src/app/modules/kpi/kpi-score/kpi-score.component.ts
import { Component, OnInit } from '@angular/core';
import { KpiService } from '../../../core/services/kpi/kpi.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Observable, forkJoin, of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';

// Giao diện cho các kiểu dữ liệu
export interface Unit {
  id: number;
  name: string;
  headOfUnitId: number;
}

export interface UserKpiScore {
  userId: number;
  unitId: number;
  year: number;
  scoresByType: {
    kpiType: string;
    totalComponentScore: number;
  }[];
  finishTotal: number;
  userName?: string;
}

export interface HeadOfUnitKpiScore extends UserKpiScore {}

// Cấu trúc dữ liệu để hiển thị
export interface UnitKpiDisplayData {
  unit: Unit;
  headOfUnitScore: HeadOfUnitKpiScore | null;
  membersScores: UserKpiScore[];
  isExpanded: boolean;
}

@Component({
  selector: 'app-kpi-score',
  templateUrl: './kpi-score.component.html',
  styleUrls: ['./kpi-score.component.scss'],
})
export class KpiScoreComponent implements OnInit {
  allUnitsData: UnitKpiDisplayData[] = [];
  loading = true;
  error: string | null = null;
  year = new Date().getFullYear();
  sidebarOpen: boolean = false;

  constructor(private kpiService: KpiService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadAllUnitsKpiData();
  }

  loadAllUnitsKpiData(): void {
    this.loading = true;
    this.error = null;

    this.kpiService.getUnits().pipe(
      mergeMap((units: Unit[]) => {
        if (!units || units.length === 0) {
          return of([]);
        }

        const unitKpiRequests: Observable<UnitKpiDisplayData>[] = units.map((unit) =>
          forkJoin({
            headOfUnit: this.authService.getUserById(unit.headOfUnitId).pipe(catchError(() => of(null))),
            allUnitAssignments: this.kpiService.getAssignmentsByUnitMembers(this.year).pipe(catchError(() => of([]))),
          }).pipe(
            mergeMap((results) => {
              const headOfUnitUser = results.headOfUnit;
              const allUnitAssignments = results.allUnitAssignments;

              const membersAssignments = allUnitAssignments.filter(
                (assignment: any) => assignment.unitId === unit.id
              );

              const memberKpiObservables = membersAssignments.map((assignment: any) =>
                this.kpiService.getComponentScoresByUserId(assignment.userId).pipe(
                  mergeMap(memberScore =>
                    this.authService.getUserById(assignment.userId).pipe(
                      map(user => ({ ...memberScore, userName: user?.fullName || 'Người dùng không xác định' })),
                      catchError(() => of({ ...memberScore, userName: 'Không rõ' } as UserKpiScore)) // Đảm bảo kiểu trả về là UserKpiScore
                    )
                  ),
                  catchError(() => of(null)) // Vẫn trả về null nếu request lỗi hoàn toàn
                )
              );

              const headOfUnitScore$ = unit.headOfUnitId ? this.kpiService.getFinalScoreByUserId(unit.headOfUnitId).pipe(
                catchError(() => of(null))
              ) : of(null);

              return forkJoin([
                ...memberKpiObservables,
                headOfUnitScore$
              ]).pipe(
                map((allResults) => {
                  const membersScores = allResults.slice(0, allResults.length - 1).filter((s): s is UserKpiScore => s !== null);
                  const headOfUnitScore = allResults[allResults.length - 1];

                  return {
                    unit: unit,
                    headOfUnitScore: headOfUnitScore,
                    membersScores: membersScores,
                    isExpanded: false,
                  };
                }),
                catchError(err => {
                  console.error(`Lỗi khi xử lý dữ liệu cho đơn vị ${unit.name}:`, err);
                  return of({
                    unit: unit,
                    headOfUnitScore: null,
                    membersScores: [],
                    isExpanded: false,
                  });
                })
              );
            })
          )
        );
        return forkJoin(unitKpiRequests);
      }),
      catchError((err) => {
        this.error = 'Đã xảy ra lỗi khi tải dữ liệu KPI. Vui lòng thử lại sau.';
        console.error('Lỗi chính trong loadAllUnitsKpiData:', err);
        return of([]);
      })
    ).subscribe({
      next: (data) => {
        this.allUnitsData = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Lỗi không xác định khi tải dữ liệu.';
      }
    });
  }

  toggleExpansion(unitData: UnitKpiDisplayData): void {
    unitData.isExpanded = !unitData.isExpanded;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
