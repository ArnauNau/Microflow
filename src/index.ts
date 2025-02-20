
import { DiagramNode, ConnectionList } from './Model.js';

const exportButton = document.getElementById('export') as HTMLButtonElement;
const addButton = document.getElementById('add') as HTMLButtonElement;

const canvas = document.getElementById('diagram') as HTMLCanvasElement;
const context = canvas.getContext('2d')!;

let SIZE_FACTOR: number = canvas.height / 3;


DiagramNode.setRadius(SIZE_FACTOR);

const ARROW_SIZE: number = SIZE_FACTOR / 3;

let nodes: DiagramNode[] = [
    new DiagramNode(0, 600, 100),
    new DiagramNode(1, 100, 100),
    new DiagramNode(2, 350, 350),
    new DiagramNode(3, 700, 700),
];

const connections: ConnectionList = new ConnectionList(
    { source: 0, target: 2 },
    { source: 2, target: 1 }
);

function scaleCanvas(ctx: CanvasRenderingContext2D) {
    const rect = canvas.getBoundingClientRect();
    const dpr: number = window.devicePixelRatio || 1;

    const realWidth = window.innerWidth;
    const realHeight = rect.height;

    canvas.width = realWidth * dpr;
    canvas.height = realHeight * dpr;
    canvas.style.width = realWidth + "px";
    canvas.style.height = realHeight + "px";
    
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
}

function getMouseMappedCoordinates(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left),
        y: (event.clientY - rect.top)
    };
}

function resizeCanvas() {
    console.debug('[WINDOW] resize');
    scaleCanvas(context);
    drawDiagram(context, nodes, connections);
}

window.addEventListener('resize', resizeCanvas);

function drawArrowHead(x: number, y: number, angle: number) {
    context.save();
    context.translate(x, y);
    context.rotate(angle);

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

function drawArrowToPoint(node: DiagramNode, targetX: number, targetY: number) {    
    const arrowAngle = Math.atan2(targetY - node.y, targetX - node.x);

    context.beginPath();
    context.moveTo(node.x, node.y);
    context.lineTo(targetX, targetY);
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.stroke();

    drawArrowHead(targetX, targetY, arrowAngle);
}

function drawArrowToCursor(node: DiagramNode, cursor: MouseEvent) {
    const mouseCoords = getMouseMappedCoordinates(cursor);

    context.save();

    drawArrowToPoint(node, mouseCoords.x, mouseCoords.y);

    context.restore();
}

function drawDiagram() {

    context.clearRect(0, 0, canvas.width, canvas.height)

    context.save();

    connections.forEach(conn => {
        const sourceNode = nodes.find(node => node.id === conn.source);
        const targetNode = nodes.find(node => node.id === conn.target);
        if (sourceNode && targetNode) {
            const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x);

            const adjustedTargetX = targetNode.x - (Math.cos(angle) * DiagramNode.RADIUS);
            const adjustedTargetY = targetNode.y - (Math.sin(angle) * DiagramNode.RADIUS);

            context.beginPath();
            context.moveTo(sourceNode.x, sourceNode.y);
            context.lineTo(adjustedTargetX, adjustedTargetY);
            context.strokeStyle = 'black';
            context.lineWidth = 2;
            context.stroke();

            drawArrowHead(adjustedTargetX, adjustedTargetY, angle);
        }
    });

    nodes.forEach(node => {
        node.draw(context);
    });

    context.restore();
}
drawDiagram();


enum Mode {
    View,
    Connection,
    Dragging,
    Add
}

let mode: Mode = Mode.View;
let selectedNode: DiagramNode | null = null;


function getNodeAt(x: number, y: number): DiagramNode | null {
    for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        if (node.isCursorOver(x, y)) {
            return node;
        }
    }
    return null;
}

function addNode (x: number, y: number) {
    const id = nodes.length;
    nodes.push( new DiagramNode(id, x, y) );
    console.log('New node: ', { id, x, y });
}

canvas.addEventListener('mousedown', (e) => {
    console.debug('[MOUSE] mousedown');

    const mouseCoords = getMouseMappedCoordinates(e);

    const clickedNode = getNodeAt(mouseCoords.x, mouseCoords.y);

    if (clickedNode == null) {
        if (mode === Mode.Add) {
            addNode(mouseCoords.x, mouseCoords.y);
        }
        //this makes it so you can place nodes consecutively, if pressing alt
        if (!e.altKey) {
            mode = Mode.View;
        }

        drawDiagram();
        selectedNode = null;        
        return;
    }

    if (e.altKey) {
        mode = Mode.Dragging;
        selectedNode = clickedNode;
        return;
    }

    if (mode === Mode.Connection) {
        mode = Mode.View;

        const sourceNode = selectedNode;
        const targetNode = getNodeAt(mouseCoords.x, mouseCoords.y);
        if (sourceNode && targetNode && sourceNode !== targetNode) {
            connections.pushUnique({ source: sourceNode.id, target: targetNode.id });
        }
        
        selectedNode = null;
        drawDiagram();
    } else {
        mode = Mode.Connection;
        selectedNode = clickedNode;
    }
});

canvas.addEventListener('mousemove', (event) => {
    console.debug('[MOUSE] mousemove');

    if (selectedNode) {
        if (mode === Mode.Dragging) {
            const mouseCoords = getMouseMappedCoordinates(event);
            selectedNode.x = mouseCoords.x;
            selectedNode.y = mouseCoords.y;
            drawDiagram();
        }

        if (mode === Mode.Connection) {
            drawDiagram();    
            drawArrowToCursor(selectedNode, event);
        }
    }
});

canvas.addEventListener('mouseup', () => {
    console.debug('[MOUSE] mouseup');

    if (mode === Mode.Dragging) {
        selectedNode = null;
        mode = Mode.View;
    }
});

canvas.addEventListener('mouseleave', () => {
    console.debug('[MOUSE] mouseleave');
    selectedNode = null;
    mode = Mode.View;
    drawDiagram();
});


addButton.addEventListener('click', () => {
    console.debug('[MOUSE] click');
    mode = Mode.Add;
}); 


function exportDiagram() {
    const data = {
        nodes,
        connections
    };
    console.log("\n" + JSON.stringify(data, null, 2) + "\n");


    console.log(JSON.stringify(data, null, 2));

    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
    });


    const url = URL.createObjectURL(jsonBlob);

    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'diagram.json');


    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);

}

exportButton.addEventListener('click', exportDiagram);

resizeCanvas();
