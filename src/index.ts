
import { DiagramNode, ConnectionList } from './Model.js';


const exportButton = document.getElementById('export') as HTMLButtonElement;
const canvas = document.getElementById('diagram') as HTMLCanvasElement;
const context = canvas.getContext('2d')!;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


const nodes: DiagramNode[] = [
    { id: 'A', x: 100, y: 100, radius: 30, color: 'blue' },
    { id: 'B', x: 300, y: 100, radius: 30, color: 'green' },
    { id: 'C', x: 200, y: 200, radius: 30, color: 'red' }
];

const connections: ConnectionList = new ConnectionList(
    { source: 'A', target: 'B' },
    { source: 'C', target: 'B' }
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


let selectedNode: DiagramNode | null = null;
let connectionMode: boolean = false;
let draggingMode: boolean = false;

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
        selectedNode = null;
        connectionMode = false;
        return;
    }

    if (e.altKey) {
        draggingMode = true;
        selectedNode = clickedNode;
        return;
    }

    if (connectionMode) {
        const sourceNode = selectedNode;
        const targetNode = getNodeAt(mouseX, mouseY);;
        if (sourceNode && targetNode && sourceNode !== targetNode) {
            connections.pushUnique({ source: sourceNode.id, target: targetNode.id });
            drawDiagram();
        }
        connectionMode = false;
        selectedNode = null;
    } else {
        connectionMode = true;
        selectedNode = clickedNode;
    }
    
});

canvas.addEventListener('mousemove', (e) => {
    if (draggingMode && selectedNode) {
        const rect = canvas.getBoundingClientRect();
        selectedNode.x = e.clientX - rect.left;
        selectedNode.y = e.clientY - rect.top;
        drawDiagram();
    }
});

canvas.addEventListener('mouseup', () => {
    if (draggingMode) {
        selectedNode = null;
        draggingMode = false;
    }
});

canvas.addEventListener('mouseleave', () => {
    selectedNode = null;
});


function exportDiagram() {
    const data = {
        nodes,
        connections
    };
    console.log(JSON.stringify(data, null, 2));
}

exportButton.addEventListener('click', exportDiagram);