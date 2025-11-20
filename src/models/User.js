import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false },
    agreedToTerms: { type: Boolean, default: false },
    oauthSignup: { type: Boolean, default: false },
  },
  { timestamps: true }
);
userSchema.index({ email: 1 });

userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
