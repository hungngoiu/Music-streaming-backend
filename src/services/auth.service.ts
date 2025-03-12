import { User } from "@prisma/client";
import { userRepo } from "@/repositories/index.js";
import { Prisma } from "@prisma/client";
import { AuthenticationError } from "@/errors/index.js";
import { StatusCodes } from "http-status-codes";
import { omitPropsFromObject, pickPropsFromObject } from "@/utils/object.js";
import { compareHash, generateHash } from "@/utils/bcrypt.js";
import { SignInDto, SignUpDto } from "@/types/dto/index.js";
import { generateJwt } from "@/utils/jwt.js";
import { UserPayload } from "@/types/jwt.js";
import { randomInt } from "crypto";
import { sendMail } from "@/utils/mailer.js";
import { redisService } from "./redis.service.js";
import { timeToMs } from "@/utils/time.js";
import { envConfig } from "@/configs/env.config.js";
import { namespaces } from "@/configs/redis.config.js";
interface authServiceInterface {
    signUp: (
        data: SignUpDto
    ) => Promise<{ user: User; accessToken: string; refreshToken: string }>;
    signIn: (
        data: SignInDto
    ) => Promise<{ user: User; accessToken: string; refreshToken: string }>;
    refreshToken: (
        data: UserPayload,
        receivedRefreshToken: string
    ) => Promise<{ accessToken: string; refreshToken: string }>;
    sendVerification: (data: UserPayload) => Promise<void>;
    verifyCode: (userId: string, code: string) => Promise<void>;
}

export const authService: authServiceInterface = {
    signUp: async (data: SignUpDto) => {
        const { username, email, password, userProfile } = data;
        const filter: Prisma.UserWhereInput = {
            OR: [
                {
                    username: username
                },
                {
                    email: email
                }
            ]
        };
        const existedUser: User | null = await userRepo.getOneByFilter(filter);
        if (existedUser) {
            throw new AuthenticationError(
                "User is existed",
                StatusCodes.CONFLICT
            );
        }
        const user = await userRepo.create(
            {
                ...pickPropsFromObject(data, ["username", "email"]),
                password: await generateHash(password),
                userProfile: {
                    create: {
                        ...userProfile
                    }
                }
            },
            {
                include: {
                    userProfile: true
                }
            }
        );

        const verificationCode = randomInt(1000000).toString().padStart(6, "0");

        const mailOptions = {
            receiverEmail: user.email,
            subject: "Verification code",
            template: "verification",
            context: {
                name: user.username,
                verificationCode: verificationCode
            }
        };
        await redisService.set(
            {
                namespace: namespaces.Verification,
                key: user.id,
                value: await generateHash(verificationCode)
            },
            { EX: 900 }
        );
        await sendMail(mailOptions);

        const payload: UserPayload = pickPropsFromObject(user, [
            "id",
            "email",
            "username",
            "createdAt",
            "updatedAt",
            "isVerified"
        ]);
        const accessToken = generateJwt({ user: payload }, "at");
        const refreshToken = generateJwt({ user: payload }, "rt");
        await redisService.set(
            {
                namespace: namespaces.JWT_Refresh_Token,
                key: refreshToken,
                value: "authorized"
            },
            { EX: timeToMs(envConfig.JWT_REFRESH_EXP) / 1000 }
        );
        return { user, accessToken, refreshToken };
    },
    signIn: async (data: SignInDto) => {
        const { username, password } = data;
        const user = await userRepo.getOneByFilter({
            username: username
        });
        if (!user) {
            throw new AuthenticationError(
                "User not found",
                StatusCodes.NOT_FOUND
            );
        }
        if (!(await compareHash(password, user.password))) {
            throw new AuthenticationError(
                "Wrong password",
                StatusCodes.UNAUTHORIZED
            );
        }
        const accessToken = generateJwt(
            { user: omitPropsFromObject(user, "password") },
            "at"
        );
        const refreshToken = generateJwt(
            { user: omitPropsFromObject(user, "password") },
            "rt"
        );
        await redisService.set(
            {
                namespace: namespaces.JWT_Refresh_Token,
                key: refreshToken,
                value: "authorized"
            },
            { EX: timeToMs(envConfig.JWT_REFRESH_EXP) / 1000 }
        );
        return { user, accessToken, refreshToken };
    },
    refreshToken: async (data: UserPayload, receivedRefreshToken: string) => {
        const { id } = data;
        const user = await userRepo.getOneByFilter({
            id: id
        });
        if (!user) {
            throw new AuthenticationError(
                "User not found",
                StatusCodes.NOT_FOUND
            );
        }
        const accessToken = generateJwt(
            { user: omitPropsFromObject(user, "password") },
            "at"
        );
        const refreshToken = generateJwt(
            { user: omitPropsFromObject(user, "password") },
            "rt"
        );
        await redisService.set(
            {
                namespace: namespaces.JWT_Refresh_Token,
                key: refreshToken,
                value: "authorized"
            },
            { EX: timeToMs(envConfig.JWT_REFRESH_EXP) / 1000 }
        );
        await redisService.delete({
            namespace: namespaces.JWT_Refresh_Token,
            key: receivedRefreshToken
        });
        return { accessToken, refreshToken };
    },
    sendVerification: async (data: UserPayload) => {
        const { email, username, id, isVerified } = data;
        if (isVerified) {
            throw new AuthenticationError(
                "User is already verified",
                StatusCodes.BAD_REQUEST
            );
        }
        const verificationCode = randomInt(1000000).toString().padStart(6, "0");
        const mailOptions = {
            receiverEmail: email,
            subject: "Verification code",
            template: "verification",
            context: {
                name: username,
                verificationCode: verificationCode
            }
        };
        await redisService.set(
            {
                namespace: namespaces.Verification,
                key: id,
                value: await generateHash(verificationCode)
            },
            { EX: 900 }
        );
        await sendMail(mailOptions);
    },
    verifyCode: async (userId: string, code: string) => {
        const user = await userRepo.getOneByFilter({ id: userId });
        if (!user) {
            throw new AuthenticationError(
                "User not found",
                StatusCodes.NOT_FOUND
            );
        }
        if (user.isVerified) {
            throw new AuthenticationError(
                "User is already verified",
                StatusCodes.BAD_REQUEST
            );
        }
        const storeHashedCode = await redisService.get({
            namespace: namespaces.Verification,
            key: userId
        });
        if (!storeHashedCode) {
            throw new AuthenticationError(
                "Verification code is not found or has expired",
                StatusCodes.BAD_REQUEST
            );
        }
        if (!(await compareHash(code, storeHashedCode))) {
            throw new AuthenticationError(
                "Wrong verification code",
                StatusCodes.BAD_REQUEST
            );
        }
        await userRepo.update({ id: user.id }, { isVerified: true });
    }
};
