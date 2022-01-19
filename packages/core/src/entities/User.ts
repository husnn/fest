import { getExpiryDate, randomInteger } from '@fanbase/shared';

import Community from './Community';
import Token from './Token';
import Wallet from './Wallet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

type JwtPayload = {
  userId: string;
  email?: string;
};

export class User {
  readonly id: string;

  email: string;
  password: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  username: string;
  name: string;
  bio: string;
  walletId: string;
  wallet: Wallet;
  tokensCreated: Token[];
  loginCode: {
    value: string;
    expiry: Date;
  };
  emailChangeToken?: {
    value: string;
    expiry: Date;
  };
  passwordResetToken?: {
    value: string;
    expiry: Date;
  };
  isCreator: boolean;
  lastLogin: Date;
  communities: Community[];

  constructor(data?: Partial<User>) {
    Object.assign(this, data);

    this.loginCode = User.newLoginCode();
  }

  static async hashPassword(password: string) {
    return bcrypt.hash(password, 10 || process.env.PASSWORD_SALT_ROUNDS);
  }

  static async verifyPassword(provided: string, actual: string) {
    return bcrypt.compare(provided, actual);
  }

  static fromJwt(token: string, secret?: string) {
    return jwt.verify(token, secret || process.env.JWT_SECRET) as JwtPayload;
  }

  static fromEmailChangeJwt(token: string) {
    return User.fromJwt(token, process.env.EMAIL_CHANGE_JWT_SECRET);
  }

  static fromResetJwt(token: string) {
    return User.fromJwt(token, process.env.RESET_JWT_SECRET);
  }

  static generateJwt(user: User, secret?: string, expiry?: number): string {
    return jwt.sign({ userId: user.id }, secret || process.env.JWT_SECRET, {
      expiresIn: expiry || process.env.JWT_EXPIRY
    });
  }

  static generateEmailChangeJwt(
    user: User,
    email: string,
    expiryInMins: number
  ): string {
    return jwt.sign(
      { userId: user.id, email },
      process.env.EMAIL_CHANGE_JWT_SECRET || process.env.JWT_SECRET,
      {
        expiresIn: expiryInMins * 60 * 1000 || process.env.JWT_EXPIRY
      }
    );
  }

  static generateResetJwt(user: User, expiryInMins: number): string {
    return User.generateJwt(
      user,
      process.env.PASSWORD_RESET_JWT_SECRET,
      expiryInMins * 60 * 1000
    );
  }

  static newLoginCode() {
    return {
      value: randomInteger(6).toString(),
      expiry: getExpiryDate()
    };
  }
}

export default User;
