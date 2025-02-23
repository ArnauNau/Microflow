import { DiagramNode, ConnectionList, DiagramElement } from "./Model.js";

let SIZE_FACTOR: number;
let ARROW_SIZE: number;
export function initDrawing(sizeFactor: number) {
    SIZE_FACTOR = sizeFactor;
    ARROW_SIZE = SIZE_FACTOR / 3;
    DiagramNode.setRadius(SIZE_FACTOR);
}

function drawArrowHead(context: CanvasRenderingContext2D, x: number, y: number, angle: number) {
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

function drawArrowToPoint(context: CanvasRenderingContext2D, node: DiagramNode, targetX: number, targetY: number) {    
    const arrowAngle = Math.atan2(targetY - node.y, targetX - node.x);

    context.beginPath();
    context.moveTo(node.x, node.y);
    context.lineTo(targetX, targetY);
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.stroke();

    drawArrowHead(context, targetX, targetY, arrowAngle);
}

export function drawArrowToCursor(context: CanvasRenderingContext2D, node: DiagramNode, mouseCoords: { x: number, y: number }) {
    context.save();

    drawArrowToPoint(context, node, mouseCoords.x, mouseCoords.y);

    context.restore();
}

export function drawDiagram(context: CanvasRenderingContext2D, elements: DiagramElement[], connections: ConnectionList) {

    context.clearRect(0, 0, context.canvas.width, context.canvas.height)

    context.save();

    connections.forEach(conn => {
        const sourceElement = elements.find(el => el.id === conn.source);
        const targetElement = elements.find(el => el.id === conn.target);
        if (sourceElement && targetElement) {
            const angle = Math.atan2(targetElement.y - sourceElement.y, targetElement.x - sourceElement.x);
            
            const adjustedTargetPos = targetElement.getBorderPositionAtAngle(angle);

            context.beginPath();
            context.moveTo(sourceElement.x, sourceElement.y);
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
