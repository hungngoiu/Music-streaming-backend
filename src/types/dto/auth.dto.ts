import { Gender } from "@prisma/client";

export type SignUpDto = {
    username: string;
    email: string;
    password: string;
    userProfile: {
        firstName: string;
        lastName: string;
        middleName?: string;
        gender: Gender;
        birth: Date;
        phone: string;
    };
}

export type SignInDto = {
    username: string;
    password: string;
};