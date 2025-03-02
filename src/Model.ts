import {Coordinates} from "./Diagram.ts";

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
     * @param mouseCoords X,Y-coordinate of the cursor
     * @returns Whether the cursor is on the element
     */
    isCursorOver(mouseCoords: Coordinates): boolean;
}

/**
 * Represents a diagram element that can be drawn on the canvas.
 */
export abstract class DiagramElement implements Drawable, Connectable, Hoverable {

    constructor(public id: number, public position: Coordinates) {}

    abstract draw(ctx: CanvasRenderingContext2D): void;
    abstract getBorderPositionAtAngle(angle: number): { x: number, y: number };
    abstract isCursorOver(mouseCoords: Coordinates): boolean;
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

    isCursorOver(mouseCoords: Coordinates): boolean {
        const dx: number = this.position.x - mouseCoords.x;
        const dy: number = this.position.y - mouseCoords.y;
        return ((dx * dx) + (dy * dy)) <= (DiagramNode.RADIUS * DiagramNode.RADIUS);
    }

    getBorderPositionAtAngle(angle: number): { x: number, y: number } {
        return {
            x: this.position.x - Math.cos(angle) * DiagramNode.RADIUS,
            y: this.position.y - Math.sin(angle) * DiagramNode.RADIUS
        };
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, DiagramNode.RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
};

export class DiagramPeripheral extends DiagramElement implements Hoverable {
    //TODO: using DiagramNode.RADIUS for now, but should be either SIZE_FACTOR or a derivative value (as is done with RADIUS)
    isCursorOver(mouseCoords: Coordinates): boolean {
        return mouseCoords.x >= this.position.x - (DiagramNode.RADIUS*2) / 2 &&
               mouseCoords.x <= this.position.x + (DiagramNode.RADIUS*2) / 2 &&
               mouseCoords.y >= this.position.y - DiagramNode.RADIUS / 2 &&
               mouseCoords.y <= this.position.y + DiagramNode.RADIUS;
    }

    getBorderPositionAtAngle(angle: number): Coordinates {
        //rectangle, need to find the intersection point from a line originating from the center of the element at the given angle with the rectangle border.
        const halfWidth: number = (DiagramNode.RADIUS*2) / 2;
        const halfHeight: number = DiagramNode.RADIUS / 2;
        const dx: number = Math.cos(angle);
        const dy: number = Math.sin(angle);

        //edge cases when dx or dy is 0
        if (dx === 0) {
            return { x: this.position.x, y: this.position.y + (dy > 0 ? halfHeight : -halfHeight) };
        }
        if (dy === 0) {
            return { x: this.position.x + (dx > 0 ? halfWidth : -halfWidth), y: this.position.y };
        }

        //how far in x and y directions?
        const tX : number = halfWidth / Math.abs(dx);
        const tY : number = halfHeight / Math.abs(dy);

        //use smaller distance: where the ray hits the border.
        const t : number = Math.min(tX, tY);

        return { x: this.position.x - dx * t, y: this.position.y - dy * t };
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.rect(this.position.x - (DiagramNode.RADIUS*2) / 2, this.position.y - DiagramNode.RADIUS / 2,
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
