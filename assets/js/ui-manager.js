// ui-manager.js
document.addEventListener('DOMContentLoaded', function () {
    const numSidesInput = document.getElementById('num-sides');
    const sidesValueSpan = document.getElementById('sides-value');
    const polygonSizeInput = document.getElementById('polygon-size');
    const sizeValueSpan = document.getElementById('size-value');
    const highlightAnglesBtn = document.getElementById('highlight-angles-btn');
    const showMeasurementsBtn = document.getElementById('show-measurements-btn');
    const toggleDragBtn = document.getElementById('toggle-drag-btn');
    const polygonContainer = document.getElementById('polygon-container');
    const nextTheoremStepBtn = document.getElementById('next-theorem-step');
    const prevTheoremStepBtn = document.getElementById('prev-theorem-step');
    const measurementsOutput = document.getElementById('measurements-output');

    let highlightAnglesActive = false;
    let showMeasurementsActive = false;
    let draggingActive = true; // Перетягування увімкнено за замовчуванням

    // --- Теореми (примітивний приклад) ---
    const theorems = [
        {
            name: "Сума кутів трикутника",
            steps: [
                {
                    description: "Крок 1: Розглянемо довільний трикутник ABC.",
                    action: (polyGen) => {
                        polyGen.setAttribute('polygon-generator', 'numSides', 3);
                        polyGen.setAttribute('polygon-generator', 'highlightAngles', false);
                        polyGen.setAttribute('polygon-generator', 'showMeasurements', false);
                    }
                },
                {
                    description: "Крок 2: Кути трикутника.",
                    action: (polyGen) => {
                        polyGen.setAttribute('polygon-generator', 'highlightAngles', true);
                    }
                },
                {
                    description: "Крок 3: Сума кутів трикутника дорівнює 180°.",
                    action: (polyGen) => {
                        // Тут можна було б додати візуалізацію переміщення кутів або спеціальний текст
                        polyGen.setAttribute('polygon-generator', 'highlightAngles', true);
                        polyGen.setAttribute('polygon-generator', 'showMeasurements', true);
                        measurementsOutput.textContent += "\nТеорема: Сума кутів трикутника = 180° (приблизно)";
                    }
                }
            ]
        }
        // Можна додати більше теорем
    ];
    let currentTheoremIndex = 0;
    let currentTheoremStep = 0;

    function applyTheoremStep() {
        if (theorems.length === 0) return;
        const currentTheorem = theorems[currentTheoremIndex];
        const step = currentTheorem.steps[currentTheoremStep];
        document.getElementById('measurements-output').textContent = `Теорема: ${currentTheorem.name}\n${step.description}`;
        step.action(polygonContainer);
    }
    // --- Кінець Теорем ---

    // Ініціалізація початкових значень
    sidesValueSpan.textContent = numSidesInput.value;
    sizeValueSpan.textContent = polygonSizeInput.value;
    polygonContainer.setAttribute('polygon-generator', {
        numSides: parseInt(numSidesInput.value),
        size: parseFloat(polygonSizeInput.value),
        highlightAngles: highlightAnglesActive,
        showMeasurements: showMeasurementsActive,
        draggingEnabled: draggingActive
    });

    // Слухачі подій для UI елементів
    numSidesInput.addEventListener('input', function () {
        sidesValueSpan.textContent = this.value;
        polygonContainer.setAttribute('polygon-generator', 'numSides', parseInt(this.value));
        currentTheoremIndex = 0; // Скидаємо прогрес теорем
        currentTheoremStep = 0;
    });

    polygonSizeInput.addEventListener('input', function () {
        sizeValueSpan.textContent = this.value;
        polygonContainer.setAttribute('polygon-generator', 'size', parseFloat(this.value));
        currentTheoremIndex = 0; // Скидаємо прогрес теорем
        currentTheoremStep = 0;
    });

    highlightAnglesBtn.addEventListener('click', function () {
        highlightAnglesActive = !highlightAnglesActive;
        polygonContainer.setAttribute('polygon-generator', 'highlightAngles', highlightAnglesActive);
        highlightAnglesBtn.textContent = highlightAnglesActive ? 'Приховати Кути' : 'Показати Кути';
    });

    showMeasurementsBtn.addEventListener('click', function () {
        showMeasurementsActive = !showMeasurementsActive;
        polygonContainer.setAttribute('polygon-generator', 'showMeasurements', showMeasurementsActive);
        showMeasurementsBtn.textContent = showMeasurementsActive ? 'Приховати Виміри' : 'Показати Виміри';
    });

    toggleDragBtn.addEventListener('click', function() {
        draggingActive = !draggingActive;
        polygonContainer.setAttribute('polygon-generator', 'draggingEnabled', draggingActive);
        toggleDragBtn.textContent = draggingActive ? 'Вимкнути Перетягування' : 'Увімкнути Перетягування';
    });

    nextTheoremStepBtn.addEventListener('click', function() {
        if (theorems.length === 0) return;
        const currentTheorem = theorems[currentTheoremIndex];
        if (currentTheoremStep < currentTheorem.steps.length - 1) {
            currentTheoremStep++;
            applyTheoremStep();
        } else if (currentTheoremIndex < theorems.length - 1) {
            currentTheoremIndex++;
            currentTheoremStep = 0;
            applyTheoremStep();
        } else {
            alert('Всі теореми та кроки розглянуто!');
        }
    });

    prevTheoremStepBtn.addEventListener('click', function() {
        if (theorems.length === 0) return;
        if (currentTheoremStep > 0) {
            currentTheoremStep--;
            applyTheoremStep();
        } else if (currentTheoremIndex > 0) {
            currentTheoremIndex--;
            currentTheoremStep = theorems[currentTheoremIndex].steps.length - 1;
            applyTheoremStep();
        } else {
            alert('Ви на першому кроці першої теореми!');
        }
    });
});
