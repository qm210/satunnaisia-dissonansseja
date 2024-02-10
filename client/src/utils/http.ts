export const checkOk = async (promise: Promise<Response>) => {
    const response = await promise;
    if (!response.ok) {
        throw Error(response.status + " " + response.statusText);
    }
    return response.json();
};


class StatusError extends Error {
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
