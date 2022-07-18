let actives = [];
const dependencies = {
    'options-button' : ['options-menu']
}
function toggle(currentId) {
    const element = document.getElementById(currentId);
    if (actives.find(e => currentId === e)) {
        actives = actives.filter(e => e !== currentId);
        element.classList.remove('active');
    }
    else {
        actives.push(currentId);
        element.classList.add('active');
    }
    if (dependencies.hasOwnProperty(currentId))
        for (let i=0; i<dependencies[currentId].length; i++)
            toggle(dependencies[currentId][i]);
}