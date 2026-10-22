
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import {
  User,
  UserDocument,
  UserRole,
} from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  // CUSTOMER / SELLER REGISTRATION
  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const email = data.email.trim().toLowerCase();

    const existingUser = await this.userModel
      .findOne({ email })
      .exec();

    if (existingUser) {
      throw new ConflictException(
        'An account with this email already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      12,
    );

    const role =
      data.role === UserRole.SELLER
        ? UserRole.SELLER
        : UserRole.CUSTOMER;

    const user = await this.userModel.create({
      name: data.name.trim(),
      email,
      password: hashedPassword,
      role,
    });

    return {
      message: 'Registration successful',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // USER LOGIN
  async login(email: string, password: string) {
    const user = await this.userModel
      .findOne({
        email: email.trim().toLowerCase(),
      })
      .select('+password')
      .exec();

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
