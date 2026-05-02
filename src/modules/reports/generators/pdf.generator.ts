import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

export interface StudentReportData {
  student: {
    firstName: string;
    lastName: string;
    studentNumber: string;
    group: string;
    faculty: string;
  };
  grades: {
    courseName: string;
    gradeTypeName: string;
    score: number;
  }[];
  gpa100: number;
  gpa5: number;
  semester: string;
}

@Injectable()
export class PdfGenerator {
  async generateStudentCard(data: StudentReportData): Promise<Buffer> {
    const html = this.buildStudentCardHtml(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private buildStudentCardHtml(data: StudentReportData): string {
    const gradesRows = data.grades
      .map(
        (g) => `
        <tr>
          <td>${g.courseName}</td>
          <td>${g.gradeTypeName}</td>
          <td>${g.score}</td>
        </tr>
      `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html lang="uz">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; font-size: 14px; color: #333; }
          h1 { text-align: center; font-size: 18px; margin-bottom: 20px; }
          .info-table { width: 100%; margin-bottom: 20px; }
          .info-table td { padding: 6px 10px; border: 1px solid #ddd; }
          .info-table td:first-child { font-weight: bold; width: 180px; background: #f5f5f5; }
          .grades-table { width: 100%; border-collapse: collapse; }
          .grades-table th { background: #2c3e50; color: white; padding: 8px; text-align: left; }
          .grades-table td { padding: 7px 10px; border: 1px solid #ddd; }
          .grades-table tr:nth-child(even) { background: #f9f9f9; }
          .gpa-block { margin-top: 20px; padding: 12px; background: #eaf4fb; border-radius: 6px; }
          .gpa-block span { font-weight: bold; font-size: 16px; }
        </style>
      </head>
      <body>
        <h1>Akademik ma'lumotnoma</h1>

        <table class="info-table">
          <tr><td>Ism Familya</td><td>${data.student.lastName} ${data.student.firstName}</td></tr>
          <tr><td>Talaba raqami</td><td>${data.student.studentNumber}</td></tr>
          <tr><td>Guruh</td><td>${data.student.group}</td></tr>
          <tr><td>Fakultet</td><td>${data.student.faculty}</td></tr>
          <tr><td>Semestr</td><td>${data.semester}</td></tr>
        </table>

        <table class="grades-table">
          <thead>
            <tr>
              <th>Fan</th>
              <th>Baho turi</th>
              <th>Ball</th>
            </tr>
          </thead>
          <tbody>
            ${gradesRows}
          </tbody>
        </table>

        <div class="gpa-block">
          GPA: <span>${data.gpa100}</span> ball
          &nbsp;|&nbsp;
          <span>${data.gpa5}</span> (5 ballik)
        </div>
      </body>
      </html>
    `;
  }
}
