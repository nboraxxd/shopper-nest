import { Injectable } from '@nestjs/common'

import { UserService } from 'src/shared/services/user.service'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'
import { UserStatus } from 'src/shared/constants/user.constant'
import { isNotFoundPrismaError } from 'src/shared/utils/errors'
import { UserRepository } from 'src/shared/repositories/user.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { UserNotFoundException } from 'src/shared/models/error.model'
import { GetUserProfileDataRes, GetUserProfileQuery, UpdateUserProfileDataRes } from 'src/shared/models/user.model'

import { PasswordIncorrectException } from 'src/routes/profile/profile.error'
import { ChangePasswordBody, UpdateProfileBody } from 'src/routes/profile/profile.model'

@Injectable()
export class ProfileService {
  constructor(
    private readonly userService: UserService,
    private readonly hashingService: HashingService,
    private readonly userRepository: UserRepository
  ) {}

  async getProfile(
    userId: AccessTokenPayload['userId'],
    include: GetUserProfileQuery['include']
  ): Promise<GetUserProfileDataRes> {
    const includeOptions = {
      role: include?.includes('role') ?? false,
      permissions: include?.includes('permissions') ?? false,
    }

    const user = await this.userRepository.findUniqueIncludeRolePermissions(
      { id: userId, deletedAt: null },
      includeOptions
    )

    if (!user) {
      throw UserNotFoundException
    }

    const { totpSecret, ...rest } = user

    return {
      ...rest,
      twoFactorEnabled: !!totpSecret,
    }
  }

  async updateProfile(
    userId: AccessTokenPayload['userId'],
    data: UpdateProfileBody
  ): Promise<UpdateUserProfileDataRes> {
    const { name, phoneNumber, avatar } = data

    try {
      const user = await this.userRepository.update(
        { id: userId, deletedAt: null, status: UserStatus.ACTIVE },
        { name, phoneNumber, avatar, updatedById: userId }
      )

      const { totpSecret, ...rest } = user

      return {
        ...rest,
        twoFactorEnabled: !!totpSecret,
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        await this.userService.getValidatedUser({ id: userId, deletedAt: null })
      }
      throw error
    }
  }

  async changePassword(userId: AccessTokenPayload['userId'], data: ChangePasswordBody): Promise<void> {
    const { password, newPassword } = data

    const user = await this.userService.getValidatedUser(
      { id: userId, deletedAt: null },
      { select: { password: true } }
    )

    // Check if the password is correct
    const isPasswordCorrect = await this.hashingService.compare(password, user.password)

    if (!isPasswordCorrect) {
      throw PasswordIncorrectException
    }

    // Hash the new password
    const hashedPassword = await this.hashingService.hash(newPassword)

    // Update the password in the database
    await this.userRepository.update(
      { id: userId, deletedAt: null, status: UserStatus.ACTIVE },
      { password: hashedPassword, updatedById: userId }
    )
  }
}
