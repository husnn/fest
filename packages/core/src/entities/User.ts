import { getExpiryDate, randomInteger } from '@fanbase/shared';
import jwt, { Jwt } from 'jsonwebtoken';

import Community from './Community';
import Token from './Token';
import Wallet from './Wallet';
import bcrypt from 'bcryptjs';

type JwtPayload = {
  userId: string;
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
  isCreator: boolean;
  lastLogin: Date;
  communities: Community[];

  constructor(data?: Partial<User>) {
    Object.assign(this, data);

    this.loginCode = User.newLoginCode();
  }

  async hashPassword() {
    this.password = await bcrypt.hash(
      this.password,
      10 || process.env.PASSWORD_SALT_ROUNDS
    );
  }

  static async verifyPassword(provided: string, actual: string) {
    return bcrypt.compare(provided, actual);
  }

  static fromJwt(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
  }

  static generateJwt(user: User): string {
    return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY
    });
  }

  static newLoginCode() {
    return {
      value: randomInteger(6).toString(),
      expiry: getExpiryDate()
    };
  }
}

export default User;
