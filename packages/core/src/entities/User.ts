import jwt from 'jsonwebtoken';

import { getExpiryDate, randomInteger } from '@fanbase/shared';

import Token from './Token';
import Wallet from './Wallet';

export class User {
  readonly id: string;

  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  username: string;
  name: string;
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
      value: randomInteger().toString(),
      expiry: getExpiryDate()
    };
  }
}

export default User;
