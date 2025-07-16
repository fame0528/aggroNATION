import { Schema, model, models, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
      newsletter: boolean;
    };
    privacy: {
      profilePublic: boolean;
      showEmail: boolean;
      showActivity: boolean;
    };
    dashboard: {
      defaultView: 'overview' | 'news' | 'videos' | 'models' | 'repos';
      compactMode: boolean;
      autoRefresh: boolean;
    };
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
  toPublicProfile(): any;
  toSafeUser(): any;
}

export interface IUserModel extends Model<IUser> {
  findByEmailOrUsername(identifier: string): Promise<IUser | null>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        newsletter: {
          type: Boolean,
          default: false,
        },
      },
      privacy: {
        profilePublic: {
          type: Boolean,
          default: true,
        },
        showEmail: {
          type: Boolean,
          default: false,
        },
        showActivity: {
          type: Boolean,
          default: true,
        },
      },
      dashboard: {
        defaultView: {
          type: String,
          enum: ['overview', 'news', 'videos', 'models', 'repos'],
          default: 'overview',
        },
        compactMode: {
          type: Boolean,
          default: false,
        },
        autoRefresh: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// Hash password before saving
userSchema.pre('save', async function (this: IUser, next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to get public profile
userSchema.methods.toPublicProfile = function (this: IUser) {
  return {
    _id: this._id,
    username: this.username,
    email: this.preferences.privacy.showEmail ? this.email : undefined,
    firstName: this.firstName,
    lastName: this.lastName,
    avatar: this.avatar,
    role: this.role,
    isActive: this.isActive,
    emailVerified: this.emailVerified,
    lastLogin: this.preferences.privacy.showActivity ? this.lastLogin : undefined,
    createdAt: this.createdAt,
  };
};

// Method to get safe user data (for JWT)
userSchema.methods.toSafeUser = function (this: IUser) {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    avatar: this.avatar,
    role: this.role,
    isActive: this.isActive,
    emailVerified: this.emailVerified,
    preferences: this.preferences,
  };
};

// Static method to find user by email or username
userSchema.statics.findByEmailOrUsername = function (identifier: string) {
  return this.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
  });
};

export const UserModel = models.User || model<IUser>('User', userSchema);
