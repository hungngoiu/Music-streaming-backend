import { User } from "@prisma/client";

export type UserPayload = Omit<User, "password">;
