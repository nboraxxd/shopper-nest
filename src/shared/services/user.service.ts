import { HttpException, Injectable } from '@nestjs/common'

import { UserStatus } from 'src/shared/constants/user.constant'
import { UserRepository } from 'src/shared/repositories/user.repo'
import { UserIdentifier, UserModel } from 'src/shared/models/user.model'
import { UserBlockedException, UserNotFoundException } from 'src/shared/models/error.model'

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * validate and get valid user by userIdentifier
   * @param userIdentifier
   * @param option.isActiveRequired - optional isActiveRequired, default is true
   * @param option.select - optional select fields, default is all fields
   * @returns UserModel
   */
  async getValidatedUser<T>(
    userIdentifier: UserIdentifier,
    option?: {
      select?: Partial<Record<keyof UserModel, boolean>>
      shouldRequireActiveUser?: boolean
      notFoundException?: HttpException
      blockedException?: HttpException
    }
  ): Promise<T> {
    const isActiveRequired = option?.shouldRequireActiveUser ?? true

    const user = await this.userRepository.findUnique<T & { status: (typeof UserStatus)[keyof typeof UserStatus] }>(
      userIdentifier,
      option?.select ? { ...option.select, status: true } : undefined
    )

    if (!user) {
      if (option?.notFoundException) {
        throw option.notFoundException
      } else {
        throw UserNotFoundException
      }
    }

    if (isActiveRequired && user.status === UserStatus.BLOCKED) {
      if (option?.blockedException) {
        throw option.blockedException
      } else {
        throw UserBlockedException
      }
    }

    return user as T
  }
}
