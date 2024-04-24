const TetelekLista = document.getElementById("lista");
const KerdesKontener = document.getElementById("kerdesKontener");
const ValaszGombok = document.querySelectorAll("#valaszKontener .answer");
const QuizKontener = document.getElementById("QuizKontener");
const EredmenyGrid = document.getElementById("eredmenyGrid");
const TanulasGrid = document.getElementById("tanulasGrid");
const Kepek = document.getElementById("kepek");
const KepekGomb = document.getElementById("valtasKepekre");
const TanulasGomb = document.getElementById("tanulas")
//#region Kérdések kezelése
/*
 * Kérdések tétel szerint.
 */
let Kerdesek = {};

function DisableGombok() {
    document.getElementById("Akartya").disabled = true;
    document.getElementById("Bkartya").disabled = true;
    document.getElementById("Ckartya").disabled = true;
    document.getElementById("Dkartya").disabled = true;
    document.getElementById("Ekartya").disabled = true;
}

function EnableGombok() {
    document.getElementById("Akartya").disabled = false;
    document.getElementById("Bkartya").disabled = false;
    document.getElementById("Ckartya").disabled = false;
    document.getElementById("Dkartya").disabled = false;
    document.getElementById("Ekartya").disabled = false;
}

//kerdeskiiro
function KiirBetunkent(celhely, kerdesUzenet, sebesseg){
    var i = 0;
    DisableGombok();
    var interval = setInterval(function(){
        document.getElementById(celhely).innerHTML += kerdesUzenet.charAt(i);
        i++;
        if (i > kerdesUzenet.length){
            clearInterval(interval);
            EnableGombok();
        }
    }, sebesseg);
}


async function KerdesekBetoltese() {
    const r = await fetch("/data2.csv");
    const szoveg = await r.text();

    const sorok = szoveg.trim().split("\n").splice(1);
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

function Refresh(){
    setTimeout(function(){
        window.location.reload();
      });
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
    QuizKontener.style.display = "block";
}

function ElozetesTudas() {


    document.getElementById("TanulasKontener").style.display="";
    
    for (const k of OsszesKerdes()) {
        const tetelEl = document.createElement("div");
        tetelEl.innerHTML = k.tetel;
        TanulasGrid.appendChild(tetelEl);

        const kerdesEl = document.createElement("div");
        kerdesEl.innerHTML = k[forditott ? "valasz" : "kerdes"];
        TanulasGrid.appendChild(kerdesEl);

        const helyesEl = document.createElement("div");
        helyesEl.innerHTML = k.helyes ? "✔" : k[forditott ? "kerdes" : "valasz"];
        helyesEl.className = "helyes";
        TanulasGrid.appendChild(helyesEl);
    }

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
    KerdesKontener.querySelector("h1").innerText = aktivKerdes.tetel.slice(5);
    // KerdesKontener.querySelector("p").innerText = forditott ? aktivKerdes.valasz : aktivKerdes.kerdes;
    document.getElementById("kerdes").innerHTML = "";
    KiirBetunkent("kerdes", forditott ? aktivKerdes.valasz : aktivKerdes.kerdes, 40);

    for (let index = 0; index < valaszok.length; index++) {
        ValaszGombok[index].querySelector("span").innerText = valaszok[index];
        ValaszGombok[index].value = valaszok[index];
    }

    // Képek felrakása
    Kepek.innerHTML = "";
    if (aktivKerdes.kepek.length > 0) {
        KepekGomb.style.visibility = "visible";
        for (const kep of aktivKerdes.kepek) {
            const el = document.createElement("img");
            el.src = "/Images/" + kep;
            Kepek.appendChild(el);
        }
    } else {
        KepekGomb.style.visibility = "hidden";
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

    document.getElementById("statok").innerText = `Helyesen megválaszolt: ${helyes}/${mennyibol} (${szazalek}%)`

    for (const k of ertekeles) {
        const tetelEl = document.createElement("div");
        tetelEl.innerHTML = k.kerdes.tetel.slice(5);
        EredmenyGrid.appendChild(tetelEl);

        const kerdesEl = document.createElement("div");
        kerdesEl.innerHTML = k.kerdes[forditott ? "valasz" : "kerdes"];
        EredmenyGrid.appendChild(kerdesEl);

        const valaszEl = document.createElement("div");
        valaszEl.innerHTML = k.adottValasz;
        valaszEl.className = k.helyes ? "helyes" : "rossz";
        EredmenyGrid.appendChild(valaszEl);

        const helyesEl = document.createElement("div");
        helyesEl.innerHTML = k.helyes ? "✔" : k.kerdes[forditott ? "kerdes" : "valasz"];
        helyesEl.className = "helyes";
        EredmenyGrid.appendChild(helyesEl);
    }

    QuizKontener.style.display = "none";
    document.getElementById("EredmenyKontener").style.display = "";
}
//#endregion

//#region Html Kezelők
ValaszGombok.forEach(x => x.addEventListener("click", e => {
    Valaszol(e.currentTarget.value);
}));

document.querySelector("#inditas").addEventListener("click", () => {
    JatekIndit(TetelekLista.value, document.getElementById("forditott").checked);
});

KepekGomb.addEventListener("click", () => {
    Kepek.style.display = "";
})

TanulasGomb.addEventListener("click", () =>{
    document.getElementById("InditoKontener").style.display = "none";
    ElozetesTudas()

})

Kepek.addEventListener("click", () => {
    Kepek.style.display = "none";
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
