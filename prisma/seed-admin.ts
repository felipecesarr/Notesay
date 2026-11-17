import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  void 0;

  const email = process.env.ADMIN_EMAIL?.trim();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error('Set ADMIN_EMAIL to an address you control before seeding an admin.');
  }

  const adminEmails = [
    {
      email,
      name: 'Admin Principal',
      role: 'super_admin',
    },
  ];

  for (const admin of adminEmails) {
    await prisma.adminEmail.upsert({
      where: { email: admin.email },
      update: { name: admin.name, role: admin.role },
      create: admin,
    });
    void 0;
  }

  void 0;
}

main()
  .catch(() => console.error("Notesay operation failed."))
  .finally(() => prisma.$disconnect());
