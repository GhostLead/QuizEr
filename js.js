
//#region Kérdések kezelése
/*
 * Kérdések tétel szerint.
 */
let Kerdesek = {};

async function KerdesekBetoltese() {
    const r = await fetch("/teszt.csv");
    const szoveg = await r.text();

    const sorok = szoveg.trim().split("\n");
    for (const sor of sorok) {
        const mezok = sor.trim().split(";");

        if (!(mezok[0] in Kerdesek)) {
            Kerdesek[mezok[0]] = [];
        }

        Kerdesek[mezok[0]].push({
            tetel: mezok[0],
            kerdes: mezok[1],
            valasz: mezok[2],
            kihuzott: false
        });
    }
}

function OsszesKerdes() {
    let osszes = [];
    for (const tetel of Object.values(Kerdesek)) {
        osszes = osszes.concat(tetel);
    }
    return osszes;
}

function Tetelek() {
    return Object.keys(Kerdesek);
}

function LehetsegesValaszok(tetel) {
    return tetel in Kerdesek ? Kerdesek[tetel].map(x => x.valasz) : [];
}
//#endregion

//#region Játékállás kezelése
let tetel = null;
let hatralevoKerdesek = 0;
let aktivKerdes;

function JatekIndit(_tetel) {
    tetel = _tetel;
    hatralevoKerdesek = Math.max((tetel == "_osszes" ? OsszesKerdes() : Kerdesek[tetel]).length, 20);

    KovetkezoKerdes();
}

function KovetkezoKerdes() {
    if (hatralevoKerdesek == 0) {
        //todo: Játék vége
        return;
    }

    hatralevoKerdesek--;

    const MaradekKerdesek = (tetel == "_osszes" ? OsszesKerdes() : Kerdesek[tetel]).filter(x => x.kihuzott == false);
    aktivKerdes = MaradekKerdesek[Math.floor(Math.random() * MaradekKerdesek.length)];
    aktivKerdes.kihuzott = true;

    let lehetsegesValaszok = LehetsegesValaszok(tetel);
    let valaszok = [];
    for (let i = 0; i < 3; i++) {
        const v = lehetsegesValaszok[Math.floor(Math.random() * lehetsegesValaszok.length)];
        lehetsegesValaszok = lehetsegesValaszok.filter(x => x !== v);
        valaszok.push(v);
    }
    valaszok.splice(Math.floor(Math.random() * 4), 0, aktivKerdes.valasz);

    //todo: html módosítása
}

function Valaszol(valasz) {
    if (valasz == aktivKerdes.valasz) {
        alert("helyes");
    }
    else {
        alert("rossz");
    }

    KovetkezoKerdes();
}
//#endregion

async function Init() {
    await KerdesekBetoltese();
    console.log(Kerdesek);
}

Init();