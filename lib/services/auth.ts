import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '@/lib/db/models/user';
import { connectDB } from '@/lib/db/connection';

export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: any;
  token?: string;
  message?: string;
}

export class AuthService {
  private static readonly JWT_SECRET =
    process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private static readonly JWT_EXPIRES_IN = '7d';

  static generateToken(user: IUser): string {
    return jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN },
    );
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      await connectDB();

      const user = await UserModel.findOne({
        $or: [
          { email: credentials.identifier.toLowerCase() },
          { username: credentials.identifier },
        ],
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is deactivated',
        };
      }

      const isPasswordValid = await user.comparePassword(credentials.password);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid credentials',
        };
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = this.generateToken(user);

      return {
        success: true,
        user: user.toSafeUser(),
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed',
      };
    }
  }

  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      await connectDB();

      // Check if user already exists
      const existingUser = await UserModel.findOne({
        $or: [{ email: userData.email.toLowerCase() }, { username: userData.username }],
      });

      if (existingUser) {
        return {
          success: false,
          message:
            existingUser.email === userData.email.toLowerCase()
              ? 'Email already registered'
              : 'Username already taken',
        };
      }

      // Create new user
      const user = new UserModel({
        username: userData.username,
        email: userData.email.toLowerCase(),
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });

      await user.save();

      const token = this.generateToken(user);

      return {
        success: true,
        user: user.toSafeUser(),
        token,
      };
    } catch (error: any) {
      console.error('Registration error:', error);

      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return {
          success: false,
          message: `${field} already exists`,
        };
      }

      return {
        success: false,
        message: 'Registration failed',
      };
    }
  }

  static async getCurrentUser(token: string): Promise<AuthResponse> {
    try {
      const decoded = this.verifyToken(token);

      await connectDB();

      const user = await UserModel.findById(decoded.userId);

      if (!user || !user.isActive) {
        return {
          success: false,
          message: 'User not found or inactive',
        };
      }

      return {
        success: true,
        user: user.toSafeUser(),
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        message: 'Authentication failed',
      };
    }
  }

  static async updateProfile(userId: string, updateData: Partial<IUser>): Promise<AuthResponse> {
    try {
      await connectDB();

      const user = await UserModel.findById(userId);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Update allowed fields
      const allowedFields = ['firstName', 'lastName', 'preferences'];
      const updates: any = {};

      allowedFields.forEach((field) => {
        if (updateData[field as keyof IUser] !== undefined) {
          updates[field] = updateData[field as keyof IUser];
        }
      });

      Object.assign(user, updates);
      await user.save();

      return {
        success: true,
        user: user.toSafeUser(),
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: 'Profile update failed',
      };
    }
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<AuthResponse> {
    try {
      await connectDB();

      const user = await UserModel.findById(userId);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const isCurrentPasswordValid = await user.comparePassword(currentPassword);

      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Current password is incorrect',
        };
      }

      user.password = newPassword;
      await user.save();

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Password change failed',
      };
    }
  }

  static async getUserById(userId: string): Promise<IUser | null> {
    try {
      await connectDB();
      return await UserModel.findById(userId);
    } catch (error) {
      console.error('Get user by ID error:', error);
      return null;
    }
  }

  static async getAllUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ users: IUser[]; total: number }> {
    try {
      await connectDB();

      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        UserModel.find({}, { password: 0 }).sort({ createdAt: -1 }).skip(skip).limit(limit),
        UserModel.countDocuments(),
      ]);

      return { users, total };
    } catch (error) {
      console.error('Get all users error:', error);
      return { users: [], total: 0 };
    }
  }

  static async deactivateUser(userId: string): Promise<AuthResponse> {
    try {
      await connectDB();

      const user = await UserModel.findById(userId);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      user.isActive = false;
      await user.save();

      return {
        success: true,
        message: 'User deactivated successfully',
      };
    } catch (error) {
      console.error('Deactivate user error:', error);
      return {
        success: false,
        message: 'User deactivation failed',
      };
    }
  }

  static async activateUser(userId: string): Promise<AuthResponse> {
    try {
      await connectDB();

      const user = await UserModel.findById(userId);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      user.isActive = true;
      await user.save();

      return {
        success: true,
        message: 'User activated successfully',
      };
    } catch (error) {
      console.error('Activate user error:', error);
      return {
        success: false,
        message: 'User activation failed',
      };
    }
  }
}
