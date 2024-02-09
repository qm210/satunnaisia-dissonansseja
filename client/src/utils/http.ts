export const checkOk = async (promise: Promise<Response>) => {
    const response = await promise;
    if (!response.ok) {
        throw Error(response.status + " " + response.statusText);
    }
    return response.json();
};
