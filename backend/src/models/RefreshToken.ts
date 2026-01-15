import { Document, Schema, Types, model } from "mongoose";

export interface IRefreshToken extends Document {
  user: Types.ObjectId;
  token: string; // random id (not the JWT)
  expiresAt: Date;
  revoked?: boolean;
  replacedByToken?: string; // for rotation tracking
  userAgent?: string;
  ip?: string;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    revoked: { type: Boolean, default: false },
    replacedByToken: { type: String },
    userAgent: String,
    ip: String,
  },
  { timestamps: true }
);

export default model<IRefreshToken>("RefreshToken", refreshTokenSchema);
