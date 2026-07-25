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
        name: t.String(),
        email: t.String(),
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
  );
