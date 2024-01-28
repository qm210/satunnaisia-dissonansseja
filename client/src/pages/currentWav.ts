import { Menu } from "../components/menu.ts";

// TODO: how to unify Menu with the one in the files page?
export default () =>
    Menu({
        right: [{
            label: "Back",
            onClick: "history.back()"
        }]
    }) + `
    <div class="text-xl">
        <span x-text="$router.params.file"></span>    
    </div>
`;
