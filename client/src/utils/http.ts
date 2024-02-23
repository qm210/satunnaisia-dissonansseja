export const checkOk = async (promise: Promise<Response>) => {
    const response = await promise;
    if (!response.ok) {
        throw Error(response.status + " " + response.statusText);
    }
    return response.json();
};


export class StatusError extends Error {
    public status: number | undefined;

    constructor({ statusText, status }: { statusText?: string, status?: number }) {
        super(statusText);
        this.status = status;
    }
}

const unwrapContent = async <R = unknown>(response: Response): Promise<R> => {
    let result: R | string | undefined;
    if (response.headers.get("Content-Type")?.includes("application/json")) {
        result = await response.json();
    } else {
        result = await response.text();
    }
    return result as R;
};

export const fetchResponse: typeof fetch = async (...args) => {
    const response = await fetch(...args);
    if (!response.ok) {
        throw new StatusError(response);
    }
    return response;
};

export const fetchContent: typeof fetch = async (...args) => {
    const response = await fetchResponse(...args);
    return unwrapContent(response);
};

export const readStream = async (url: string, onMessage: (msg: string) => void, onClose: () => void) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new StatusError(response);
    }
    if (!response.body) {
        throw new Error("Response was empty");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    return new ReadableStream({
        async start(controller) {
            for (; ;) {
                const { done, value } =
                    await reader.read();
                if (done) {
                    onClose();
                    controller.close();
                    break;
                }
                const decodedValue = decoder.decode(value);
                for (const line of decodedValue.split("\n")) {
                    onMessage(line);
                }
                controller.enqueue(decodedValue);
            }
        }
    });
    // somehow like this we could use the End Result, probably - am not sure about this. Maybe won't need.
    // try {
    //     const result = new Response(stream);
    //     return result.text();
    // } catch {
    //     return undefined;
    // }
};
