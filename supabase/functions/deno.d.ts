// deno.d.ts
declare namespace Deno {
    export interface Env {
        get(key: string): string | undefined;
        toObject(): { [key: string]: string };
    }

    export const env: Env;

    export function serve(handler: (request: Request) => Response | Promise<Response>, options?: any): void;
}
