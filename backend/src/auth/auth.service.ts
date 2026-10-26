import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';

import {
  User,
  UserDocument,
  UserRole,
} from '../users/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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


  // Create a single-use, short-lived password reset token. The raw token is only emailed.
  async requestPasswordReset(emailInput: string) {
    const email = emailInput.trim().toLowerCase();
    const user = await this.userModel.findOne({ email }).exec();

    // Always return the same message to avoid revealing whether an account exists.
    const response = {
      message: 'If an account exists for that email, password reset instructions will be sent.',
    };
    if (!user) return response;

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30);

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { passwordResetTokenHash: tokenHash, passwordResetExpires: expires } },
    ).exec();

    const frontendUrl = (this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const fromEmail = this.configService.get<string>('RESET_EMAIL_FROM');

    // Configure Resend in backend/.env to enable delivery. Never return the token from the API.
    if (apiKey && fromEmail) {
      try {
        const mailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [user.email],
            subject: 'Reset your Craftosa password',
            html: `<div style="font-family:Arial,sans-serif;color:#39271d;max-width:560px;margin:auto;padding:28px"><p style="color:#a65335;letter-spacing:3px;font-size:12px">CRAFTOSA</p><h1 style="font-family:Georgia,serif">Reset your password</h1><p>We received a request to reset your Craftosa password. This link expires in 30 minutes and can only be used once.</p><p style="margin:28px 0"><a href="${resetUrl}" style="background:#9b4e32;color:white;text-decoration:none;padding:14px 22px;border-radius:9px;display:inline-block">Choose a new password</a></p><p>If you did not request this, you can safely ignore this email.</p></div>`,
          }),
        });
        if (!mailResponse.ok) {
          // Do not expose provider details or token to the caller.
          console.error('Password reset email could not be sent. Check Resend configuration.');
        }
      } catch {
        console.error('Password reset email delivery failed. Check network and Resend configuration.');
      }
    } else {
      console.warn('Password reset email is not configured. Set RESEND_API_KEY and RESET_EMAIL_FROM in backend/.env.');
    }

    return response;
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const user = await this.userModel
      .findOne({
        passwordResetTokenHash: tokenHash,
        passwordResetExpires: { $gt: new Date() },
      })
      .select('+passwordResetTokenHash +passwordResetExpires')
      .exec();

    if (!user) {
      throw new UnauthorizedException('This password reset link is invalid or has expired. Please request a new one.');
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return { message: 'Password reset successful. You can now sign in with your new password.' };
  }

  // GET /auth/account - return the current authenticated user's saved profile.
  async getAccount(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException('User account was not found');
    }

    return {
      message: 'Profile retrieved successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone ?? '',
        address: user.address ?? '',
        city: user.city ?? '',
        postalCode: user.postalCode ?? '',
      },
    };
  }

  // PATCH /auth/profile - update only editable fields for the current user.
  async updateAccount(userId: string, data: UpdateProfileDto) {
    const updates: Partial<UpdateProfileDto> = {};

    if (data.name !== undefined) {
      updates.name = data.name.trim();
    }
    if (data.email !== undefined) {
      const email = data.email.trim().toLowerCase();
      const existingUser = await this.userModel
        .findOne({ email, _id: { $ne: userId } })
        .exec();

      if (existingUser) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }
      updates.email = email;
    }
    if (data.phone !== undefined) updates.phone = data.phone.trim();
    if (data.address !== undefined) updates.address = data.address.trim();
    if (data.city !== undefined) updates.city = data.city.trim();
    if (data.postalCode !== undefined) {
      updates.postalCode = data.postalCode.trim();
    }

    const user = await this.userModel
      .findByIdAndUpdate(userId, { $set: updates }, {
        new: true,
        runValidators: true,
      })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User account was not found');
    }

    return {
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone ?? '',
        address: user.address ?? '',
        city: user.city ?? '',
        postalCode: user.postalCode ?? '',
      },
    };
  }
}
