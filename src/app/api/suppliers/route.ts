import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/suppliers - Get all suppliers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const region = searchParams.get('region')

    const where: any = {}

    if (region) {
      where.region = region
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
          }
        },
        products: {
          include: {
            ingredient: true,
          }
        }
      },
      orderBy: {
        companyName: 'asc'
      }
    })

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    )
  }
}

// POST /api/suppliers - Create supplier profile (for current user)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'SUPPLIER') {
      return NextResponse.json(
        { error: 'Unauthorized. Only supplier accounts can create supplier profiles.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { companyName, description, address, region, phone, email, deliveryInfo } = body

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    // Check if supplier profile already exists
    const existing = await prisma.supplier.findUnique({
      where: { userId: session.user.id }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Supplier profile already exists' },
        { status: 409 }
      )
    }

    const supplier = await prisma.supplier.create({
      data: {
        userId: session.user.id,
        companyName,
        description,
        address,
        region,
        phone,
        email,
        deliveryInfo,
      }
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error('Error creating supplier:', error)
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    )
  }
}
