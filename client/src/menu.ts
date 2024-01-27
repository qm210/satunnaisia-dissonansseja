const menuPoint = (title: string, onClick: string) => `
    <div
        class="p-3 border-x border-gray-300 cursor-pointer"
        @click="${onClick}"
        >
        ${title}
    </div>`;

export const setupMenu = (element: HTMLDivElement) => {
    element.innerHTML = `
        <div class="flex justify-stretch" x-data>
            ${menuPoint("Do Stuff", "alert('not implemented')")}
            <div class="flex-grow"></div>
            ${menuPoint("Save", "")}
            ${menuPoint("Discard", "")}
        </div>
    `;
};
