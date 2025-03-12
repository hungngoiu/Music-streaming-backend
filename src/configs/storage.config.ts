type FolderKeys = `${string}Folder`;

interface BucketConfigs {
    name: string;
    [key: FolderKeys]: string;
}

export const audioBucketConfigs: BucketConfigs = {
    name: "audio",
    musicFolder: "musics"
};
