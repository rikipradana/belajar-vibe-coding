import { Elysia, t } from "elysia";
import { usersService } from "../services/users-services";

export const usersRoute = new Elysia({ prefix: "/api/users" })
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const result = await usersService.registerUser(body);

        if (!result.success) {
          set.status = 400;
          return { error: result.error };
        }

        set.status = 200;
        return { data: result.data };
      } catch (err: any) {
        set.status = 500;
        return { error: err.message || "Internal server error" };
      }
    },
    {
      detail: {
        tags: ["Users"],
        summary: "Register User Baru",
        responses: {
          200: {
            description: "Registrasi berhasil",
            content: {
              "application/json": {
                example: {
                  data: {
                    id: 1,
                    name: "Budi Santoso",
                    email: "budi@example.com",
                    createdAt: "2026-07-26T00:00:00.000Z",
                  },
                },
              },
            },
          },
          400: {
            description: "Validasi gagal / Email sudah terdaftar",
            content: {
              "application/json": {
                example: {
                  error: "Email already registered",
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
      body: t.Object({
        name: t.String({ maxLength: 255, default: "Budi Santoso" }),
        email: t.String({ maxLength: 255, default: "budi@example.com" }),
        password: t.String({ default: "secret123" }),
      }),
    }
  )
  .post(
    "/login",
    async ({ body, set }) => {
      try {
        const result = await usersService.loginUser(body);

        if (!result.success) {
          set.status = 400;
          return { error: result.error };
        }

        set.status = 200;
        return { data: result.data };
      } catch (err: any) {
        set.status = 500;
        return { error: err.message || "Internal server error" };
      }
    },
    {
      detail: {
        tags: ["Users"],
        summary: "Login User",
        responses: {
          200: {
            description: "Login berhasil",
            content: {
              "application/json": {
                example: {
                  data: {
                    token: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                  },
                },
              },
            },
          },
          400: {
            description: "Email atau password salah",
            content: {
              "application/json": {
                example: {
                  error: "Invalid email or password",
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
      body: t.Object({
        email: t.String({ default: "budi@example.com" }),
        password: t.String({ default: "secret123" }),
      }),
    }
  )
  .derive(({ headers }) => {
    const authHeader = headers["authorization"];
    let token: string | null = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const extractedToken = authHeader.substring(7).trim();
      if (extractedToken) {
        token = extractedToken;
      }
    }
    return { token };
  })
  .get(
    "/current",
    async ({ token, set }) => {
      try {
        if (!token) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        const result = await usersService.getCurrentUser(token);

        if (!result.success) {
          set.status = 401;
          return { error: result.error };
        }

        set.status = 200;
        return {
          data: {
            id: result.data.id,
            name: result.data.name,
            email: result.data.email,
            created_at: result.data.createdAt,
          },
        };
      } catch (err: any) {
        set.status = 500;
        return { error: err.message || "Internal server error" };
      }
    },
    {
      detail: {
        tags: ["Users"],
        summary: "Get Current User",
        responses: {
          200: {
            description: "Profil user berhasil diambil",
            content: {
              "application/json": {
                example: {
                  data: {
                    id: 1,
                    name: "Budi Santoso",
                    email: "budi@example.com",
                    created_at: "2026-07-26T00:00:00.000Z",
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized / Token tidak valid",
            content: {
              "application/json": {
                example: {
                  error: "Unauthorized",
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
    }
  )
  .delete(
    "/logout",
    async ({ token, set }) => {
      try {
        if (!token) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        const result = await usersService.logoutUser(token);

        if (!result.success) {
          set.status = 401;
          return { error: result.error };
        }

        set.status = 200;
        return { data: result.data };
      } catch (err: any) {
        set.status = 500;
        return { error: err.message || "Internal server error" };
      }
    },
    {
      detail: {
        tags: ["Users"],
        summary: "Logout User",
        responses: {
          200: {
            description: "Logout berhasil",
            content: {
              "application/json": {
                example: {
                  data: {
                    message: "Logout successful",
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized / Token tidak valid",
            content: {
              "application/json": {
                example: {
                  error: "Unauthorized",
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                example: {
                  error: "Internal server error",
                },
              },
            },
          },
        },
      },
    }
  );
