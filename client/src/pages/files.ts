(window as any).labelledCount = (list: any[], singular: string, plural?: string) => {
    if (plural === undefined) {
        plural = singular + "s";
    }
    const unit = Math.abs(list.length) === 1
        ? singular
        : plural;
    return `${list.length} ${unit}`;
};

export default () => `
    <div
        class="flex flex-col w-full h-full"
        x-data="{
            submitting: false,
            
            submit: async function () {
                this.submitting = true;
                postJson('/api/ratings', {
                    ratings: $store.ratings.unsaved,
                    username: $store.user.name,
                })
                    .then((ids) => {
                        $store.ratings.clear();
                        $store.messages.add(
                            labelledCount(ids, 'rating') + ' for ' + $store.user.name + ' stored',
                            3000
                        );
                    })
                    .catch((err) => {
                        console.error(err);
                    })
                    .finally(() => {
                        this.submitting = false;
                    });
            },
            
            discard: function() {
                if (!window.confirm('Discard every rating, all the hard work you put into it? Do you value your life so litte, your opinion so unworthy, your time so abundant? You sure, go ahead?')) {
                    return;
                }
                $store.ratings.clear();
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
                x-text="labelledCount($store.ratings.unsaved, 'Unsaved Rating')"
            >
            </a>
            <div
                x-show="!submitting" 
                class="flex-end"
            >
                <button @click="submit()">
                    <save-icon color="darkgreen"></save-icon>                
                </button>
                <button @click="discard()">
                    <trash-icon></trash-icon>
                </button>
            </div>
        </div>
        <div
            x-data="
                {data: [], isLoading: true}
            "
            x-init="
                fetchJson('/api/unrated/' + $store.user.name)
                .then(res => {data = res; isLoading = false;});
                "
            class="flex-grow h-full flex flex-col overflow-y-hidden"
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
                            class="sticky left-0 p-4 text-left bg-white truncate"
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
