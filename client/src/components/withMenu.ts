type MenuPoint = {
    label: string,
    onClick?: string
    hide?: boolean,
};

const renderMenuPoint = (point: MenuPoint) => `
    <div
        class="p-3 border-x border-gray-300 cursor-pointer hover:bg-blue-100"
        @click="${point.onClick ?? "alert('not implemented')"}"
    >
        ${point.label}
    </div>`;

const renderMenuPoints = (list: MenuPoint[] | undefined) =>
    (list ?? [])
        .filter(p => !p.hide)
        .map(renderMenuPoint)
        .join("");

export const WithMenu = ({ left, right, content }: { left?: MenuPoint[], right?: MenuPoint[], content: string }) => `
    <div class="flex flex-col w-full h-full">
        <div class="flex justify-stretch" x-data id="menu">
            ${renderMenuPoints(left)}
            <div class="flex-grow"></div>
            ${renderMenuPoints(right)}
        </div>
        <div class="flex-grow h-full" style="overflow: auto;">
            ${content}
        </div> 
    </div>
`;
