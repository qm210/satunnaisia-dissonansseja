export default () => `
    <div class="flex flex-col items-center h-full justify-center">
        <h2 class="m-2 text-xl">
            Give some username pls
        </h2>
        <div
            class="flex"
            x-data="{
                name: $store.user.name,
                isPosting: false,
                
                submit: function() {
                    $store.user.name = this.name;
                    this.isPosting = true;
                    postJson('/api/user', {username: this.name})
                        .then(() => {
                            if ($router.path === '/') {
                                location.reload();
                            } else {
                                $router.navigate('/');
                            }
                        })
                        .finally(() => {
                            this.isPosting = false;
                        });
                }
            }"
            x-init="
                $nextTick(() => $refs.nameField.focus());
            "            
        >
            <input
                type="text"
                x-model="name"
                x-ref="nameField"
                @focus="$event.target.select()"
                @keydown.enter="submit()"
                placeholder="totaldumbass210"
                class="border border-black p-2 focus:ring-black"
                autofocus
            />
            <button
                class="border-black rounded-none"
                x-show="!isPosting"
                @click="submit()"
                :disabled="!name"
            >
                <play-icon></play-icon>
            </button>
        </div>
    </div>
`;
