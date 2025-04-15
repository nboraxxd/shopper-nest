import { PrismaService } from 'src/shared/services/prisma.service'

const prisma = new PrismaService()

async function addBrands() {
  const brands = Array(10000)
    .fill(0)
    .map((_, index) => ({ logo: `logo-${index}` }))

  try {
    const { count } = await prisma.brand.createMany({ data: brands })

    console.log(`Created ${count} brands`)
  } catch (error) {
    console.error('Error creating brands:', error)
  }
}

addBrands()
