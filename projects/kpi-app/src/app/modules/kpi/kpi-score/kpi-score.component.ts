// src/app/modules/kpi/kpi-score/kpi-score.component.ts
import { Component, OnInit } from '@angular/core';
import { KpiService } from '../../../core/services/kpi/kpi.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Observable, forkJoin, of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';

// Giao diện cho các kiểu dữ liệu (đã cập nhật)
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
  rank?: string; // Thêm trường xếp loại
}

export interface AllMemberKpiScore extends UserKpiScore {
  unitName?: string;
}

export interface HeadOfUnitKpiScore extends UserKpiScore {}

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
  allMembersData: AllMemberKpiScore[] = [];
  loading = true;
  error: string | null = null;
  year = new Date().getFullYear();
  sidebarOpen: boolean = false;
  selectedUnitId: number | 'all' = 'all';

  constructor(
    private kpiService: KpiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAllKpiData();
  }

  loadAllKpiData(): void {
    this.loading = true;
    this.error = null;

    this.kpiService.getUnits().pipe(
      mergeMap(units => {
        if (!units || units.length === 0) {
          return of({ unitsData: [] });
        }

        const unitKpiRequests: Observable<UnitKpiDisplayData>[] = units.map(unit =>
          this.kpiService.getAssignmentsByUnit(unit.id, this.year).pipe(
            mergeMap(membersAssignments => {
              const memberKpiObservables = membersAssignments.map(assignment =>
                forkJoin({
                  score: this.kpiService.getComponentScoresByUserId(assignment.userId).pipe(
                    catchError(() => of(null))
                  ),
                  rank: this.kpiService.getUserRank(assignment.userId, this.year).pipe(
                    catchError(() => of(null))
                  ),
                  user: this.authService.getUserById(assignment.userId).pipe(
                    catchError(() => of(null))
                  ),
                }).pipe(
                  map(({ score, rank, user }) => {
                    if (!score || !user) return null;
                    return {
                      ...score,
                      userName: user.fullName,
                      rank: rank?.rank, // Gán xếp loại
                    } as UserKpiScore;
                  })
                )
              );

              const headOfUnitScore$ = unit.headOfUnitId
                ? forkJoin({
                    score: this.kpiService.getFinalScoreByUserId(unit.headOfUnitId).pipe(
                      catchError(() => of(null))
                    ),
                    rank: this.kpiService.getUserRank(unit.headOfUnitId, this.year).pipe(
                      catchError(() => of(null))
                    ),
                    user: this.authService.getUserById(unit.headOfUnitId).pipe(
                      catchError(() => of(null))
                    ),
                  }).pipe(
                    map(({ score, rank, user }) => {
                      if (!score || !user) return null;
                      return {
                        ...score,
                        userName: user.fullName,
                        rank: rank?.rank, // Gán xếp loại
                      } as HeadOfUnitKpiScore;
                    })
                  )
                : of(null);

              return forkJoin([...memberKpiObservables, headOfUnitScore$]).pipe(
                map(allResults => {
                  const headOfUnitScore = allResults.pop() as HeadOfUnitKpiScore | null;
                  const membersScores = allResults.filter(s => !!s && s.userId !== headOfUnitScore?.userId) as UserKpiScore[];

                  return {
                    unit,
                    headOfUnitScore,
                    membersScores,
                    isExpanded: false,
                  } as UnitKpiDisplayData;
                }),
                catchError(err => {
                  console.error(`Lỗi khi xử lý đơn vị ${unit.name}:`, err);
                  return of({
                    unit,
                    headOfUnitScore: null,
                    membersScores: [],
                    isExpanded: false,
                  } as UnitKpiDisplayData);
                })
              );
            })
          )
        );

        return forkJoin(unitKpiRequests).pipe(
          map(unitsData => ({
            unitsData,
          }))
        );
      }),
      catchError(err => {
        this.error = 'Đã xảy ra lỗi khi tải dữ liệu KPI.';
        console.error('Lỗi loadAllKpiData:', err);
        return of({ unitsData: [] });
      })
    ).subscribe({
      next: (data) => {
        this.allUnitsData = data.unitsData;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Lỗi không xác định khi tải dữ liệu.';
      },
    });
  }

  toggleExpansion(unitData: UnitKpiDisplayData): void {
    unitData.isExpanded = !unitData.isExpanded;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  get filteredUnitsData(): UnitKpiDisplayData[] {
    if (this.selectedUnitId === 'all') {
      return this.allUnitsData;
    }
    return this.allUnitsData.filter(u => u.unit.id === this.selectedUnitId);
  }
}
