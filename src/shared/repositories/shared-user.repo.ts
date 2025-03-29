import { Injectable } from '@nestjs/common'

import { User } from 'src/shared/models/shared-user.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUnique(where: Pick<User, 'id'> | Pick<User, 'email'>): Promise<User | null> {
    return this.prismaService.user.findUnique({ where })
  }
}
