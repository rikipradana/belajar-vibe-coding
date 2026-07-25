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
      body: t.Object({
        name: t.String({ maxLength: 255 }),
        email: t.String({ maxLength: 255 }),
        password: t.String(),
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
      body: t.Object({
        email: t.String(),
        password: t.String(),
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
  .get("/current", async ({ token, set }) => {
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
  })
  .delete("/logout", async ({ token, set }) => {
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
  });
