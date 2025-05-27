import { DiagramNode, ConnectionList, DiagramElement } from "./Model.js";

let SIZE_FACTOR: number;
let ARROW_SIZE: number;
export function initDrawing(sizeFactor: number): void {
    SIZE_FACTOR = sizeFactor;
    ARROW_SIZE = SIZE_FACTOR / 3;
    DiagramNode.setRadius(SIZE_FACTOR);
}

export type Coordinates = {
    x: number,
    y: number
};

function drawArrowHead(context: CanvasRenderingContext2D, x: number, y: number, angle: number): void {
    context.save();
    context.translate(x, y);
    context.rotate(angle);
    //TODO: make arrow head angle tighter, so close connections look better
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(-ARROW_SIZE, -ARROW_SIZE);
    context.moveTo(0, 0);
    context.lineTo(-ARROW_SIZE, ARROW_SIZE);
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.stroke();

    context.restore();
}

function drawArrowToPoint(context: CanvasRenderingContext2D, node: DiagramNode, targetX: number, targetY: number): void {
    const arrowAngle: number = Math.atan2(targetY - node.position.y, targetX - node.position.x);

    context.beginPath();
    context.moveTo(node.position.x, node.position.y);
    context.lineTo(targetX, targetY);
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.stroke();

    drawArrowHead(context, targetX, targetY, arrowAngle);
}

export function drawArrowToCursor(context: CanvasRenderingContext2D, node: DiagramNode, mouseCoords: Coordinates): void {
    context.save();

    drawArrowToPoint(context, node, mouseCoords.x, mouseCoords.y);

    context.restore();
}

export function drawDiagram(context: CanvasRenderingContext2D, elements: DiagramElement[], connections: ConnectionList): void {

   clearCanvas(context);

    context.save();

    connections.forEach(conn => {
        const sourceElement = elements.find(el => el.id === conn.source);
        const targetElement = elements.find(el => el.id === conn.target);
        if (sourceElement && targetElement) {
            const angle: number = Math.atan2(
                targetElement.position.y - sourceElement.position.y,
                targetElement.position.x - sourceElement.position.x);
            
            const adjustedTargetPos: Coordinates = targetElement.getBorderPositionAtAngle(angle);

            context.beginPath();
            context.moveTo(sourceElement.position.x, sourceElement.position.y);
            context.lineTo(adjustedTargetPos.x, adjustedTargetPos.y);
            context.strokeStyle = 'black';
            context.lineWidth = 2;
            context.stroke();

            drawArrowHead(context, adjustedTargetPos.x, adjustedTargetPos.y, angle);
        }
    });

    elements.forEach(el => {
        el.draw(context);
    });

    context.restore();
}

function clearCanvas(context: CanvasRenderingContext2D): void {
    context.save();
    context.resetTransform();
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.restore();
}