// draggable-component.js
AFRAME.registerComponent('draggable-vertex', {
    init: function () {
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.isDragging = false;
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(); // Площина для перетину з променем
        this.offset = new THREE.Vector3();
        this.intersection = new THREE.Vector3();
        this.el.sceneEl.addEventListener('mousedown', this.onMouseDown);
        this.el.sceneEl.addEventListener('mouseup', this.onMouseUp);
        this.el.sceneEl.addEventListener('mousemove', this.onMouseMove);

        this.el.setAttribute('class', 'collidable'); // Додаємо клас для raycaster
    },

    remove: function () {
        this.el.sceneEl.removeEventListener('mousedown', this.onMouseDown);
        this.el.sceneEl.removeEventListener('mouseup', this.onMouseUp);
        this.el.sceneEl.removeEventListener('mousemove', this.onMouseMove);
    },

    onMouseDown: function (evt) {
        if (!this.el.components['draggable-vertex'].data.enabled) return; // Перевірка, чи ввімкнено перетягування
        const raycasterEl = this.el.sceneEl.querySelector('[raycaster]');
        if (!raycasterEl) return;

        const raycasterComponent = raycasterEl.components.raycaster;
        if (!raycasterComponent || !raycasterComponent.intersections.length) return;

        const intersection = raycasterComponent.intersections.find(i => i.object.el === this.el);

        if (intersection) {
            this.isDragging = true;
            this.el.sceneEl.addBehavior(this); // Додаємо компонент до обробки поведінки сцени

            // Визначаємо площину, по якій будемо перетягувати (наприклад, площина XY або площина, в якій лежить полігон)
            // Для спрощення припустимо, що всі вершини лежать на Y=0
            this.plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), this.el.object3D.position); // Площина XY

            this.raycaster.setFromCamera(raycasterComponent.mouse, raycasterComponent.camera);
            this.raycaster.ray.intersectPlane(this.plane, this.intersection);
            this.offset.copy(this.el.object3D.position).sub(this.intersection);

            // Викликаємо подію про початок перетягування
            this.el.emit('dragstart', { target: this.el });
        }
    },

    onMouseUp: function () {
        if (this.isDragging) {
            this.isDragging = false;
            this.el.sceneEl.removeBehavior(this);
            this.el.emit('dragend', { target: this.el });
        }
    },

    onMouseMove: function (evt) {
        if (!this.isDragging) return;
        const raycasterEl = this.el.sceneEl.querySelector('[raycaster]');
        if (!raycasterEl) return;

        const raycasterComponent = raycasterEl.components.raycaster;
        if (!raycasterComponent) return;

        this.raycaster.setFromCamera(raycasterComponent.mouse, raycasterComponent.camera);
        if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
            const newPos = this.intersection.add(this.offset);
            // Обмежуємо рух тільки по площині (наприклад, Y=0)
            this.el.object3D.position.set(newPos.x, this.el.object3D.position.y, newPos.z);

            // Викликаємо подію про рух вершини
            this.el.emit('dragmove', { target: this.el, position: this.el.object3D.position });
        }
    },

    update: function (oldData) {
        // Додаємо властивість 'enabled' для ввімкнення/вимкнення перетягування
        if (this.data.enabled === undefined) {
            this.data.enabled = true; // За замовчуванням увімкнено
        }
    },

    schema: {
        enabled: {type: 'boolean', default: true} // Схема для властивості 'enabled'
    }
});
