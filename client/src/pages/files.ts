export default () => `
    <div
        class="flex flex-col w-full h-full"
        x-data="{
            submitting: false,
            
            submit: async function () {
                this.submitting = true;
                postJson('/api/ratings', $store.ratings.unsaved)
                    .then(() => {
                        // $store.ratings.clear();
                    })
                    .finally(() => {
                        this.submitting = false;
                    });
            }
        }"
    >
        <div
            x-show="$store.ratings.unsaved.length > 0"
            class="flex-end flex items-center border border-black p-1 m-2 shadow-md"
        >
            <div
                x-show="submitting"
                class="flex-grow justify-self-center p-2"
            >
                <loading-icon spin="2s"></loading-icon>
            </div>
            <a
                href="/unsaved"
                x-show="!submitting"
                class="flex-grow text-lg cursor-pointer"
                x-text="$store.ratings.unsaved.length + ' Unsaved Ratings'"
            >
            </a>
            <div
                x-show="!submitting" 
                class="flex-end"
            >
                <button @click="submit()">
                    <save-icon color="darkgreen"></save-icon>                
                </button>
                <button @click="$store.ratings.clear()">
                    <trash-icon></trash-icon>
                </button>
            </div>
        </div>
        <div
            x-data="
                {data: [], isLoading: true}
            "
            x-init="
                fetchJson('/api/all')
                .then(res => {data = res; isLoading = false;});
                "
            class="flex-grow h-full flex flex-col overflow-y-hidden p-2"
            >
            <h3 x-show="isLoading">
                Loading...
            </h3>
            <div class="flex-grow w-full">
                <table class="w-full flex-grow">
                <tbody>
                    <template x-for="taggedGroup in data">
                    <tr class="align text-lg">
                        <td
                            x-text="taggedGroup.tag || 'UNTAGGED'"
                            class="sticky left-0 p-2 text-left bg-white truncate"
                        />
                        <td
                            class="sticky left-24 bg-white"
                            >
                            <button
                                @click="alert('play-multiple-wav is not implemented yet.')"
                                class="px-1 pt-2 pb-0"
                            >
                                <play-icon></play-icon>
                            </button>
                        </td>
                        <td
                            class="p-2 overflow-x-auto"
                        >
                            <div class="flex space-x-4">
                                <template x-for="file in taggedGroup.files">
                                    <a
                                        x-bind:href="'/' + file.path"
                                        x-text="file.name"
                                        class="underline"
                                    />
                                </template>
                            </div>
                        </td>
                    </tr>
                    </template>
                </tbody>
                </table>
            </div>
        </div>
    </div>
`;
