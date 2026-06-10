import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Password hashes
  const adminHash = await bcrypt.hash('AdminPassword123', 10);
  const salesHash = await bcrypt.hash('SalesPassword123', 10);
  const leadgenHash = await bcrypt.hash('LeadgenPassword123', 10);

  // 1. Clear database
  await prisma.leadTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.remark.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.importHistory.deleteMany();
  await prisma.exportHistory.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@crm.com',
      passwordHash: adminHash,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
      phone: '+15550100',
    },
  });

  const sales = await prisma.user.create({
    data: {
      email: 'sales@crm.com',
      passwordHash: salesHash,
      firstName: 'Sales',
      lastName: 'Agent',
      role: UserRole.SALES,
      isActive: true,
      phone: '+15550101',
    },
  });

  const leadgen = await prisma.user.create({
    data: {
      email: 'leadgen@crm.com',
      passwordHash: leadgenHash,
      firstName: 'Lead',
      lastName: 'Generator',
      role: UserRole.LEAD_GENERATOR,
      isActive: true,
      phone: '+15550102',
    },
  });

  console.log('Users created:');
  console.log(`- Admin: admin@crm.com / AdminPassword123 (ID: ${admin.id})`);
  console.log(`- Sales: sales@crm.com / SalesPassword123 (ID: ${sales.id})`);
  console.log(`- Leadgen: leadgen@crm.com / LeadgenPassword123 (ID: ${leadgen.id})`);

  // 3. Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'SaaS App', color: '#6366f1' } }),
    prisma.tag.create({ data: { name: 'Mobile App', color: '#10b981' } }),
    prisma.tag.create({ data: { name: 'Web Dev', color: '#f59e0b' } }),
    prisma.tag.create({ data: { name: 'AI/ML', color: '#ec4899' } }),
    prisma.tag.create({ data: { name: 'High Budget', color: '#ef4444' } }),
  ]);

  console.log(`Created ${tags.length} initial tags.`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
