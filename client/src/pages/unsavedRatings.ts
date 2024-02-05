import { WithMenu } from "../components/withMenu.ts";
import Alpine from "alpinejs";
import { Rating } from "../types";
import { ratedProps } from "../enums.ts";


Alpine.data("unsaved_rating_table", () => ({
    getRatingIcon: (rating: Rating) => {
        return ratedProps[rating.rated].htmlColored ?? ratedProps[rating.rated].html;
    }
}));

export default () =>
    WithMenu({
        left: [{
            label: "To Index",
            onClick: "$router.navigate('/')"
        }],
        right: [{
            label: "Back",
            onClick: "history.back()"
        }],
        content: `
            <div
                x-data="unsaved_rating_table()"
                class="text-xl flex flex-col items-center h-full gap-2 p-2 m-auto"
                x-show="$store.ratings.unsaved.length > 0"
            >
                <div class="text-xl">
                    Current Ratings on this Client
                </div>
                <div>
                    <table class="ratings-table border border-black">
                    <tbody>
                        <template x-for="rating in $store.ratings.unsaved" :key="rating.file">
                            <tr>
                                <td>
                                    <a
                                        x-bind:href="'wav/' + rating.file"
                                        x-text="rating.file"
                                        class="underline"
                                    >
                                    </a>
                                </td>
                                <td x-html="getRatingIcon(rating)"></td>
                                <td x-text="rating.comment"></td>
                                <td>
                                    <button @click="$store.ratings.clear(rating.file)">
                                        <trash-icon></trash-icon>
                                    </button>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                    </table>                
                </div>
                <button @click="
                    if (window.confirm('Really really sure to really really clear all?')) {
                        $store.ratings.clear();
                        $router.navigate('/');
                    }
                ">
                    <div class="flex gap-2 text-red-400">
                        <trash-icon></trash-icon>
                        <div>
                            Clear All
                       </div>
                    </div>                
                </button>
            </div>
            <div x-show="$store.ratings.unsaved.length === 0">
                None. Nothing here.            
            </div>
        `
    });