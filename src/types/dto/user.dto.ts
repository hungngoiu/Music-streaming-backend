import { UserProfile } from "@prisma/client";

export type UpdateProfileDto = Partial<
    Pick<UserProfile, "name" | "phone" | "birth" | "gender">
>;
