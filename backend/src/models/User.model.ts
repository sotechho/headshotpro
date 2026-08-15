import { role } from "@/constants";
import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  username?: string;
  email: string;
  password: string;
  isActive: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpires?: Date;
  emailVerified: boolean;
  refreshToken?: string;
  credits: number;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minLength: [8, "Password must be at least 8 characters"],
    },
    username: {
      type: String,
      trim: true,
    },
    credits: {
      type: Number,
      default: 3,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationTokenExpires: {
      type: Date,
      select: false,
    },
    role: {
      type: String,
      default: role.user,
    },

  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>("User", userSchema);

export { type IUser, User };
