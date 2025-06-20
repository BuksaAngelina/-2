// math-utils.js

/**
 * Розраховує відстань між двома 3D точками.
 * @param {THREE.Vector3} p1
 * @param {THREE.Vector3} p2
 * @returns {number} Відстань.
 */
export function calculateDistance(p1, p2) {
    return p1.distanceTo(p2);
}

/**
 * Розраховує кут в градусах між двома векторами, що виходять з однієї точки.
 * @param {THREE.Vector3} v1 Вектор 1.
 * @param {THREE.Vector3} v2 Вектор 2.
 * @returns {number} Кут в градусах.
 */
export function calculateAngleBetweenVectors(v1, v2) {
    return v1.angleTo(v2) * (180 / Math.PI);
}

/**
 * Розраховує площу багатокутника за формулою Гауса (Shoelace formula).
 * Припускається, що вершини лежать в одній площині (наприклад, XY).
 * @param {Array<THREE.Vector3>} vertices Масив вершин у порядку обходу (за годинниковою або проти годинникової стрілки).
 * @returns {number} Площа багатокутника.
 */
export function calculatePolygonArea(vertices) {
    if (vertices.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < vertices.length; i++) {
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % vertices.length];
        area += (p1.x * p2.y - p2.x * p1.y); // Припускаємо площину XY
    }
    return Math.abs(area / 2);
}

/**
 * Отримує середину відрізка між двома точками.
 * @param {THREE.Vector3} p1
 * @param {THREE.Vector3} p2
 * @returns {THREE.Vector3} Середина відрізка.
 */
export function getMidpoint(p1, p2) {
    return new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
}

/**
 * Отримує нормаль до площини багатокутника (якщо він плоский).
 * Це потрібно для позиціонування тексту кутів.
 * @param {Array<THREE.Vector3>} vertices
 * @returns {THREE.Vector3} Нормаль.
 */
export function getPolygonNormal(vertices) {
    if (vertices.length < 3) return new THREE.Vector3(0, 1, 0); // Повертаємо Y-вісь як дефолт
    const v0 = vertices[0];
    const v1 = vertices[1];
    const v2 = vertices[2];

    const vec1 = new THREE.Vector3().subVectors(v1, v0);
    const vec2 = new THREE.Vector3().subVectors(v2, v0);

    const normal = new THREE.Vector3().crossVectors(vec1, vec2).normalize();
    return normal;
}
