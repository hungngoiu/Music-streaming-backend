import { userProfileSchema } from "./auth.schema.js";

export const updateUserProfileSchema = userProfileSchema.partial();
