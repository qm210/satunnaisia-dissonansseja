export default () => `
    <div class="flex flex-col w-full h-full justify-center">
        <h2 class="m-2 text-xl">
            Choose wisely.
        </h2>
        <div
            class="flex w-full justify-center gap-10 p-5"
        >
            <div>
                <button
                    class="border-black rounded-none pt-4"
                    @click="$router.navigate('/instruments')"
                >
                    <tools-icon size="64"></tools-icon>
                    <div style="font-size: smaller">
                        Run Instrument Configs
                    </div>
                </button>
            </div>
            <div>
                <button
                    class="border-black rounded-none pt-4"
                    @click="$router.navigate('/wav')"
                >
                    <audiofile-icon size="64"></audiofile-icon>
                    <div style="font-size: smaller">
                        Play / Rate Samples
                    </div>
                </button>
            </div>
        </div>
    </div>
`;
