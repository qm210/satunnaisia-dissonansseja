import { Point } from "../utils/types";


(window as any).contextMenuStyle = (pos: Point) => `
    position: fixed;
    left: ${pos.x ?? 0}px;
    top: ${pos.y}px;
    background-color: #bebebece;
    border-radius: 8px;
    transform: translateX(-100%);
    width: 300px;
`;

export default () => `
    <div
        class="z-1 absolute top-6 right-6 bg-white px-2 py-1 border border-gray-300 cursor-pointer"
        x-data="{
            showMenu: false,
            menuPos: {x: 0, y: 0},
            toggleMenu: function(event) {
                event.preventDefault();
                this.menuPos = clientPos(event);
                this.$nextTick(() => {
                    this.showMenu = !this.showMenu;
                });
            },
            deleteAllRatings() {
                deleteWithParams('/api/rated', {username: $store.user.name})
                .then((nDeleted) => {
                    alert('Deleted ' + labelledCount(nDeleted, 'rating'));
                    location.reload();
                });
            },
            resetUser() {
                if ($store.ratings.unsaved.length > 0) {
                    alert('Cannot leave yet, because there are unsaved ratings. Submit or Discard them first.');
                    return;
                }
                $router.navigate('/change-user');
            }
        }"
        @click="toggleMenu"
        @contextmenu.window="showMenu = false;"     
        @click.outside="showMenu = false;"       
        title="Right click for more options"
    >
        <span class="select-none">
            Username:
        </span>
        <b x-text="$store.user.name">
        </b>
        <div
            x-show="showMenu"
            class="flex flex-col items-stretch p-1 gap-1"
            :style="contextMenuStyle(menuPos)"
        >
            <button
                class="flex gap-4"
                @click="resetUser()"
            >
                <leave-icon></leave-icon>
                <span>
                    Leave (i.e. change username)
                </span>
            </button>
            <button
                class="flex gap-4"
                @click="deleteAllRatings()"
            >
                <trash-icon></trash-icon>
                <span
                    x-html="'Delete All Ratings For <b>' + $store.user.name + '</b>'"
                >
                </span>
            </button>
            <button
                class="flex gap-4"
                @click="$router.navigate('/instruments')"
            >
                <tools-icon></tools-icon>
                <span>
                    Configure Instruments
                </span>
            </button>
        </div>
    </div>
`;
