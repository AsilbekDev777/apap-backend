import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

export interface GroupReportData {
  groupName: string;
  semester: string;
  students: {
    firstName: string;
    lastName: string;
    studentNumber: string;
    gpa100: number;
    gpa5: number;
  }[];
}

@Injectable()
export class ExcelGenerator {
  async generateGroupReport(data: GroupReportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'APAP';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(`${data.groupName} — ${data.semester}`);

    // Header styling
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C3E50' },
      },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    // Ustunlar
    sheet.columns = [
      { header: '#', key: 'index', width: 5 },
      { header: 'Familya Ism', key: 'fullName', width: 25 },
      { header: 'Talaba raqami', key: 'studentNumber', width: 15 },
      { header: 'GPA (100)', key: 'gpa100', width: 12 },
      { header: 'GPA (5)', key: 'gpa5', width: 10 },
      { header: 'Baho', key: 'grade', width: 8 },
    ];

    // Header styling
    sheet.getRow(1).eachCell((cell) => {
      Object.assign(cell, headerStyle);
    });
    sheet.getRow(1).height = 25;

    // Ma'lumotlar
    data.students.forEach((student, index) => {
      const grade =
        student.gpa100 >= 86
          ? 'A'
          : student.gpa100 >= 71
            ? 'B'
            : student.gpa100 >= 56
              ? 'C'
              : 'D';

      const row = sheet.addRow({
        index: index + 1,
        fullName: `${student.lastName} ${student.firstName}`,
        studentNumber: student.studentNumber,
        gpa100: student.gpa100,
        gpa5: student.gpa5,
        grade,
      });

      // Alternating row color
      if (index % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9F9F9' },
          };
        });
      }

      // GPA ranglar
      const gpaCell = row.getCell('gpa100');
      if (student.gpa100 >= 86) {
        gpaCell.font = { color: { argb: 'FF27AE60' }, bold: true };
      } else if (student.gpa100 < 56) {
        gpaCell.font = { color: { argb: 'FFE74C3C' }, bold: true };
      }
    });

    // Title qo'shish
    sheet.spliceRows(1, 0, []);
    sheet.getRow(1).getCell(1).value =
      `${data.groupName} — ${data.semester} — Akademik ko'rsatkichlar`;
    sheet.mergeCells(1, 1, 1, 6);
    sheet.getRow(1).getCell(1).style = {
      font: { bold: true, size: 14 },
      alignment: { horizontal: 'center' },
    };
    sheet.getRow(1).height = 30;

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
