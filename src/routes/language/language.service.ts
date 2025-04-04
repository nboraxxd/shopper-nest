import { Injectable } from '@nestjs/common'

import { ListResponse } from 'src/shared/types/response.type'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/utils/errors'

import {
  CreateLanguageBody,
  GetLanguageDataRes,
  LanguageParam,
  GetLanguagesDataRes,
  UpdateLanguageBody,
} from 'src/routes/language/language.model'
import { LanguageRepesitory } from 'src/routes/language/language.repo'
import { LanguageIdAlreadyExistsException, LanguageNotFoundException } from 'src/routes/language/language.error'

@Injectable()
export class LanguageService {
  constructor(private readonly languageRepesitory: LanguageRepesitory) {}

  async list(): Promise<ListResponse<GetLanguagesDataRes>> {
    const result = await this.languageRepesitory.list()

    return { data: result, totalItems: result.length }
  }

  async findById(id: LanguageParam['id']): Promise<GetLanguageDataRes> {
    const result = await this.languageRepesitory.findById(id)

    if (!result) {
      throw LanguageNotFoundException
    }

    return result
  }

  async create({ id, name, userId }: CreateLanguageBody & { userId: AccessTokenPayload['userId'] }): Promise<void> {
    try {
      await this.languageRepesitory.create({ id, name, createdById: userId })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw LanguageIdAlreadyExistsException
      }
      throw error
    }
  }

  async update(
    id: LanguageParam['id'],
    payload: UpdateLanguageBody & { userId: AccessTokenPayload['userId'] }
  ): Promise<void> {
    const { name, userId } = payload

    try {
      await this.languageRepesitory.update(id, { name, updatedById: userId })
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw LanguageNotFoundException
      }
      throw error
    }
  }

  async delete(id: LanguageParam['id']): Promise<void> {
    try {
      await this.languageRepesitory.delete(id)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw LanguageNotFoundException
      }
      throw error
    }
  }
}
