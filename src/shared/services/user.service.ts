import { Injectable } from '@nestjs/common'

import { UserStatus } from 'src/shared/constants/user.constant'
import { UserRepository } from 'src/shared/repositories/user.repo'
import { UserIdentifier, UserModel } from 'src/shared/models/user.model'
import { UserBlockedException, UserNotFoundException } from 'src/shared/models/error.model'

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getValidatedUser(
    userIdentifier: UserIdentifier,
    option?: { select?: Partial<Record<keyof UserModel, boolean>>; isActiveRequired?: boolean }
  ): Promise<UserModel> {
    const isActiveRequired = option?.isActiveRequired ?? true

    const user = await this.userRepository.findUnique(userIdentifier, option?.select)

    if (!user) {
      throw UserNotFoundException
    }

    if (isActiveRequired && user.status === UserStatus.BLOCKED) {
      throw UserBlockedException
    }

    return user
  }
}
