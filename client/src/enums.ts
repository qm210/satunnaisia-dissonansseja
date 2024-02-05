export enum Rated {
    NotYet = "",
    Awesomful = "+",
    NeedsLove = "0",
    EqualsBubu = "-",
}

type RatedProp = {
    title: string,
    html: string,
    htmlColored?: string,
    extraClass: string
};

export const ratedProps: Record<Rated, RatedProp> = {
    [Rated.NotYet]: {
        title: "(unrated)",
        html: "<span>?</span>",
        extraClass: ""
    },
    [Rated.Awesomful]: {
        title: "Awesomful",
        html: "<heart-icon></heart-icon>",
        htmlColored: "<heart-icon color=\"green\"></heart-icon>",
        extraClass: "hover:bg-green-200"
    },
    [Rated.NeedsLove]: {
        title: "Needs Love",
        html: "<lame-icon></lame-icon>",
        htmlColored: "<lame-icon color=\"grey\"></lame-icon>",
        extraClass: "hover:bg-orange-200"
    },
    [Rated.EqualsBubu]: {
        title: "Equals Bubu",
        html: "<poop-icon></poop-icon>",
        htmlColored: "<poop-icon color=\"brown\"></poop-icon>",
        extraClass: "hover:bg-red-200"
    }
};
