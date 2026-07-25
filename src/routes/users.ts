import { Elysia, t } from "elysia";
import { db } from "../db";
import { users } from "../db/schema";

export const userRoutes = new Elysia({ prefix: "/users" })
  .get("/", async () => {
    try {
      const allUsers = await db.select().from(users);
      return { success: true, data: allUsers };
    } catch (error: any) {
      return { success: false, message: "Database connection error: " + error.message };
    }
  })
  .post(
    "/",
    async ({ body }) => {
      try {
        const result = await db.insert(users).values(body);
        return { success: true, message: "User created successfully", result };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
      }),
    }
  );
