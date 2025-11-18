import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        restaurant: true,
        chef: true,
        supplier: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, profileData } = body

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        restaurant: true,
        chef: true,
        supplier: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user and profile in a transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update basic user info
      const updated = await tx.user.update({
        where: { id: session.user.id },
        data: { name }
      })

      // Update role-specific profile
      if (user.role === 'OWNER' && profileData) {
        if (user.restaurant) {
          await tx.restaurant.update({
            where: { userId: session.user.id },
            data: {
              name: profileData.restaurantName,
              description: profileData.description,
              address: profileData.address,
              phone: profileData.phone,
            }
          })
        } else {
          await tx.restaurant.create({
            data: {
              userId: session.user.id,
              name: profileData.restaurantName || 'My Restaurant',
              description: profileData.description,
              address: profileData.address,
              phone: profileData.phone,
            }
          })
        }
      } else if (user.role === 'CHEF' && profileData) {
        if (user.chef) {
          await tx.chef.update({
            where: { userId: session.user.id },
            data: {
              bio: profileData.bio,
              specialty: profileData.specialty,
              experience: profileData.experience,
            }
          })
        } else {
          await tx.chef.create({
            data: {
              userId: session.user.id,
              bio: profileData.bio,
              specialty: profileData.specialty,
              experience: profileData.experience,
            }
          })
        }
      } else if (user.role === 'SUPPLIER' && profileData) {
        if (user.supplier) {
          await tx.supplier.update({
            where: { userId: session.user.id },
            data: {
              companyName: profileData.companyName,
              description: profileData.description,
              address: profileData.address,
              region: profileData.region,
              phone: profileData.phone,
              email: profileData.email,
              deliveryInfo: profileData.deliveryInfo,
            }
          })
        } else {
          await tx.supplier.create({
            data: {
              userId: session.user.id,
              companyName: profileData.companyName || 'My Company',
              description: profileData.description,
              address: profileData.address,
              region: profileData.region,
              phone: profileData.phone,
              email: profileData.email || updated.email,
              deliveryInfo: profileData.deliveryInfo,
            }
          })
        }
      }

      return updated
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      }
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
