// polygon-logic.js
import { calculateDistance, calculateAngleBetweenVectors, calculatePolygonArea, getMidpoint } from './math-utils.js';

AFRAME.registerComponent('polygon-generator', {
    schema: {
        numSides: { type: 'int', default: 4 },
        size: { type: 'number', default: 2 },
        highlightAngles: { type: 'boolean', default: false },
        showMeasurements: { type: 'boolean', default: false },
        draggingEnabled: { type: 'boolean', default: true },
        fillColor: { type: 'color', default: '#006400' },
        customSides: { type: 'array', default: [] },  // Додано для кастомних сторін
        customAngles: { type: 'array', default: [] }   // Додано для кастомних кутів
    },

    init: function () {
        this.vertices = [];
        this.vertexEntities = [];
        this.angleTexts = [];
        this.sideTexts = [];
        this.polygonEntity = null;
        this.updatePolygon();

        this.el.addEventListener('vertex-dragged', (evt) => {
            const index = evt.detail.index;
            const newPos = evt.detail.position;
            this.vertices[index].copy(newPos);
            this.updatePolygonGeometry();
            this.updateMeasurements();
        });
    },

    update: function (oldData) {
        const needsUpdate = (
            this.data.numSides !== oldData.numSides || 
            this.data.size !== oldData.size ||
            JSON.stringify(this.data.customSides) !== JSON.stringify(oldData.customSides) ||
            JSON.stringify(this.data.customAngles) !== JSON.stringify(oldData.customAngles)
        );

        if (needsUpdate) {
            this.updatePolygon();
        }
        
        if (this.data.highlightAngles !== oldData.highlightAngles) {
            this.toggleAngleHighlight(this.data.highlightAngles);
        }
        if (this.data.showMeasurements !== oldData.showMeasurements) {
            this.toggleMeasurements(this.data.showMeasurements);
        }
        if (this.data.draggingEnabled !== oldData.draggingEnabled) {
            this.vertexEntities.forEach(vertexEl => {
                vertexEl.setAttribute('draggable-vertex', 'enabled', this.data.draggingEnabled);
            });
        }
        if (this.data.fillColor !== oldData.fillColor) {
            const mesh = this.polygonEntity?.getObject3D('mesh');
            if (mesh?.material) {
                mesh.material.color.set(this.data.fillColor);
            }
        }
    },

    updatePolygon: function () {
        this.clearPolygon();
        const numSides = this.data.numSides;
        
        // Якщо задані кастомні сторони та кути, використовуємо їх
        if (this.data.customSides.length === numSides && this.data.customAngles.length === numSides - 1) {
            this.createPolygonFromSidesAndAngles();
        } else {
            this.createRegularPolygon();
        }

        this.updateMeasurements();
        this.toggleAngleHighlight(this.data.highlightAngles);
        this.toggleMeasurements(this.data.showMeasurements);
    },

    createRegularPolygon: function() {
        const numSides = this.data.numSides;
        const radius = this.data.size / (2 * Math.sin(Math.PI / numSides));

        this.vertices = [];
        for (let i = 0; i < numSides; i++) {
            const angle = i * 2 * Math.PI / numSides;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            this.vertices.push(new THREE.Vector3(x, 0, z));
        }

        this.createPolygonEntities();
    },

    createPolygonFromSidesAndAngles: function() {
        const sides = this.data.customSides.map(Number);
        const angles = this.data.customAngles.map(angle => angle * Math.PI / 180); // Конвертуємо в радіани
        const numSides = sides.length;
        
        // Починаємо з точки (0, 0, 0)
        this.vertices = [new THREE.Vector3(0, 0, 0)];
        
        // Додаємо першу сторону вздовж осі X
        this.vertices.push(new THREE.Vector3(sides[0], 0, 0));
        
        let currentAngle = 0;
        let currentPosition = this.vertices[1].clone();
        
        // Додаємо решту вершин на основі сторін і кутів
        for (let i = 1; i < numSides; i++) {
            // Обчислюємо новий кут повороту
            const angle = i < numSides - 1 ? Math.PI - angles[i - 1] : 2 * Math.PI - currentAngle;
            
            // Обчислюємо нову позицію
            currentAngle += angle;
            const x = currentPosition.x + sides[i] * Math.cos(currentAngle);
            const z = currentPosition.z + sides[i] * Math.sin(currentAngle);
            
            const newPosition = new THREE.Vector3(x, 0, z);
            this.vertices.push(newPosition);
            currentPosition.copy(newPosition);
        }
        
        // Центруємо багатокутник
        this.centerPolygon();
        this.createPolygonEntities();
    },

    centerPolygon: function() {
        // Знаходимо центр мас
        const center = new THREE.Vector3();
        this.vertices.forEach(v => center.add(v));
        center.divideScalar(this.vertices.length);
        
        // Переносимо всі вершини так, щоб центр був у (0,0,0)
        this.vertices.forEach(v => v.sub(center));
    },

    createPolygonEntities: function() {
        this.polygonEntity = document.createElement('a-entity');
        this.el.appendChild(this.polygonEntity);
        this.updatePolygonGeometry();

        this.vertexEntities = [];
        this.vertices.forEach((v, index) => {
            const vertexEl = document.createElement('a-sphere');
            vertexEl.setAttribute('position', `${v.x} ${v.y} ${v.z}`);
            vertexEl.setAttribute('radius', 0.08);
            vertexEl.setAttribute('color', '#FF0000');
            vertexEl.setAttribute('draggable-vertex', { enabled: this.data.draggingEnabled });
            vertexEl.setAttribute('class', 'collidable');
            this.el.appendChild(vertexEl);
            this.vertexEntities.push(vertexEl);

            vertexEl.addEventListener('dragmove', (evt) => {
                this.el.emit('vertex-dragged', { index: index, position: evt.detail.position });
            });
        });
    },

    // Інші методи залишаються незмінними
    updatePolygonGeometry: function() {
        // ... (попередня реалізація залишається без змін)
    },

    clearPolygon: function() {
        // ... (попередня реалізація залишається без змін)
    },

    updateMeasurements: function() {
        // ... (попередня реалізація залишається без змін)
    },

    toggleAngleHighlight: function(visible) {
        // ... (попередня реалізація залишається без змін)
    },

    toggleMeasurements: function(visible) {
        // ... (попередня реалізація залишається без змін)
    }
});