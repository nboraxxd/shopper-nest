export class SuccessResDTO<T> {
  data: T
  message: string

  constructor(partial: SuccessResDTO<T>) {
    Object.assign(this, partial)
  }
}

export class MessageResDTO {
  message: string

  constructor(partial: Partial<MessageResDTO>) {
    Object.assign(this, partial)
  }
}
