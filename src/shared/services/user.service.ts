import { Injectable } from '@nestjs/common'

import { UserStatus } from 'src/shared/constants/user.constant'
import { UserIdentifier, UserModel } from 'src/shared/models/user.model'
import { UserBlockedException, UserNotFoundException } from 'src/shared/models/error.model'
import { UserRepository } from 'src/shared/repositories/user.repo'

@Injectable()
export class UserService {
  constructor(private readonly sharedUserRepository: UserRepository) {}

  async validateUserStatus(userIdentifier: UserIdentifier): Promise<UserModel> {
    const user = await this.sharedUserRepository.findUnique(userIdentifier)

    if (!user) {
      throw UserNotFoundException
    }

    if (user.status === UserStatus.BLOCKED) {
      throw UserBlockedException
    }

    return user
  }
}
