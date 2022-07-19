//DA SE MIGRIRA VO JSON
let debug=false;

//Aktivni na pocetok
let actives = [];
//Parovi a:[b] elementi, ako se togglene a, se togglenuvaat site od b
const dependencies = {
    'options-button' : ['options-menu'],
    'search-input' : ['autocomplete']
}
//Parovi a:[b] elementi, a ke postapi po deactivateOnClickOutside ako ne e pritisnat direktno toj ili nekoj od [b]
const volatiles = {
    'options-button' : ['options-menu'],
    'autocomplete' : ['search-input']
}

//FUNKCII
function activate(currentId) {
    const element = document.getElementById(currentId);
    actives.push(currentId);
    element.classList.add('active');
    if (debug)
        console.log(`Aktiviran e ${currentId}, momentalni se: ` + JSON.stringify(actives));
    if (dependencies.hasOwnProperty(currentId))
        m_dependencies(currentId, activate);
}
function deactivate(currentId) {
    const element = document.getElementById(currentId);
    actives = actives.filter(e => e !== currentId);
    element.classList.remove('active');
    if (debug)
        console.log(`Deaktiviran e ${currentId}, momentalni se: ` + JSON.stringify(actives));
    if (dependencies.hasOwnProperty(currentId))
        m_dependencies(currentId, deactivate);
}
function m_dependencies(currentId, foo) {
    for (let i=0; i<dependencies[currentId].length; i++)
        foo(dependencies[currentId][i]);
}
function toggle(currentId) {
    if (actives.find(e => currentId === e)) deactivate(currentId);
    else activate(currentId);
}
function deactivateOnClickOutside(event) {
    for (let i=0; i<actives.length; i++) {
        if (volatiles.hasOwnProperty(actives[i])) {
            if (document.getElementById(actives[i]).contains(event.target)) return;
            let arr = volatiles[actives[i]];
            for (let j=0; j<arr.length; j++)
                if (document.getElementById(arr[j]).contains(event.target)) return;
            deactivate(actives[i]);
        }
    }
}

//IZVRSEN
document.addEventListener('click',deactivateOnClickOutside);