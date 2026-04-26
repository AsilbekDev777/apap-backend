import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'apap_user',
    password: process.env.DB_PASS ?? 'apap_pass',
    database: process.env.DB_NAME ?? 'apap_db',
    entities: ['src/database/entities/*.entity.ts'],
  });

  await dataSource.initialize();

  const userRepo = dataSource.getRepository('users');

  const existing = await userRepo.findOne({
    where: { email: 'admin@apap.uz' },
  });

  if (!existing) {
    const hash = await bcrypt.hash('Admin123!', 12);
    await userRepo.save({
      email: 'admin@apap.uz',
      passwordHash: hash,
      role: 'admin',
      lang: 'uz',
      isActive: true,
    });
    console.log('✅ Admin user yaratildi: admin@apap.uz / Admin123!');
  } else {
    console.log('ℹ️  Admin user allaqachon mavjud');
  }

  await dataSource.destroy();
}

seed().catch(console.error);
