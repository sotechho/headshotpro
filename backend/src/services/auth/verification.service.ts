import crypto from "crypto";

export class VerificationService {
  private readonly tokenLength: number = 32;
  private readonly tokenExpires: number = 15;

  generateToken(): string {
    return crypto.randomBytes(this.tokenLength).toString("hex");
  }

  generateExpirationDate(): Date {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + this.tokenExpires);
    return expires;
  }

  isTokenExpires(expires: Date): boolean {
    return new Date() > expires;
  }
}

export const verificationService = new VerificationService();
