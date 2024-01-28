type MenuPoint = {
    label: string,
    onClick?: string
};

const renderMenuPoint = (point: MenuPoint) => `
    <div
        class="p-3 border-x border-gray-300 cursor-pointer hover:bg-blue-100"
        @click="${point.onClick ?? "alert('not implemented')"}"
    >
        ${point.label}
    </div>`;

const renderMenuPoints = (list: MenuPoint[] | undefined) =>
    (list ?? []).map(renderMenuPoint).join("");

export const Menu = ({ left, right }: { left?: MenuPoint[], right?: MenuPoint[] }) => `
    <div class="flex justify-stretch" x-data id="menu">
        ${renderMenuPoints(left)}
        <div class="flex-grow"></div>
        ${renderMenuPoints(right)}
    </div>
`;
