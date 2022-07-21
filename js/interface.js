//Aktivni na pocetok
let actives = [];
//Parovi a:[b] elementi, ako se vkluci/iskluci a, se vklucuvaat/isklucuvaat site od b
const dependencies = {
    'options-button' : ['options-menu']
}
//Parovi a:[b] elementi, a ke postapi po deactivateOnClickOutside ako ne e pritisnat direktno toj ili nekoj od [b]
const volatiles = {
    'options-button' : ['options-menu'],
    'autocomplete' : ['search-input']
}

//FUNKCII
function activate(currentId) {
    if (!actives.includes(currentId)) {
        const element = document.getElementById(currentId);
        actives.push(currentId);
        element.classList.add('active');

        if (debug)
            console.log(`Aktiviran e ${currentId}, momentalni se: ` + JSON.stringify(actives));

        if (dependencies.hasOwnProperty(currentId))
            dependencies[currentId].forEach(activate);
    }
}
function deactivate(currentId) {
    const element = document.getElementById(currentId);
    actives = actives.filter(e => e !== currentId);
    element.classList.remove('active');
    if (debug)
        console.log(`Deaktiviran e ${currentId}, momentalni se: ` + JSON.stringify(actives));
    if (dependencies.hasOwnProperty(currentId))
        dependencies[currentId].forEach(deactivate);
}
function toggle(currentId) {
    if (actives.includes(currentId)) deactivate(currentId);
    else activate(currentId);
}
function deactivateOnClickOutside(event) {
    for (const x of actives) {
        if (volatiles.hasOwnProperty(x)) { //Ako x e volatile
            if (document.getElementById(x).contains(event.target)) return; //Ako x go sodrzi elementot na koj e kliknato, ne pravi nisto.
            let arr = volatiles[x];
            for (const y of arr) //za sekoj element y koj pripaga na "domenot" na x
                if (document.getElementById(y).contains(event.target)) return; //Ako y go sodrzi elementot na koj e kliknato, ne pravi nisto.
            deactivate(x);
        }
    }
}

//IZVRSEN
document.addEventListener('click',deactivateOnClickOutside);