import { OpenAPIV3 } from "openapi-types";
import { userRouteConfig } from "../routes/index.js";
import { convertToOpenApiRoute } from "@/utils/swagger.js";
import { userExample, userProfileExample } from "./schemas/user.js";

export const userRouteDoc: OpenAPIV3.PathsObject = {
    [`${userRouteConfig.index}${userRouteConfig.uploadSong}`]: {
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
                "40x": {
                    description: "Error"
                }
            },
            tags: ["users"]
        }
    },
    [`${userRouteConfig.index}${userRouteConfig.createAlbum}`]: {
        post: {
            summary: "Create an album",
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
                            required: ["name", "coverImage"],
                            properties: {
                                name: {
                                    type: "string"
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
                    description: "Create album successfully",
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
                                            album: {
                                                $ref: "#/components/schemas/album"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "40x": {
                    description: "Error"
                }
            },
            tags: ["users"]
        }
    },
    [`${userRouteConfig.index}${convertToOpenApiRoute(userRouteConfig.addSong)}`]:
        {
            patch: {
                summary: "Add a song to an album at an index",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        in: "path",
                        name: "albumId",
                        description: "Id of the album",
                        schema: {
                            type: "string"
                        },
                        required: true
                    },
                    {
                        in: "path",
                        name: "songId",
                        description: "Id of the song",
                        schema: {
                            type: "string"
                        },
                        required: true
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["index"],
                                properties: {
                                    index: {
                                        type: "number",
                                        description:
                                            "Index to add the song to album, must be nonnegative, if larger than length of album, the song will be add at last postion",
                                        example: 1
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Add song to album successfully"
                    },
                    "40x": {
                        description: "Error"
                    }
                },
                tags: ["users"]
            }
        },
    [`${userRouteConfig.index}${convertToOpenApiRoute(userRouteConfig.addSongs)}`]:
        {
            patch: {
                summary: "Add a list of songs to the end of an album",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        in: "path",
                        name: "albumId",
                        description: "Id of the album",
                        schema: {
                            type: "string"
                        },
                        required: true
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "string",
                                    title: "songIds"
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Add songs to album successfully"
                    },
                    "40x": {
                        description: "Error"
                    }
                },
                tags: ["users"]
            }
        },
    [`${userRouteConfig.index}${convertToOpenApiRoute(userRouteConfig.setSongs)}`]:
        {
            put: {
                summary: "Set songs for an album",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        in: "path",
                        name: "albumId",
                        description: "Id of the album",
                        schema: {
                            type: "string"
                        },
                        required: true
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "string",
                                    title: "songIds"
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Set songs for album successfully"
                    },
                    "40x": {
                        description: "Error"
                    }
                },
                tags: ["users"]
            }
        },
    [`${userRouteConfig.index}${convertToOpenApiRoute(userRouteConfig.publicAlbum)}`]:
        {
            patch: {
                summary: "Public an album",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        in: "path",
                        name: "albumId",
                        description: "Id of the album",
                        schema: {
                            type: "string"
                        },
                        required: true
                    }
                ],
                responses: {
                    "200": {
                        description: "Album is set to public"
                    },
                    "40x": {
                        description: "Error"
                    }
                },
                tags: ["users"]
            }
        },
    [`${userRouteConfig.index}${userRouteConfig.updateAvatar}`]: {
        put: {
            summary: "Update avatar",
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
                            required: ["avatar"],
                            properties: {
                                avatar: {
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
                "200": {
                    description: "Update avatar successfully"
                }
            },
            tags: ["users"]
        }
    },
    [`${userRouteConfig.index}${userRouteConfig.updateProfile}`]: {
        patch: {
            summary: "Update profile",
            security: [
                {
                    bearerAuth: []
                }
            ],
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                name: {
                                    type: "string",
                                    example: "John Doe"
                                },
                                birth: {
                                    type: "string",
                                    format: "date",
                                    example: "1990-05-15"
                                },
                                gender: {
                                    type: "string",
                                    example: "male"
                                },
                                phone: {
                                    type: "string",
                                    example: "+1234567890"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Update profile successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    status: {
                                        type: "string",
                                        example: "success"
                                    },
                                    messgae: {
                                        type: "string",
                                        example: "Update profile successfully"
                                    },
                                    data: {
                                        type: "object",
                                        properties: {
                                            user: {
                                                allOf: [
                                                    {
                                                        $ref: "#/components/schemas/user"
                                                    },
                                                    {
                                                        type: "object",
                                                        properties: {
                                                            userProfile: {
                                                                $ref: "#/components/schemas/userProfile"
                                                            }
                                                        }
                                                    }
                                                ],
                                                example: {
                                                    ...userExample,
                                                    userProfile: {
                                                        ...userProfileExample
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            tags: ["users"]
        }
    }
};
