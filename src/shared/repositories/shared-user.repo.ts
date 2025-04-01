import { Injectable } from '@nestjs/common'
import { RoleModel } from 'src/routes/auth/auth.model'

import { UserModel } from 'src/shared/models/shared-user.model'
import { PrismaService } from 'src/shared/services/prisma.service'

type UserIdentifier = Pick<UserModel, 'id'> | Pick<UserModel, 'email'>

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUnique(where: UserIdentifier): Promise<UserModel | null> {
    return this.prismaService.user.findUnique({ where })
  }

  async findUniqueIncludeRole(where: UserIdentifier): Promise<(UserModel & { role: RoleModel }) | null> {
    return this.prismaService.user.findUnique({ where, include: { role: true } })
  }

  async update(where: UserIdentifier, data: Partial<Omit<UserModel, 'id'>>): Promise<UserModel> {
    return this.prismaService.user.update({ where, data })
  }
}
