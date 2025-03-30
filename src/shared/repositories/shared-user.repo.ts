import { Injectable } from '@nestjs/common'

import { UserModel } from 'src/shared/models/shared-user.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUnique(where: Pick<UserModel, 'id'> | Pick<UserModel, 'email'>): Promise<UserModel | null> {
    return this.prismaService.user.findUnique({ where })
  }
}
