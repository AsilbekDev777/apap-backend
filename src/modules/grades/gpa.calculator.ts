import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm'; // typeorm dan import
import { Grade } from '../../database/entities/grade.entity';
import { GpaCache } from '../../database/entities/gpa-cache.entity';
import { GradeType } from '../../database/entities/grade-type.entity';
import { Course } from '../../database/entities/course.entity';

interface CourseGrade {
  courseId: string;
  creditHours: number;
  finalScore: number;
}

@Injectable()
export class GpaCalculator {
  constructor(
    @InjectRepository(Grade)
    private gradeRepo: Repository<Grade>,

    @InjectRepository(GradeType)
    private gradeTypeRepo: Repository<GradeType>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  static toGpa5(score100: number): number {
    if (score100 >= 86) return 5.0;
    if (score100 >= 71) return 4.0;
    if (score100 >= 56) return 3.0;
    return 2.0;
  }

  static toGrade(score100: number): string {
    if (score100 >= 86) return 'A';
    if (score100 >= 71) return 'B';
    if (score100 >= 56) return 'C';
    return 'D';
  }

  async recalculate(
    studentId: string,
    semesterId: string,
    manager: EntityManager,
  ): Promise<{ gpa100: number; gpa5: number }> {
    const grades = await manager.find(Grade, {
      where: { studentId, semesterId },
      relations: ['gradeType', 'course'],
    });

    if (grades.length === 0) {
      return { gpa100: 0, gpa5: 0 };
    }

    const courseMap = new Map<string, Grade[]>();
    for (const grade of grades) {
      const existing = courseMap.get(grade.courseId) ?? [];
      existing.push(grade);
      courseMap.set(grade.courseId, existing);
    }

    const courseGrades: CourseGrade[] = [];

    for (const [courseId, courseGradeList] of courseMap) {
      const course = await manager.findOne(Course, { where: { id: courseId } });
      if (!course) continue;

      let totalWeighted = 0;
      let totalWeight = 0;

      for (const g of courseGradeList) {
        const weight = Number(g.gradeType.weightPercent);
        const score = Number(g.score);
        totalWeighted += score * weight;
        totalWeight += weight;
      }

      const finalScore = totalWeight > 0 ? totalWeighted / totalWeight : 0;

      courseGrades.push({
        courseId,
        creditHours: course.creditHours,
        finalScore,
      });
    }

    let totalWeightedScore = 0;
    let totalCredits = 0;

    for (const cg of courseGrades) {
      totalWeightedScore += cg.finalScore * cg.creditHours;
      totalCredits += cg.creditHours;
    }

    const gpa100 =
      totalCredits > 0
        ? Math.round((totalWeightedScore / totalCredits) * 100) / 100
        : 0;

    const gpa5 = GpaCalculator.toGpa5(gpa100);

    await manager.upsert(
      GpaCache,
      {
        studentId,
        semesterId,
        gpa100,
        gpa5,
        updatedAt: new Date(),
      },
      ['studentId', 'semesterId'],
    );

    return { gpa100, gpa5 };
  }
}
