export default () => `
    <div class="flex flex-col items-center h-full justify-center">
        <h2 class="m-2 text-xl">
            Give some username pls
        </h2>
        <div
            class="flex"
            x-data="{
                name: $store.user.name,
                
                submit: function() {
                    $store.user.name = this.name;
                    if ($router.currentRoute === '/') {
                        location.reload();
                    } else {
                        $router.navigate('/');
                    }
                    postJson('/api/user', {username: this.name});
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
                @click="submit()"
                :disabled="!name"
            >
                <play-icon></play-icon>                    
            </button>
        </div>
    </div>
`;
