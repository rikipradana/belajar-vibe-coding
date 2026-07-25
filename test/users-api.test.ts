import { describe, it, expect, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { usersRoute } from "../src/routes/users-route";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";

// Setup Test App
const app = new Elysia().use(usersRoute);

// Helper for HTTP requests
const request = (method: string, path: string, body?: any, token?: string) => {
  const headers: Record<string, string> = {};
  if (body) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return app.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  );
};

describe("Users API", () => {
  beforeEach(async () => {
    // Cleanup Database (sessions first due to foreign key constraint)
    await db.delete(sessions);
    await db.delete(users);
  });

  describe("1. POST /api/users/ (Register User)", () => {
    it("should register a new user successfully", async () => {
      const payload = {
        name: "Test User",
        email: "test@localhost",
        password: "password123",
      };

      const res = await request("POST", "/api/users/", payload);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toEqual({ data: "OK" });
    });

    it("should reject duplicate email", async () => {
      const payload = {
        name: "Test User",
        email: "test@localhost",
        password: "password123",
      };

      // Insert first
      await request("POST", "/api/users/", payload);

      // Attempt second time
      const res = await request("POST", "/api/users/", payload);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json).toEqual({ error: "Email sudah terdaftar" });
    });

    it("should reject payload if length exceeds 255 chars", async () => {
      const payload = {
        name: "a".repeat(300),
        email: "test@localhost",
        password: "password123",
      };

      const res = await request("POST", "/api/users/", payload);
      expect(res.status).toBe(422); // Elysia validation error
    });
  });

  describe("2. POST /api/users/login (Login User)", () => {
    const validUser = {
      name: "Test User",
      email: "test@localhost",
      password: "password123",
    };

    beforeEach(async () => {
      await request("POST", "/api/users/", validUser);
    });

    it("should login successfully with correct credentials", async () => {
      const res = await request("POST", "/api/users/login", {
        email: validUser.email,
        password: validUser.password,
      });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toBeTypeOf("string"); // Token
    });

    it("should reject login if email not registered", async () => {
      const res = await request("POST", "/api/users/login", {
        email: "wrong@localhost",
        password: "password123",
      });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json).toEqual({ error: "Email atau password salah" });
    });

    it("should reject login if password is incorrect", async () => {
      const res = await request("POST", "/api/users/login", {
        email: validUser.email,
        password: "wrongpassword",
      });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json).toEqual({ error: "Email atau password salah" });
    });
  });

  describe("3. GET /api/users/current (Get Current User)", () => {
    let token: string;
    const validUser = {
      name: "Test User",
      email: "test@localhost",
      password: "password123",
    };

    beforeEach(async () => {
      await request("POST", "/api/users/", validUser);
      const loginRes = await request("POST", "/api/users/login", {
        email: validUser.email,
        password: validUser.password,
      });
      const json = await loginRes.json();
      token = json.data;
    });

    it("should return current user with a valid token", async () => {
      const res = await request("GET", "/api/users/current", undefined, token);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.name).toBe(validUser.name);
      expect(json.data.email).toBe(validUser.email);
      expect(json.data.id).toBeDefined();
    });

    it("should reject request without authorization header", async () => {
      const res = await request("GET", "/api/users/current");
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json).toEqual({ error: "Unauthorized" });
    });

    it("should reject request with invalid token", async () => {
      const res = await request("GET", "/api/users/current", undefined, "invalid-token");
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json).toEqual({ error: "Unauthorized" });
    });
  });

  describe("4. DELETE /api/users/logout (Logout User)", () => {
    let token: string;
    const validUser = {
      name: "Test User",
      email: "test@localhost",
      password: "password123",
    };

    beforeEach(async () => {
      await request("POST", "/api/users/", validUser);
      const loginRes = await request("POST", "/api/users/login", {
        email: validUser.email,
        password: validUser.password,
      });
      const json = await loginRes.json();
      token = json.data;
    });

    it("should logout successfully using a valid token", async () => {
      const res = await request("DELETE", "/api/users/logout", undefined, token);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toEqual({ data: "OK" });

      // Verification: trying to GET /current with the same token should fail
      const getRes = await request("GET", "/api/users/current", undefined, token);
      expect(getRes.status).toBe(401);
    });

    it("should reject logout with invalid token", async () => {
      const res = await request("DELETE", "/api/users/logout", undefined, "invalid-token");
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json).toEqual({ error: "Unauthorized" });
    });
  });
});
