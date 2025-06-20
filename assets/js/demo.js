const state = {
    sides: 5,
    radius: 4,
    showCoals: false,
}

function onChangeShapeSides(value) {
    document.getElementById('sides-label').textContent = value;
    document.getElementById('coal-value').textContent = Math.round((value-2) * 180 / value*100)/100;
    state.sides = value;
    drawShapeFromState();
}

function onChangeShapeRadius(value) {
    state.radius = value;
    document.getElementById('edge-value').textContent = value;
    drawShapeFromState();
}

function onChangeShapeShowCoals(value) {
    state.showCoals = value;
    drawShapeFromState();
}

function onChangeShapeShowCoalsRevers() {
    state.showCoals = !state.showCoals;
    drawShapeFromState();
}

function drawShapeFromState() {
    document.getElementById('squre-value').textContent = Math.round(state.sides * state.radius*state.radius / 4 * (1 / Math.tan((180 * Math.PI) / 180/state.sides))*100)/100;
    document.querySelector('#shape-presentation')
        .setAttribute('regular-ngon', `sides: ${state.sides}; radius: ${state.radius}; highlightCoals: ${state.showCoals}`);
}
