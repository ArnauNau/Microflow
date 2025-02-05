
import { DiagramNode, ConnectionList } from './Model.js';


const exportButton = document.getElementById('export') as HTMLButtonElement;
const addButton = document.getElementById('add') as HTMLButtonElement;

const canvas = document.getElementById('diagram') as HTMLCanvasElement;
const context = canvas.getContext('2d')!;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


let nodes: DiagramNode[] = [
    { id: 0, x: 100, y: 100, radius: 30, color: 'blue' },
    { id: 1, x: 300, y: 100, radius: 30, color: 'green' },
    { id: 2, x: 200, y: 200, radius: 30, color: 'red' }
];

const connections: ConnectionList = new ConnectionList(
    { source: 0, target: 2 },
    { source: 2, target: 2 }
);


function drawDiagram() {

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    connections.forEach(conn => {
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

    // Draw nodes
    nodes.forEach(node => {
        context.beginPath();
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        context.fillStyle = node.color;
        context.fill();
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.stroke();
    });
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
        if (dx * dx + dy * dy <= node.radius * node.radius) {
            return node;
        }
    }
    return null;
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const clickedNode = getNodeAt(mouseX, mouseY);

    if (clickedNode == null) {
        if (mode === Mode.Add) {
            nodes.push({
                id: nodes.length,
                x: mouseX,
                y: mouseY,
            });
        }
        selectedNode = null;
        mode = Mode.View;
        drawDiagram();
        return;
    }

    if (e.altKey) {
        mode = Mode.Dragging;
        selectedNode = clickedNode;
        return;
    }

    if (mode === Mode.Connection) {
        const sourceNode = selectedNode;
        const targetNode = getNodeAt(mouseX, mouseY);;
        if (sourceNode && targetNode && sourceNode !== targetNode) {
            connections.pushUnique({ source: sourceNode.id, target: targetNode.id });
            drawDiagram();
        }
        mode = Mode.View;
        selectedNode = null;
    } else {
        mode = Mode.Connection;
        selectedNode = clickedNode;
    }
});

canvas.addEventListener('mousemove', (e) => {
    
    if (selectedNode) {
        if (mode === Mode.Dragging) {
            const rect = canvas.getBoundingClientRect();
            selectedNode.x = e.clientX - rect.left;
            selectedNode.y = e.clientY - rect.top;
            drawDiagram();
        }

        if (mode === Mode.Connection) {
            drawDiagram();
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            context.beginPath();
            context.moveTo(selectedNode.x, selectedNode.y);
            context.lineTo(mouseX, mouseY);
            context.strokeStyle = 'black';
            context.lineWidth = 2;
            context.stroke();
        }
    }
});

canvas.addEventListener('mouseup', () => {
    if (mode === Mode.Dragging) {
        selectedNode = null;
        mode = Mode.View;
    }
});

canvas.addEventListener('mouseleave', () => {
    selectedNode = null;
});


addButton.addEventListener('click', () => {
    mode = Mode.Add;
}); 


function exportDiagram() {
    const data = {
        nodes,
        connections
    };
    console.log(JSON.stringify(data, null, 2));
}

exportButton.addEventListener('click', exportDiagram);