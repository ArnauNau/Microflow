
import { DiagramElement, DiagramPeripheral, DiagramNode, ConnectionList } from './Model.js';
import { initDrawing, drawArrowToCursor, drawDiagram } from './Diagram.js';

const exportButton = document.getElementById('export') as HTMLButtonElement;
const addButton = document.getElementById('add') as HTMLButtonElement;

const canvas = document.getElementById('diagram') as HTMLCanvasElement;
const context = canvas.getContext('2d')!;

let SIZE_FACTOR: number = canvas.height / 3;

initDrawing(SIZE_FACTOR);

let diagramElements: DiagramElement[] = [
    new DiagramNode(0, 600, 100),
    new DiagramNode(1, 100, 100),
    new DiagramNode(2, 350, 350),
    new DiagramNode(3, 700, 700),
    new DiagramPeripheral(4, 100, 500),
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
    drawDiagram(context, diagramElements, connections);
}

window.addEventListener('resize', resizeCanvas);

drawDiagram(context, diagramElements, connections);


enum Mode {
    View,
    Connection,
    Dragging,
    Add
}

let mode: Mode = Mode.View;
let selectedNode: DiagramNode | null = null;


function getNodeAt(x: number, y: number): DiagramElement | null {
    for (let i = diagramElements.length - 1; i >= 0; i--) {
        const element = diagramElements[i];
        if (element.isCursorOver(x, y)) {
            return element;
        }
    }
    return null;
}

function addNode (x: number, y: number) {
    const id = diagramElements.length;
    diagramElements.push( new DiagramNode(id, x, y) );
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

        drawDiagram(context, diagramElements, connections);
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
        drawDiagram(context, diagramElements, connections);
    } else {
        mode = Mode.Connection;
        selectedNode = clickedNode;
    }
});

canvas.addEventListener('mousemove', (event) => {
    console.debug('[MOUSE] mousemove');

    {
        drawDiagram(context, diagramElements, connections);
        //draw a red node where the cursor is
        const mouseCoords = getMouseMappedCoordinates(event);
        context.beginPath();
        context.arc(mouseCoords.x, mouseCoords.y, DiagramNode.RADIUS / 3, 0, Math.PI * 2);
        context.fillStyle = 'red';
        context.fill();
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.stroke();
    }


    if (selectedNode) {
        if (mode === Mode.Dragging) {
            const mouseCoords = getMouseMappedCoordinates(event);
            selectedNode.x = mouseCoords.x;
            selectedNode.y = mouseCoords.y;
            drawDiagram(context, diagramElements, connections);
        }

        if (mode === Mode.Connection) {
            drawDiagram(context, diagramElements, connections);    
            drawArrowToCursor(context, selectedNode, getMouseMappedCoordinates(event));
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
    drawDiagram(context, diagramElements, connections);
});


addButton.addEventListener('click', () => {
    console.debug('[MOUSE] click');
    mode = Mode.Add;
}); 


function exportDiagram() {
    const data = {
        diagramElements,
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
