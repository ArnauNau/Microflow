
import { DiagramNode, ConnectionList } from './Model.js';


const exportButton = document.getElementById('export') as HTMLButtonElement;
const addButton = document.getElementById('add') as HTMLButtonElement;

const canvas = document.getElementById('diagram') as HTMLCanvasElement;
const context = canvas.getContext('2d')!;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const NODE_RADIUS: number = canvas.height / 30;
const NODE_COLOR: string = 'black';

let nodes: DiagramNode[] = [
    { id: 0, x: 100, y: 100 },
    { id: 1, x: 300, y: 100 },
    { id: 2, x: 200, y: 200 }
];

const connections: ConnectionList = new ConnectionList(
    { source: 0, target: 2 },
    { source: 2, target: 2 }
);


const virtualWidth = 800;
const virtualHeight = 600;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawDiagram();
}

window.addEventListener('resize', resizeCanvas);

function drawArrowToCursor(node: DiagramNode, cursor: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = cursor.clientX - rect.left;
    const mouseY = cursor.clientY - rect.top;

    const offsetX = (canvas.width - virtualWidth) / 2;
    const offsetY = (canvas.height - virtualHeight) / 2;

    const adjustedX = mouseX - offsetX;
    const adjustedY = mouseY - offsetY;

    context.save();
    context.translate(offsetX, offsetY);

    context.beginPath();
    context.moveTo(node.x, node.y);
    context.lineTo(adjustedX, adjustedY);
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.stroke();

    context.restore();
}

function drawDiagram() {

    context.clearRect(0, 0, canvas.width, canvas.height);

    const offsetX = (canvas.width - virtualWidth) / 2;
    const offsetY = (canvas.height - virtualHeight) / 2;

    context.save();
    context.translate(offsetX, offsetY);

+   connections.forEach(conn => {
        const sourceNode = nodes.find(node => node.id === conn.source);
        const targetNode = nodes.find(node => node.id === conn.target);
        if (sourceNode && targetNode) {
            context.beginPath();
            context.moveTo(sourceNode.x, sourceNode.y);
            context.lineTo(targetNode.x, targetNode.y);
            context.strokeStyle = 'black';
            context.lineWidth = 2;
            context.stroke();
        }
    });

    nodes.forEach(node => {
        context.beginPath();
        context.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
        context.fillStyle = NODE_COLOR;
        context.fill();
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.stroke();
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
        const dx = node.x - x;
        const dy = node.y - y;
        if (dx * dx + dy * dy <= NODE_RADIUS * NODE_RADIUS) {
            return node;
        }
    }
    return null;
}

function addNode (x: number, y: number) {
    const id = nodes.length;
    nodes.push({ id, x, y });
    console.log('New node: ', { id, x, y });
    drawDiagram();
}

canvas.addEventListener('mousedown', (e) => {
    console.debug('[MOUSE] mousedown');

    const rect = canvas.getBoundingClientRect();
    const offsetX = (canvas.width - virtualWidth) / 2;
    const offsetY = (canvas.height - virtualHeight) / 2;
    const mouseX = e.clientX - rect.left - offsetX;
    const mouseY = e.clientY - rect.top - offsetY;

    const clickedNode = getNodeAt(mouseX, mouseY);

    if (clickedNode == null) {
        if (mode === Mode.Add) {
            addNode(mouseX, mouseY); 
        } //else { //this makes it so you can place nodes consecutively, instead of having to click the add button each time
            mode = Mode.View;
        //}
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
        const targetNode = getNodeAt(mouseX, mouseY);
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
            const rect = canvas.getBoundingClientRect();
            selectedNode.x = event.clientX - rect.left - (canvas.width - virtualWidth) / 2;
            selectedNode.y = event.clientY - rect.top - (canvas.height - virtualHeight) / 2;
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
}

exportButton.addEventListener('click', exportDiagram);

resizeCanvas();
