const TetelekLista = document.getElementById("lista");
const KerdesKontener = document.getElementById("kerdesKontener");
const ValaszGombok = document.querySelectorAll("#valaszKontener .answer");

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
            kepek: mezok.slice(3),
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

function LehetsegesValaszok(tetel, forditott) {
    return tetel in Kerdesek ? Kerdesek[tetel].map(x => forditott ? x.kerdes : x.valasz) : [];
}
//#endregion

//#region Játékállás kezelése
let tetel = null;
let hatralevoKerdesek = 0;
let forditott = false;

let aktivKerdes;
let ertekeles = [];

function JatekIndit(_tetel, _forditott) {
    tetel = _tetel;
    forditott = _forditott;
    hatralevoKerdesek = Math.min((tetel == "_osszes" ? OsszesKerdes() : Kerdesek[tetel]).length, 20);

    KovetkezoKerdes();

    document.getElementById("InditoKontener").style.display = "none";
    document.getElementById("QuizKontener").style.display = "block";
}

function KovetkezoKerdes() {
    if (hatralevoKerdesek == 0) {
        Eredmenyek();
        return;
    }

    hatralevoKerdesek--;

    // Következő kérdés kiválasztása
    const MaradekKerdesek = (tetel == "_osszes" ? OsszesKerdes() : Kerdesek[tetel]).filter(x => x.kihuzott == false);
    aktivKerdes = MaradekKerdesek[Math.floor(Math.random() * MaradekKerdesek.length)];
    aktivKerdes.kihuzott = true;

    // Lehetséges válaszok kiválasztása
    let lehetsegesValaszok = LehetsegesValaszok(aktivKerdes.tetel, forditott).filter(x => x !== (forditott ? aktivKerdes.kerdes : aktivKerdes.valasz));
    let valaszok = [];
    for (let i = 0; i < 4; i++) {
        const v = lehetsegesValaszok[Math.floor(Math.random() * lehetsegesValaszok.length)];
        lehetsegesValaszok = lehetsegesValaszok.filter(x => x !== v);
        valaszok.push(v);
    }
    valaszok.splice(Math.floor(Math.random() * 5), 0, forditott ? aktivKerdes.kerdes : aktivKerdes.valasz);

    // Kérdés, gombok átírása
    KerdesKontener.querySelector("h1").innerText = aktivKerdes.tetel;
    KerdesKontener.querySelector("p").innerText = forditott ? aktivKerdes.valasz : aktivKerdes.kerdes;

    for (let index = 0; index < valaszok.length; index++) {
        ValaszGombok[index].querySelector("span").innerText = valaszok[index];
        ValaszGombok[index].value = valaszok[index];
    }
}

function Valaszol(valasz) {
    const helyes = valasz == ( forditott ? aktivKerdes.kerdes : aktivKerdes.valasz);
    ertekeles.push({
        kerdes: aktivKerdes,
        adottValasz: valasz,
        helyes: helyes
    });

    KovetkezoKerdes();
}

function Eredmenyek() {
    const mennyibol = ertekeles.length;
    const helyes = ertekeles.filter(x => x.helyes).length;
    const szazalek = Math.round(helyes / mennyibol * 100);

    alert("VÉGE")

    //todo: HTMl
}
//#endregion

//#region Html Kezelők
ValaszGombok.forEach(x => x.addEventListener("click", e => {
    Valaszol(e.currentTarget.value);
}));

document.querySelector("#inditas").addEventListener("click", () => {
    JatekIndit(TetelekLista.value, document.getElementById("forditott").checked);
});

function TetelOptionFelrak() {
    const el = document.createElement("option");
    el.value = "_osszes";
    el.innerText = "Összes";
    TetelekLista.appendChild(el);

    for (const tetel of Tetelek()) {
        const el = document.createElement("option");
        el.value = tetel;
        el.innerText = tetel;
        TetelekLista.appendChild(el);
    }
}
//#endregion

async function Init() {
    await KerdesekBetoltese();
    TetelOptionFelrak();
}

Init();