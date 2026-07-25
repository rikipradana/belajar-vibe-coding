import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions, type NewUser, type NewSession } from "../db/schema";

export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
}

export type RegisterResult =
  | { success: true; data: "OK" }
  | { success: false; error: string };

export interface LoginUserDTO {
  email: string;
  password: string;
}

export type LoginResult =
  | { success: true; data: string }
  | { success: false; error: string };

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

export type GetCurrentUserResult =
  | { success: true; data: UserResponse }
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

  async loginUser(payload: LoginUserDTO): Promise<LoginResult> {
    // 1. Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (!user) {
      return { success: false, error: "Email atau password salah" };
    }

    // 2. Verify password with Bun.password.verify
    const isPasswordValid = await Bun.password.verify(payload.password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: "Email atau password salah" };
    }

    // 3. Generate session token (UUID)
    const token = crypto.randomUUID();

    // 4. Save session into database
    const newSession: NewSession = {
      token,
      userId: user.id,
    };

    await db.insert(sessions).values(newSession);

    return { success: true, data: token };
  }

  async getCurrentUser(token: string): Promise<GetCurrentUserResult> {
    // 1. Find session by token
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Find user by userId
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }
}

export const usersService = new UsersService();
