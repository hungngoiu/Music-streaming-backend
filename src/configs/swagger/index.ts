import { SwaggerUiOptions } from "swagger-ui-express";
import { OpenAPIV3 } from "openapi-types";
import { apiConfig } from "../routes/index.js";
import { envConfig } from "../env.config.js";
import { userProfileSchema, userSchema } from "./schemas/users.js";
import { authRouteDoc } from "./swagger.auth.js";

export const swaggerOptions: SwaggerUiOptions = {
    swaggerOptions: {
        defaultModelsExpandDepth: -1
    }
};

const document: OpenAPIV3.Document = {
    openapi: "3.0.0",
    info: {
        title: "Music Streaming API",
        description: "A complete APIs for a music streaming platform",
        version: "0.0.0"
    },
    servers: [
        {
            url: `http://localhost:${envConfig.PORT}${apiConfig.api}`
        }
    ],
    paths: {
        ...authRouteDoc
    },
    components: {
        schemas: {
            user: userSchema,
            userProfile: userProfileSchema
        },
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            },
            refreshTokenCookieAuth: {
                type: "apiKey",
                in: "cookie",
                name: "refreshToken"
            }
        }
    }
};

export default document;
