import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { getExpiryDate, randomInteger } from '@fanbase/shared';

import Token from './Token';
import Wallet from './Wallet';

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
    return jwt.verify(token, process.env.JWT_SECRET, (err: any, data: any) => {
      if (!err) return data.user;
    });
  }

  static generateJwt(user: User): string {
    return jwt.sign({ user: user.id }, process.env.JWT_SECRET, {
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
