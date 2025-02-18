/**
 * Represents a diagram element that can be drawn on the canvas.
 */
export interface DiagramElement {
    /**
     * Unique identifier of the element.
     */
    id: number;
    /**
     * X-coordinate of the element
     */
    x: number;
    /**
     * Y-coordinate of the element
     */
    y: number;

    /**
     * Checks if the cursor is on top of the element
     * @param mouseX X-coordinate of the cursor
     * @param mouseY Y-coordinate of the cursor
     * @returns Whether the cursor is on the element
     */
    isCursorOver(mouseX: number, mouseY: number): boolean;

    /**
     * Draws the element on the canvas
     * @param ctx Canvas rendering context
     */
    draw(ctx: CanvasRenderingContext2D): void;
}

/**
 * Represents a node in the diagram.
 */
export class DiagramNode implements DiagramElement {
    /**
     * Unique identifier of the node
     */
    id: number;
    /**
     * X-coordinate of the node
     */
    x: number;
    /**
     * Y-coordinate of the node
     */
    y: number;
    /**
     * Node radius.
     */
    static RADIUS: number = 30; //TODO: make private, need to work out connection drawing first
    static setRadius(radius: number) {
        DiagramNode.RADIUS = radius;
    }

    constructor(id: number, x: number, y: number) {
        this.id = id;
        this.x = x;
        this.y = y;
    }

    /**
     * Checks if the cursor is on top of the node
     * @param mouseX X-coordinate of the cursor
     * @param mouseY Y-coordinate of the cursor
     * @returns Whether the cursor is on the node
     */
    isCursorOver(mouseX: number, mouseY: number): boolean {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        if (dx * dx + dy * dy <= DiagramNode.RADIUS * DiagramNode.RADIUS) {
            return true;
        }
        return false;
    }

    /**
     * Draws the node on the canvas.
     * @param ctx Canvas rendering context
     */
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
    pushUnique(connection: Connection) {
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