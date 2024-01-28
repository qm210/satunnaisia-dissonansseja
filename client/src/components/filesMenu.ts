export const MenuPoint = (title: string, onClick: string) => `
    <div
        class="p-3 border-x border-gray-300 cursor-pointer"
        @click="${onClick}"
        >
        ${title}
    </div>`;

const FilesListMenu = () => `
    <div class="flex justify-stretch" x-data id="menu">
        ${MenuPoint("Do Stuff", "alert('not implemented')")}
        <div class="flex-grow"></div>
        ${MenuPoint("Save", "")}
        ${MenuPoint("Discard", "")}
    </div>
`;

export default FilesListMenu;
