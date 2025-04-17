import { Injectable } from '@nestjs/common'

import { PrismaService } from 'src/shared/services/prisma.service'

import { GetLanguageDataRes, GetLanguagesDataRes, LanguageModel } from 'src/routes/language/language.model'

@Injectable()
export class LanguageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  list(): Promise<GetLanguagesDataRes> {
    return this.prismaService.language.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  findById(id: LanguageModel['id']): Promise<GetLanguageDataRes | null> {
    return this.prismaService.language.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async create({ id, name, createdById }: Pick<LanguageModel, 'id' | 'name' | 'createdById'>): Promise<void> {
    await this.prismaService.language.create({
      data: { id, name, createdById },
    })
  }

  async update(id: LanguageModel['id'], data: Pick<LanguageModel, 'name' | 'updatedById'>): Promise<void> {
    const { name, updatedById } = data

    await this.prismaService.language.update({
      where: { id, deletedAt: null },
      data: { name, updatedById },
    })
  }

  async delete(id: LanguageModel['id'], isHard: boolean = true): Promise<void> {
    if (isHard) {
      await this.prismaService.language.delete({
        where: { id },
      })
    } else {
      await this.prismaService.language.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      })
    }
  }
}
