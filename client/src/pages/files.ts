import FilesListMenu from "../components/filesMenu.ts";

export default () => `
    ${FilesListMenu()}
    <div
        x-data="
            {data: [], isLoading: true}
        "
        x-init="
            fetchJson('/api/all')
            .then(res => {data = res; isLoading = false;})
            "
        class="p-4"
        style="flex-grow: 1; overflow: auto;"
        >
        <h3 x-show="isLoading">
            Loading...
        </h3>
        <table class="w-full">
            <tbody>
            <template x-for="taggedGroup in data">
            <tr class="align text-lg">
                <td
                    x-text="taggedGroup.tag || 'UNTAGGED'"
                    class="sticky left-0 p-2 text-left bg-white truncate"
                    id="firstColumn"
                />
                <td
                    class="sticky left-24 bg-white"
                    id="secondColumn"
                    >
                    <button class="p-2">
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
`;
