export const SLACK_NEW_VISITOR_HOOK = 'https://hooks.slack.com/services/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';

export const CATEGORIES = [
    {
        id: btoa("Sport"),
        label: "Sport",
        icon: 'sport'
    },
    {
        id: btoa("Na swiezym powietrzu"),
        label: "Na świeżym powietrzu",
        icon: 'outdoor'
    },
    {
        id: btoa("Party & Pub"),
        label: "Party & Pub",
        icon: 'party'
    },
    {
        id: btoa("Kino & Teatr"),
        label: "Kino & Teatr",
        icon: 'cinema'
    },
    {
        id: btoa("Sztuka"),
        label: "Sztuka",
        icon: 'fineart'
    },
    {
        id: btoa("Turystyka"),
        label: "Turystyka",
        icon: 'travel'
    },
    {
        id: btoa("Gry i zabawy"),
        label: "Gry i zabawy",
        icon: 'games'
    },
    {
        id: btoa("Zainteresowania i umiejetnosci"),
        label: "Zainteresowania i umiejętności",
        icon: 'skills'
    },
    {
        id: btoa("Inne"),
        label: "Inne",
        icon: 'other'
    },
    {
        id: btoa("Rower"),
        label: "Rower",
        parent: btoa("Sport")
    },
    {
        id: btoa("Deskorolka i rolki"),
        label: "Deskorolka i rolki",
        parent: btoa("Sport")
    },
    {
        id: btoa("Taniec"),
        label: "Taniec",
        parent: btoa("Sport")
    },
    {
        id: btoa("Plywanie i sporty wodne"),
        label: "Pływanie i sporty wodne",
        parent: btoa("Sport")
    },
    {
        id: btoa("Latanie i sporty podniebne"),
        label: "Latanie i sporty podniebne",
        parent: btoa("Sport")
    },
    {
        id: btoa("Motocykle"),
        label: "Motocykle",
        parent: btoa("Sport")
    },
    {
        id: btoa("Jazda konna"),
        label: "Jazda konna",
        parent: btoa("Sport")
    },
    {
        id: btoa("Lyzwy i sanki"),
        label: "Łyżwy i sanki",
        parent: btoa("Sport")
    },
    {
        id: btoa("Narty i snowboard"),
        label: "Narty i snowboard",
        parent: btoa("Sport")
    },
    {
        id: btoa("Silownia i fitness"),
        label: "Siłownia i fitness",
        parent: btoa("Sport")
    },
    {
        id: btoa("Grill & ognisko"),
        label: "Grill & ognisko",
        parent: btoa("Na swiezym powietrzu")
    },
    {
        id: btoa("Spacer"),
        label: "Spacer",
        parent: btoa("Na swiezym powietrzu")
    },
    {
        id: btoa("Wyjscie z pupilem"),
        label: "Wyjście z pupilem",
        parent: btoa("Na swiezym powietrzu")
    },
    {
        id: btoa("Chodzenie po gorach"),
        label: "Chodzenie po górach",
        parent: btoa("Na swiezym powietrzu")
    },
    {
        id: btoa("Wyjscie do pubu lub restauracji"),
        label: "Wyjście do pubu lub restauracji",
        parent: btoa("Party & Pub")
    },
    {
        id: btoa("Dyskoteka i tance"),
        label: "Dyskoteka i tańce",
        parent: btoa("Party & Pub")
    },
    {
        id: btoa("Domowka"),
        label: "Domówka",
        parent: btoa("Party & Pub")
    },
    {
        id: btoa("Festyn"),
        label: "Festyn",
        parent: btoa("Party & Pub")
    },
    {
        id: btoa("Open Air"),
        label: "Open Air",
        parent: btoa("Party & Pub")
    },
    {
        id: btoa("Beach party"),
        label: "Beach party",
        parent: btoa("Party & Pub")
    },
    {
        id: btoa("Karaoke"),
        label: "Karaoke",
        parent: btoa("Party & Pub")
    },
    {
        id: btoa("Kregle"),
        label: "Kręgle",
        parent: btoa("Party & Pub")
    },
    {
        id: btoa("Bilard"),
        label: "Bilard",
        parent: btoa("Party & Pub")
    },
    {
        id: btoa("Kino"),
        label: "Kino",
        parent: btoa("Kino & Teatr")
    },
    {
        id: btoa("Teatr"),
        label: "Teatr",
        parent: btoa("Kino & Teatr")
    },
    {
        id: btoa("Opera lub filharmonia"),
        label: "Opera lub filharmonia",
        parent: btoa("Kino & Teatr")
    },
    {
        id: btoa("Festiwal"),
        label: "Festiwal",
        parent: btoa("Kino & Teatr")
    },
    {
        id: btoa("Muzea"),
        label: "Muzea",
        parent: btoa("Sztuka")
    },
    {
        id: btoa("Kolekcje i zbiory"),
        label: "Kolekcje i zbiory",
        parent: btoa("Sztuka")
    },
    {
        id: btoa("Wystawa"),
        label: "Wystawa",
        parent: btoa("Sztuka")
    },
    {
        id: btoa("Plener artystyczny"),
        label: "Plener artystyczny",
        parent: btoa("Sztuka")
    },
    {
        id: btoa("Biwak"),
        label: "Biwak",
        parent: btoa("Turystyka")
    },
    {
        id: btoa("Wycieczka w gory"),
        label: "Wycieczka w góry",
        parent: btoa("Turystyka")
    },
    {
        id: btoa("Wycieczka nad morze"),
        label: "Wycieczka nad morze",
        parent: btoa("Turystyka")
    },
    {
        id: btoa("Wycieczka zagraniczna"),
        label: "Wycieczka zagraniczna",
        parent: btoa("Turystyka")
    },
    {
        id: btoa("Wycieczki lokalne"),
        label: "Wycieczki lokalne",
        parent: btoa("Turystyka")
    },
    {
        id: btoa("Gry planszowe"),
        label: "Gry planszowe",
        parent: btoa("Gry i zabawy")
    },
    {
        id: btoa("Gry karciane"),
        label: "Gry karciane",
        parent: btoa("Gry i zabawy")
    },
    {
        id: btoa("Gry komputerowe i VR"),
        label: "Gry komputerowe i VR",
        parent: btoa("Gry i zabawy")
    },
    {
        id: btoa("Escape room"),
        label: "Escape room",
        parent: btoa("Gry i zabawy")
    },
    {
        id: btoa("Laser tag"),
        label: "Laser tag",
        parent: btoa("Gry i zabawy")
    },
    {
        id: btoa("Wymiana zainteresowan"),
        label: "Wymiana zainteresowań",
        parent: btoa("Zainteresowania i umiejetnosci")
    },
    {
        id: btoa("Wymiana umiejetnosci"),
        label: "Wymiana umiejętności",
        parent: btoa("Zainteresowania i umiejetnosci")
    }
]
