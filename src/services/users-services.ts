import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, type NewUser } from "../db/schema";

export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
}

export type RegisterResult =
  | { success: true; data: "OK" }
  | { success: false; error: string };

export class UsersService {
  async registerUser(payload: RegisterUserDTO): Promise<RegisterResult> {
    // 1. Check if email already exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (existingUsers.length > 0) {
      return { success: false, error: "Email sudah terdaftar" };
    }

    // 2. Hash password using Bun's native bcrypt
    const hashedPassword = await Bun.password.hash(payload.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    // 3. Insert new user into database
    const newUser: NewUser = {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
    };

    await db.insert(users).values(newUser);

    return { success: true, data: "OK" };
  }
}

export const usersService = new UsersService();
