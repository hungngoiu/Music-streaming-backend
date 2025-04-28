import { OpenAPIV3 } from "openapi-types";
import { albumRouteConfig } from "../routes/index.js";
import { userExample } from "./schemas/user.js";
import { convertToOpenApiRoute } from "@/utils/swagger.js";
import { albumExample } from "./schemas/album.js";

export const albumRouteDoc: OpenAPIV3.PathsObject = {
    [`${albumRouteConfig.index}${convertToOpenApiRoute(albumRouteConfig.getAlbum)}`]:
        {
            get: {
                summary: "Get an album",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                description:
                    "Fetch data of an public album, optionally login to see private album of that user",
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        description: "Id of the song",
                        schema: {
                            type: "string"
                        },
                        required: true
                    },
                    {
                        in: "query",
                        name: "userProfiles",
                        description: "Optional fetching user profile",
                        schema: {
                            type: "boolean"
                        }
                    },
                    {
                        in: "query",
                        name: "songs",
                        description: "Optional fetching songs",
                        schema: {
                            type: "boolean"
                        }
                    }
                ],
                responses: {
                    "200": {
                        description: "Get album successfully",
                        content: {
                            "application/json": {
                                example: {
                                    status: "success",
                                    message: "string",
                                    data: {
                                        album: {
                                            ...albumExample,
                                            user: userExample
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "404": {
                        description:
                            "Album not found, or not visible to this user"
                    }
                },
                tags: ["albums"]
            }
        },
    [`${albumRouteConfig.index}${albumRouteConfig.getAlbums}`]: {
        get: {
            summary: "Search albums by name and userId",
            description:
                "Search for public album, optionally login to see private albums of that user",
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    in: "query",
                    name: "name",
                    schema: {
                        type: "string"
                    }
                },
                {
                    in: "query",
                    name: "limit",
                    description: "Number of results",
                    schema: {
                        type: "integer"
                    }
                },
                {
                    in: "query",
                    name: "offset",
                    description: "Offset of the results",
                    schema: {
                        type: "integer"
                    }
                },
                {
                    in: "query",
                    name: "userProfiles",
                    description: "Optional fetching user profile",
                    schema: {
                        type: "boolean"
                    }
                },
                {
                    in: "query",
                    name: "songs",
                    description: "Optional fetching songs",
                    schema: {
                        type: "boolean"
                    }
                }
            ],
            responses: {
                "200": {
                    description: "Get albums successfully",
                    content: {
                        "application/json": {
                            example: {
                                status: "success",
                                message: "string",
                                data: [
                                    {
                                        ...albumExample,
                                        user: userExample
                                    }
                                ],
                                count: 1
                            }
                        }
                    }
                }
            },
            tags: ["albums"]
        }
    }
};
