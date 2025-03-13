interface bucketBaseConfigsInterface {
    name: string;
    allowedExtension: string[];
}

interface audioBucketConfigsInterface extends bucketBaseConfigsInterface {
    musicFolder: string;
}

export const audioBucketConfigs: audioBucketConfigsInterface = {
    name: "audios",
    allowedExtension: [".mp3"],
    musicFolder: "musics"
};
