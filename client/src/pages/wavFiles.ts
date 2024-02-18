import { Component, Rating, TaggedFileGroup, WithInit } from "../types";
import Alpine from "alpinejs";
import { getUserName, ratingsStore } from "../initStores.ts";

const labelledCount = (count: any[] | string | number, singular: string, plural?: string) => {
    plural ??= singular + "s";
    const length = count instanceof Array
        ? count.length
        : +count;
    const unit = Math.abs(length) === 1
        ? singular
        : plural;
    return `${length} ${unit}`;
};

// to use it from alpine inline-javascript
(window as any).labelledCount = labelledCount;

const countFiles = (groups: TaggedFileGroup[]) =>
    groups.reduce(
        (sum: number, item: TaggedFileGroup) => sum + item.files.length, 0
    );

const takeUnrated = (groups: TaggedFileGroup[], unsavedButRated: Rating[]) => {
    const unsavedButRatedFiles = unsavedButRated.map(r => r.file);
    return groups.map(group => ({
        ...group,
        files: group.files.filter(file =>
            !unsavedButRatedFiles.includes(file.path)
        )
    })).filter(group => group.files.length > 0);
};

type WavFilesData = {
    allGroups: TaggedFileGroup[],
    unratedGroups: TaggedFileGroup[],
    isSubmitting: boolean,
    isLoading: boolean,
    load: () => void,
    submit: () => void,
    discard: () => void,
    startQueue: (group: TaggedFileGroup) => void,
};

const updateUnrated = (data: Component<WavFilesData>) =>
    () => {
        data.unratedGroups = takeUnrated(
            data.allGroups,
            data.$store!.ratings.unsaved
        );
    };

Alpine.data("wavFiles", (): WithInit<WavFilesData> => ({
    allGroups: [],
    unratedGroups: [],
    isSubmitting: false,
    isLoading: true,

    init(this: Component<WavFilesData>) {
        this.$store.ratings.playQueue = [];
        this.load();
        this.$watch("allGroups", updateUnrated(this));
        this.$watch("$store.ratings.unsaved", updateUnrated(this));
    },

    load: function(this: Component<WavFilesData>) {
        this.isLoading = true;
        window.fetchJson("/api/unrated/" + getUserName())
            .then(res => {
                this.allGroups = res;
                const nFiles = countFiles(res);
                if (nFiles !== this.$store.user.fetchedWavsLastTime) {
                    this.$store.messages.add(
                        labelledCount(nFiles, "file") + " unrated files found",
                        5000
                    );
                    this.$store.user.fetchedWavsLastTime = nFiles;
                }
            })
            .finally(() => {
                this.isLoading = false;
            });
    },

    submit: function(this: Component<WavFilesData>) {
        this.isSubmitting = true;
        window.postJson<any, number[]>("/api/ratings", {
            ratings: this.$store.ratings.unsaved,
            username: getUserName()
        })
            .then((ids) => {
                this.$store.ratings.clear();
                this.$store.messages.add(
                    labelledCount(ids!, "rating") + " for "
                    + this.$store.user.name + " stored",
                    3000
                );
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                this.isSubmitting = false;
            });
    },

    discard: function(this: Component<WavFilesData>) {
        if (!window.confirm("Discard every rating, all the hard work you put into it? Do you value your life so litte, your opinion so unworthy, your time so abundant? You sure, go ahead?")) {
            return;
        }
        this.$store.ratings.clear();
    },

    startQueue: function(this: Component<WavFilesData>, group: TaggedFileGroup) {
        const first = group.files[0];
        if (!first) {
            alert("Empty Group! Can't do shit!");
            return;
        }
        ratingsStore().playQueue = group.files;
        this.$router.navigate("/wav/" + first.path);
    }
}));

export default () => `
    <div
        class="flex flex-col w-full h-full"
        x-data="wavFiles"
    >
        <div
            x-show="$store.ratings.unsaved.length > 0"
            class="flex-end flex items-center border border-black p-1 m-2 shadow-md"
        >
            <div
                x-show="isSubmitting"
                class="flex-grow justify-self-center p-2"
            >
                <loading-icon spin="2s"></loading-icon>
            </div>
            <a
                href="/unsaved"
                x-show="!isSubmitting"
                class="flex-grow text-lg cursor-pointer"
                x-text="labelledCount($store.ratings.unsaved, 'Unsaved Rating')"
            >
            </a>
            <div
                x-show="!isSubmitting" 
                class="flex-end"
            >
                <button @click="submit()">
                    <save-icon color="darkgreen"></save-icon>                
                </button>
                <button @click="discard()">
                    <trash-icon></trash-icon>
                </button>
            </div>
        </div>
        <div class="flex-grow h-full flex flex-col overflow-y-hidden">
            <h3 x-show="isLoading">
                Loading...
            </h3>
            <div class="flex-grow w-full">
                <table class="w-full flex-grow">
                <tbody>
                    <template x-for="taggedGroup in unratedGroups">
                    <tr class="align text-lg">
                        <td
                            x-text="taggedGroup.tag || 'UNTAGGED'"
                            class="sticky left-0 p-4 text-left bg-white truncate"
                        />
                        <td
                            class="sticky left-24 bg-white"
                            >
                            <button
                                small
                                @click="startQueue(taggedGroup)"
                                title="Play as queue"
                            >
                                <play-icon></play-icon>
                            </button>
                        </td>
                        <td
                            class="p-2 overflow-x-auto"
                        >
                            <div class="flex space-x-4">
                                <template x-for="file in taggedGroup.files">
                                    <a
                                        x-bind:href="'/wav/' + file.path"
                                        x-text="file.name"
                                        class="underline"
                                    />
                                </template>
                            </div>
                        </td>
                    </tr>
                    </template>
                </tbody>
                </table>
            </div>
        </div>
    </div>
`;
