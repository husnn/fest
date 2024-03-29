export enum AuthError {
  INVALID_EMAIL = 'INVALID_EMAIL',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  PASSWORD_INVALID = 'PASSWORD_INVALID',
  PASSWORD_INCORRECT = 'PASSWORD_INCORRECT',
  CODE_INCORRECT = 'CODE_INCORRECT',
  CODE_EXPIRED = 'CODE_EXPIRED',
  INVITE_CODE_MISSING = 'INVITE_CODE_MISSING',
  INVITE_NOT_FOUND = 'INVITE_NOT_FOUND',
  INVITE_INVALID = 'INVITE_INVALID'
}

export enum ResetPasswordError {
  INVALID_TOKEN = 'INVALID_TOKEN'
}

export enum EmailAddressChangeError {
  SAME_EMAIL = 'SAME_EMAIL',
  EMAIL_ALREADY_IN_USE = 'EMAIL_ALREADY_IN_USE',
  INCORRECT_PASSWORD = 'INCORRECT_PASSWORD',
  INVALID_TOKEN = 'INVALID_TOKEN',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE'
}
