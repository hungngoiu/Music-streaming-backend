import { OpenAPIV3 } from "openapi-types";
import { userRouteConfig } from "../routes/index.js";

export const userRouteDoc: OpenAPIV3.PathsObject = {
    [`${userRouteConfig.index}${userRouteConfig.upload}`]: {
        post: {
            summary: "Upload music",
            security: [
                {
                    bearerAuth: []
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            required: ["name", "audioFile", "coverImage"],
                            properties: {
                                name: {
                                    type: "string"
                                },
                                lyric: {
                                    type: "string"
                                },
                                audioFile: {
                                    description: "Accept .mp3, .wav",
                                    type: "string",
                                    format: "base64"
                                },
                                coverImage: {
                                    description:
                                        "Accept .jpg, .jpeg, .png images",
                                    type: "string",
                                    format: "base64"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                "201": {
                    description: "Upload song successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    status: {
                                        type: "string",
                                        example: "success"
                                    },
                                    message: { type: "string" },
                                    data: {
                                        type: "object",
                                        properties: {
                                            song: {
                                                $ref: "#/components/schemas/song"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "40X": {
                    description: "Error"
                }
            },
            tags: ["users"]
        }
    }
};
