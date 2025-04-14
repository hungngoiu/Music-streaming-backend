interface bucketBaseConfigsInterface {
    name: string;
}

interface musicsBucketConfigsInterface extends bucketBaseConfigsInterface {
    audioFolder: {
        name: string;
    };
    coverFolder: {
        name: string;
    };
}

export const musicsBucketConfigs: musicsBucketConfigsInterface = {
    name: "musics",
    audioFolder: {
        name: "audio"
    },
    coverFolder: {
        name: "covers"
    }
};
