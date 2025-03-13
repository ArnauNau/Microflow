import {DiagramNode, ConnectionList, DiagramElement, Label, renderLabel} from "./Model.js";

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

function drawArrowToPoint(context: CanvasRenderingContext2D, element: DiagramElement, targetCoords: Coordinates): void {
    const arrowAngle: number = Math.atan2(targetCoords.y - element.position.y, targetCoords.x - element.position.x);

    const sourceAngle: number = Math.atan2(
        element.position.y - targetCoords.y,
        element.position.x - targetCoords.x);
    const adjustedSourcePos: Coordinates = element.getBorderPositionAtAngle(sourceAngle);

    context.beginPath();
    context.moveTo(adjustedSourcePos.x, adjustedSourcePos.y);
    context.lineTo(targetCoords.x, targetCoords.y);
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.stroke();

    drawArrowHead(context, targetCoords.x, targetCoords.y, arrowAngle);
}

export function drawArrowToCursor(context: CanvasRenderingContext2D, element: DiagramElement, mouseCoords: Coordinates): void {
    //check if cursor is inside source element area, to avoid drawing the arrow inside the node
    if (!element.isCursorOver(mouseCoords)) {
        context.save();

        drawArrowToPoint(context, element, mouseCoords);

        context.restore();
    }
}

export function drawDiagram(context: CanvasRenderingContext2D, elements: DiagramElement[], connections: ConnectionList): void {

   clearCanvas(context);

    context.save();

    connections.forEach(conn => {
        const sourceElement = elements.find(el => el.id === conn.source);
        const targetElement = elements.find(el => el.id === conn.target);
        if (sourceElement && targetElement) {

            const targetAngle: number = Math.atan2(
                targetElement.position.y - sourceElement.position.y,
                targetElement.position.x - sourceElement.position.x);

            const adjustedTargetPos: Coordinates = targetElement.getBorderPositionAtAngle(targetAngle);

            drawArrowToPoint(context, sourceElement, adjustedTargetPos)
            
            //draw connection label if it exists
            if (conn.label) {
                //calculate midpoint of the connection
                const midX = (sourceElement.position.x + adjustedTargetPos.x) / 2;
                const midY = (sourceElement.position.y + adjustedTargetPos.y) / 2;

                //offset the label slightly perpendicular to the line
                const perpAngle = targetAngle + Math.PI / 2;
                const labelOffset = 15; // Distance from the line
                const labelX = midX + Math.cos(perpAngle) * labelOffset;
                const labelY = midY + Math.sin(perpAngle) * labelOffset;

                // Default style for connection labels
                const defaultConnectionLabel: Label = {
                    text: conn.label.text,
                    style: {
                        fontSize: 12,
                        color: 'black',
                        textAlign: 'center',
                        textBaseline: 'middle',
                        ...conn.label.style
                    }
                };

                renderLabel(context, conn.label.style ? conn.label : defaultConnectionLabel, {x: labelX, y: labelY});
            }
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