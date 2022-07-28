let modalElement;

function getCheckboxStates() {
    let result = [...modalElement.querySelectorAll('input')];
    for (c in result) {
        result[c] = result[c].checked;
    }
    return result;
}

function closeModal() {
    modalElement.remove();
}

function openModal(title, description, modalActions = [{type:"button", name:"OK", action:closeModal}], modalClasses = [], isVolatile = true ) {
    modalElement = document.createElement("div"); modalElement.id = 'modal';
    for (mc of modalClasses)
        modalElement.classList.add(mc);
    const modalInner = document.createElement("div"); modalInner.id = "modal-inner";
    const modalTitle = document.createElement("h3"); modalTitle.innerHTML = title; modalInner.append(modalTitle);
    const modalDescription = document.createElement("p"); modalDescription.innerHTML = description; modalInner.append(modalDescription);
    
    for (cbx of modalActions) {
        if (cbx.type === "checkbox") {
            const modalCheckboxDiv = document.createElement("div");
            modalCheckboxDiv.classList.add("checkbox-container");
            const modalCheckbox = document.createElement("input");
            modalCheckbox.type = cbx.type; modalCheckbox.id = cbx.id;
            modalCheckboxDiv.append(modalCheckbox);
            const modalLabel = document.createElement("label");
            modalLabel.for = cbx.id; modalLabel.innerText = cbx.name;
            modalCheckboxDiv.append(modalLabel);
            modalInner.append(modalCheckboxDiv);
        }
    }
    const modalButtonDiv = document.createElement("div");
    for (btn of modalActions) {
        modalButtonDiv.classList.add("center");
        if (btn.type === "button") {
            const modalButton = document.createElement("button");
            modalButton.innerText = btn.name;
            modalButton.onclick = btn.action;
            modalButtonDiv.append(modalButton);
        }
        
    }
    modalInner.append(modalButtonDiv);
    modalElement.append(modalInner);
    document.body.append(modalElement);

    if (isVolatile) {
        modalElement.addEventListener('click', event => {
            if (!modalInner.contains(event.target))
                closeModal();
        })
    }
}

openModal("title","text");