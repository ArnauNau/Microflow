import { DiagramNode, ConnectionList } from './Model.js';

describe('DiagramNode', () => {
    it('initialize with correct properties', () => {
        const node = new DiagramNode(1, 50, 50);
        expect(node.id).toBe(1);
        expect(node.x).toBe(50);
        expect(node.y).toBe(50);
    });

    it('detect when cursor is over the node', () => {
        const node = new DiagramNode(1, 100, 100);
        DiagramNode.setRadius(30);
        expect(node.isCursorOver(100, 100)).toBe(true);
        expect(node.isCursorOver(130, 130)).toBe(false);
    });
});

describe('ConnectionList', () => {
    it('add unique connections', () => {
        const connections = new ConnectionList();
        connections.pushUnique({ source: 1, target: 2 });
        connections.pushUnique({ source: 1, target: 2 }); // Duplicate

        expect(connections.length).toBe(1);
    });

    it('allow multiple unique connections', () => {
        const connections = new ConnectionList();
        connections.pushUnique({ source: 1, target: 2 });
        connections.pushUnique({ source: 2, target: 3 });
        connections.pushUnique({ source: 2, target: 1 });

        expect(connections.length).toBe(3);
    });
});