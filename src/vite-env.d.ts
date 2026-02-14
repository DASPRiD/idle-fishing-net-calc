/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_SUB_PATH: string | undefined;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
