import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import prisma from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role, profileData } = body

    // Validation
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Validate role
    const validRoles: UserRole[] = ['OWNER', 'CHEF', 'SUPPLIER', 'ADMIN']
    if (!validRoles.includes(role as UserRole)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user and profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role as UserRole,
        }
      })

      // Create role-specific profile
      if (role === 'OWNER' && profileData) {
        await tx.restaurant.create({
          data: {
            userId: newUser.id,
            name: profileData.restaurantName || 'My Restaurant',
            description: profileData.description,
            address: profileData.address,
            phone: profileData.phone,
          }
        })
      } else if (role === 'CHEF' && profileData) {
        await tx.chef.create({
          data: {
            userId: newUser.id,
            bio: profileData.bio,
            specialty: profileData.specialty,
            experience: profileData.experience,
          }
        })
      } else if (role === 'SUPPLIER' && profileData) {
        await tx.supplier.create({
          data: {
            userId: newUser.id,
            companyName: profileData.companyName || 'My Company',
            description: profileData.description,
            address: profileData.address,
            region: profileData.region,
            phone: profileData.phone,
            email: profileData.email || newUser.email,
            deliveryInfo: profileData.deliveryInfo,
          }
        })
      }

      return newUser
    })

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
