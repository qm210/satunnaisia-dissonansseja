import { MenuPoint } from "../components/filesMenu.ts";

// TODO: how to unify Menu with the one in the files page?
export default () => `
    <div class="flex justify-stretch" x-data id="menu">
        <div class="grow"></div>
        ${MenuPoint("Back", "history.back();")}
    </div>
    <div class="text-xl">
        <span x-text="$router.params.file"></span>    
    </div>
`;
