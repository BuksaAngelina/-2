AFRAME.registerComponent('regular-ngon', {
    schema: {
        sides:          {type: 'int',      default: 6},
        radius:         {type: 'number',   default: 1},
        color:          {type: 'string',   default: 'red'},
        highlightCoals: {type: 'boolean',  default: false},
    },
    init: function () {
        this.el.sceneEl.addEventListener('loaded', () => {
            this.draw();
        });
    },
    update: function () {
        // Додаємо невелику затримку, щоб переконатися, що A-Frame повністю оновився
        // перед перемальовуванням, особливо при швидких змінах в UI.
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
            this.draw();
        }, 50); // Невелика затримка в 50 мс
    },
    remove: function () {
        if (this.vertexHelpers) {
            this.vertexHelpers.forEach(obj => this.el.object3D.remove(obj));
            this.vertexHelpers = null; // Очищуємо посилання
        }
        if (this.borderMesh) {
            this.el.object3D.remove(this.borderMesh);
            this.borderMesh = null; // Очищуємо посилання
        }
        this.el.removeObject3D('mesh');
        if (this.blinkRAF) {
            cancelAnimationFrame(this.blinkRAF);
            this.blinkRAF = null;
        }
        clearTimeout(this.updateTimeout); // Очищаємо таймер
    },
    draw: function () {
        const args = this.data;

        // --- Очищення старих об'єктів ---
        if (this.el.getObject3D('mesh')) {
            this.el.removeObject3D('mesh');
        }
        if (this.vertexHelpers) {
            this.vertexHelpers.forEach(obj => this.el.object3D.remove(obj));
            this.vertexHelpers = [];
        }
        if (this.borderMesh) {
            this.el.object3D.remove(this.borderMesh);
            this.borderMesh = null;
        }

        // --- Генерування вершин для n-кутника ---
        const vertices = [];
        for (let i = 0; i < args.sides; i++) {
            const theta = (i / args.sides) * 2 * Math.PI;
            vertices.push(args.radius * Math.cos(theta), 0, args.radius * Math.sin(theta));
        }

        // Центральна точка (для створення трикутників, що формують площину)
        vertices.push(0, 0, 0);
        const centerIndex = args.sides;

        // Індекси для граней (трикутників)
        const indices = [];
        for (let i = 0; i < args.sides; i++) {
            indices.push(centerIndex, i, (i + 1) % args.sides);
        }

        // --- Створення геометрії ---
        const geometry = new THREE.BufferGeometry();
        // **ВИПРАВЛЕННЯ:** Використовуємо Float32Array для вершин
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(vertices), 3));
        // **ВИПРАВЛЕННЯ:** Використовуємо Uint16Array для індексів (або Uint32Array, якщо індексів дуже багато, але для 9 сторін 16 біт достатньо)
        geometry.setIndex(new THREE.Uint16BufferAttribute(new Uint16Array(indices), 1));
        geometry.computeVertexNormals(); // Обчислюємо нормалі для коректного освітлення

        // --- Створення меша полігона ---
        this.el.setObject3D('mesh', new THREE.Mesh(
            geometry,
            new THREE.MeshStandardMaterial({color: args.color, side: THREE.DoubleSide})
        ));

        // --- Додаємо контур (border) ---
        const borderGeometry = new THREE.BufferGeometry();
        const borderVertices = [];
        for (let i = 0; i < args.sides; i++) {
            const theta = (i / args.sides) * 2 * Math.PI;
            // Трохи вище основного полігона, щоб уникнути Z-файтингу (мерехтіння)
            borderVertices.push(args.radius * Math.cos(theta), 0.001, args.radius * Math.sin(theta));
        }
        // Замикаємо контур, додаючи першу вершину в кінець
        borderVertices.push(borderVertices[0], borderVertices[1], borderVertices[2]);

        // **ВИПРАВЛЕННЯ:** Використовуємо Float32Array для вершин контуру
        borderGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(borderVertices), 3));

        this.borderMesh = new THREE.LineLoop(
            borderGeometry,
            new THREE.LineBasicMaterial({ color: 0x0000FF, linewidth: 3 }) // Синій колір для контуру
        );
        this.el.object3D.add(this.borderMesh);


        // --- Підсвічування кутів/вершин, якщо увімкнено ---
        if (args.highlightCoals) {
            for (let i = 0; i < args.sides; i++) {
                // Використовуємо дані з оригінального масиву vertices
                const x = vertices[i * 3], y = vertices[i * 3 + 1], z = vertices[i * 3 + 2];
                const helper = new THREE.Mesh(
                    new THREE.SphereGeometry(0.07 * args.radius, 8, 8),
                    new THREE.MeshStandardMaterial({color: 'red', emissive: 'orange'}) // Червоний колір для виділення
                );
                helper.position.set(x, y, z);
                this.el.object3D.add(helper);
                this.vertexHelpers.push(helper);
            }
        }
    }
});