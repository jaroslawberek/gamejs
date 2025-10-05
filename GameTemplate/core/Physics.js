export class Physics {
    // AABB vs AABB
    static rectRect(a, b) {
        const A = a.getHitbox ? a.getHitbox() : a;
        const B = b.getHitbox ? b.getHitbox() : b;
        return (
            A.x < B.right &&
            A.right > B.x &&
            A.y < B.bottom &&
            A.bottom > B.y
        );

    }

    // Circle vs Circle
    static circleCircle(a, b) {
        const dx = (a.center.x) - (b.center.x);
        const dy = (a.center.y) - (b.center.y);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (a.radius + b.radius);
    }

    // Rect vs Circle
    static rectCircle(rect, circle) {
        // znajdź najbliższy punkt prostokąta do środka koła
        const closestX = Math.max(rect.x, Math.min(circle.center.x, rect.right));
        const closestY = Math.max(rect.y, Math.min(circle.center.y, rect.bottom));

        const dx = circle.center.x - closestX;
        const dy = circle.center.y - closestY;
        return (dx * dx + dy * dy) < (circle.radius * circle.radius);
    }

    // Point vs Rect
    static pointRect(px, py, rect) {
        return (
            px >= rect.x &&
            px <= rect.right &&
            py >= rect.y &&
            py <= rect.bottom
        );
    }

    // Point vs Circle
    static pointCircle(px, py, circle) {
        const dx = px - circle.center.x;
        const dy = py - circle.center.y;
        return (dx * dx + dy * dy) < (circle.radius * circle.radius);
    }
}
