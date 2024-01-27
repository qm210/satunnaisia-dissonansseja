export const setupFiles = (element: HTMLDivElement) => {
    element.innerHTML = `
        <div
            x-data="
                {data: [], isLoading: true}
            "
            x-init="
                fetchJson('/api/all')
                .then(res => {data = res; isLoading = false;})
                "
            >
            <h3 x-show="isLoading">
                Loading...
            </h3>
            <table>
                <tbody>
                <template x-for="taggedGroup in data">
                <tr class="align text-lg">
                    <td
                        x-text="taggedGroup.tag || 'UNTAGGED'"
                        class="p-2 text-left"
                    />
                    <td>
                        <button>
                            <play-icon/>
                        </button>
                    </td>
                    <td
                        class="p-2"
                    >
                        <div class="flex space-x-4">
                            <template x-for="file in taggedGroup.files">
                                <a
                                    x-bind:href="file.path"
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
    // element.innerHTML = `found ${data.length} tags: ${JSON.stringify(data)}`;
};
