interface Drawable {

    /**
     * Draws the element on the canvas
     * @param ctx Canvas rendering context
     */
    draw(ctx: CanvasRenderingContext2D): void;
}

interface Connectable {
    getBorderPositionAtAngle(angle: number): { x: number, y: number };
}

interface Hoverable {
    
    /**
     * Checks if the cursor is on top of the element
     * @param mouseX X-coordinate of the cursor
     * @param mouseY Y-coordinate of the cursor
     * @returns Whether the cursor is on the element
     */
    isCursorOver(mouseX: number, mouseY: number): boolean;
}

/**
 * Represents a diagram element that can be drawn on the canvas.
 */
export abstract class DiagramElement implements Drawable, Connectable {

    constructor(public id: number, public x: number, public y: number) {}

    abstract draw(ctx: CanvasRenderingContext2D): void;
    abstract getBorderPositionAtAngle(angle: number): { x: number, y: number };
}

/**
 * Represents a node in the diagram.
 */
export class DiagramNode extends DiagramElement implements Hoverable {
    /**
     * Node radius.
     */
    static RADIUS: number; //TODO: make private, need to work out connection drawing first
    static setRadius(radius: number): void {
        DiagramNode.RADIUS = radius;
    }

    isCursorOver(mouseX: number, mouseY: number): boolean {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        if (dx * dx + dy * dy <= DiagramNode.RADIUS * DiagramNode.RADIUS) {
            return true;
        }
        return false;
    }

    getBorderPositionAtAngle(angle: number): { x: number, y: number } {
        return {
            x: this.x - Math.cos(angle) * DiagramNode.RADIUS,
            y: this.y - Math.sin(angle) * DiagramNode.RADIUS
        };
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.arc(this.x, this.y, DiagramNode.RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
};

export class DiagramPeripheral extends DiagramElement implements Hoverable {
    //TODO: using DiagramNode.RADIUS for now, but should be either SIZE_FACTOR or a derivate value (as is done with RADIUS)
    isCursorOver(mouseX: number, mouseY: number): boolean {
        return mouseX >= this.x - (DiagramNode.RADIUS*2) / 2 &&
               mouseX <= this.x + (DiagramNode.RADIUS*2) / 2 &&
               mouseY >= this.y - DiagramNode.RADIUS / 2 &&
               mouseY <= this.y + DiagramNode.RADIUS;
    }

    getBorderPositionAtAngle(angle: number): { x: number, y: number } {
        // it's a rectangle, i need to find the intersection point from a line originating from the center of the element at the given angle with the rectangle border.
        const halfWidth = (DiagramNode.RADIUS*2) / 2;
        const halfHeight = DiagramNode.RADIUS / 2;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);

        // Handle edge cases when dx or dy is 0
        if (dx === 0) {
            return { x: this.x, y: this.y + (dy > 0 ? halfHeight : -halfHeight) };
        }
        if (dy === 0) {
            return { x: this.x + (dx > 0 ? halfWidth : -halfWidth), y: this.y };
        }

        // How far do we need to go in x and y directions?
        const tX = halfWidth / Math.abs(dx);
        const tY = halfHeight / Math.abs(dy);

        // Use the smaller distance: that's where the ray hits the border.
        const t = Math.min(tX, tY);

        return { x: this.x - dx * t, y: this.y - dy * t };
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.rect(this.x - (DiagramNode.RADIUS*2) / 2, this.y - DiagramNode.RADIUS / 2,
                    (DiagramNode.RADIUS*2), DiagramNode.RADIUS);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

/**
 * Stores a unidirectional connection between two nodes.
 */
export type Connection = {
    source: number;
    target: number;
};

/**
 * A list of connections that ensures that no duplicate connections are added.
 * Connections are considered equal if they have the same source and target (implicit directionality) as another connection.
 */
export class ConnectionList extends Array<Connection> {
    /**
     * Add a connection to the list if it is not already present.
     * @param connection The connection to add to the list
     */
    pushUnique(connection: Connection): void {
        if (!this.some(conn => (conn.source === connection.source && conn.target === connection.target))) {
            console.log('New connection: ', connection);
            super.push(connection);
        }
    }
    /**
     * Add multiple connections to the list if they are not already present.
     * @param items The connections to add to the list
     * @returns The new length of the list
     */
    override push(...items: Connection[]): number {
        items.forEach(item => this.pushUnique(item));
        return this.length;
    }
}
