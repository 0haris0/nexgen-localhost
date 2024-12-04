// prisma/seed.js
import {PrismaClient} from '@prisma/client';


const prisma = new PrismaClient();

async function main() {
  // Create plans if they don't already exist
  const plans = [
    {
      id         : 1,
      name       : 'Trial plan',
      price      : 0.0,
      description: 'Trial plan',
      credits    : 100,
    },
    {
      id         : 2,
      name       : 'Basic plan',
      price      : 5.99,
      description: 'Basic plan with limited features',
      credits    : 1000,
    },
    {
      id         : 3,
      name       : 'Professional plan',
      price      : 9.99,
      description: 'Professional plan with more features',
      credits    : 2500,
    },
    {
      id         : 4,
      name       : 'Enterprise plan',
      price      : 29.99,
      description: 'Enterprise plan with all features',
      credits    : 6500,
    },
  ];

  for (const plan of plans) {
    // Use `upsert` to avoid duplicating data
    try {

      await prisma.plan.upsert({
        where : {id: plan.id}, // Use the name as a unique identifier
        update: {
          name       : plan.name,
          price      : plan.price,
          description: plan.description,
          credits    : plan.credits,
        }, // No updates in this case, just avoiding duplicates
        create: {
          name       : plan.name,
          price      : plan.price,
          description: plan.description,
          credits    : plan.credits,
        },
      });
    } catch (error) {
      console.error(`Error creating plan with ID ${plan.id}: ${error.message}`);
    }
  }

  console.log('Seeding completed.');
}

main().then(async () =>
{
await prisma.$disconnect();
}).catch(async (e) =>
{
console.error(e);
await prisma.$disconnect();
process.exit(1);
});
