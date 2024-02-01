import { WithMenu } from "../components/withMenu.ts";

export default () => WithMenu({
    left: [{
        label: "Do Stuff"
    }],
    right: [{
        label: "Save"
    }, {
        label: "Discard"
    }],
    content: `
        <div
            x-data="
                {data: [], isLoading: true}
            "
            x-init="
                fetchJson('/api/all')
                .then(res => {data = res; isLoading = false;});
                "
            class="p-2 h-full flex flex-col overflow-y-hidden"
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
                                class="p-2"
                            >
                                <play-icon/>
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
            <div
                x-show="$store.ratings.unsaved.length > 0"
                class="flex-end flex items-center border border-black p-1 m-2"
            >
                <div
                    class="flex-grow text-lg"
                    x-text="$store.ratings.unsaved.length + ' Unsaved Ratings'">
                </div>
                <div class="flex-end">
                    <button @click="$store.ratings.clear()">
                        <trash-icon></trash-icon>
                    </button>
                </div>
            </div>
        </div>        
    `
});
