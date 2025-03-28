import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { RegisterBody, RegisterRes, User } from 'src/routes/auth/auth.model'

@Injectable()
export class AuthRepesitory {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(user: Omit<RegisterBody, 'confirmPassword'> & Pick<User, 'roleId'>): Promise<RegisterRes> {
    const { email, name, password, phoneNumber, roleId } = user

    return this.prismaService.user.create({
      data: {
        email,
        password,
        name,
        phoneNumber,
        roleId,
      },
      omit: {
        password: true,
        totpSecret: true,
        createdById: true,
        updatedById: true,
        deletedAt: true,
      },
    })
  }
}
