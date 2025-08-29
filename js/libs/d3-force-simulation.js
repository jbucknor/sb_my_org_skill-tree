/**
 * Minimal D3-like Force Simulation Implementation
 * This provides the D3 force simulation API without requiring the full D3 library
 */

// Simple Vector2D class for calculations
class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    normalize() {
        const len = this.length();
        if (len > 0) {
            this.x /= len;
            this.y /= len;
        }
        return this;
    }
}

// Force simulation implementation
class ForceSimulation {
    constructor(nodes = []) {
        this.nodes = nodes;
        this.forces = new Map();
        this.alpha = 1;
        this.alphaMin = 0.001;
        this.alphaDecay = 1 - Math.pow(this.alphaMin, 1 / 300);
        this.velocityDecay = 0.4;
        this.tickHandlers = [];
        this.endHandlers = [];
        this.timer = null;
        
        // Initialize node properties
        this.initializeNodes();
    }
    
    initializeNodes() {
        this.nodes.forEach(node => {
            if (node.vx === undefined) node.vx = 0;
            if (node.vy === undefined) node.vy = 0;
            if (node.fx === undefined) node.fx = null;
            if (node.fy === undefined) node.fy = null;
        });
    }
    
    force(name, force = null) {
        if (force === null) {
            return this.forces.get(name);
        }
        this.forces.set(name, force);
        return this;
    }
    
    on(type, handler) {
        if (type === 'tick') {
            this.tickHandlers.push(handler);
        } else if (type === 'end') {
            this.endHandlers.push(handler);
        }
        return this;
    }
    
    restart() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            this.tick();
        }, 16); // ~60 FPS
        
        return this;
    }
    
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        return this;
    }
    
    tick() {
        // Apply forces
        this.forces.forEach((force, name) => {
            if (typeof force === 'function') {
                force(this.alpha);
            } else if (force && force.apply) {
                const applyFunc = force.apply(this.alpha);
                if (typeof applyFunc === 'function') {
                    applyFunc(this.nodes);
                }
            }
        });
        
        // Update node positions
        this.nodes.forEach(node => {
            // Apply velocity decay
            node.vx *= this.velocityDecay;
            node.vy *= this.velocityDecay;
            
            // Update position if not fixed
            if (node.fx === null) node.x += node.vx;
            if (node.fy === null) node.y += node.vy;
            
            // Apply fixed positions
            if (node.fx !== null) {
                node.x = node.fx;
                node.vx = 0;
            }
            if (node.fy !== null) {
                node.y = node.fy;
                node.vy = 0;
            }
        });
        
        // Update alpha
        this.alpha *= (1 - this.alphaDecay);
        
        // Call tick handlers
        this.tickHandlers.forEach(handler => handler());
        
        // Check if simulation should end
        if (this.alpha < this.alphaMin) {
            this.stop();
            this.endHandlers.forEach(handler => handler());
        }
        
        return this;
    }
    
    alphaDecay(decay) {
        if (decay === undefined) return this.alphaDecay;
        this.alphaDecay = decay;
        return this;
    }
    
    velocityDecay(decay) {
        if (decay === undefined) return this.velocityDecay;
        this.velocityDecay = decay;
        return this;
    }
}

// Force implementations
class ManyBodyForce {
    constructor() {
        this.strength = -30;
        this.distanceMax = Infinity;
        this.distanceMin = 1;
    }
    
    strength(s) {
        if (s === undefined) return this.strength;
        this.strength = s;
        return this;
    }
    
    distanceMax(d) {
        if (d === undefined) return this.distanceMax;
        this.distanceMax = d;
        return this;
    }
    
    apply(alpha) {
        return (nodes) => {
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const nodeA = nodes[i];
                    const nodeB = nodes[j];
                    
                    const dx = nodeB.x - nodeA.x;
                    const dy = nodeB.y - nodeA.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 0 && distance < this.distanceMax) {
                        const force = this.strength * alpha / Math.max(distance, this.distanceMin);
                        const fx = (dx / distance) * force;
                        const fy = (dy / distance) * force;
                        
                        nodeA.vx -= fx;
                        nodeA.vy -= fy;
                        nodeB.vx += fx;
                        nodeB.vy += fy;
                    }
                }
            }
        };
    }
}

class LinkForce {
    constructor(links = []) {
        this.links = links;
        this.distance = 30;
        this.strength = 1;
        this.idFunc = d => d.id;
        this.nodeById = new Map();
    }
    
    id(func) {
        if (func === undefined) return this.idFunc;
        this.idFunc = func;
        return this;
    }
    
    distance(d) {
        if (d === undefined) return this.distance;
        this.distance = d;
        return this;
    }
    
    strength(s) {
        if (s === undefined) return this.strength;
        this.strength = s;
        return this;
    }
    
    initialize(nodes) {
        this.nodeById.clear();
        nodes.forEach(node => {
            this.nodeById.set(this.idFunc(node), node);
        });
        
        // Convert string IDs to node references
        this.links.forEach(link => {
            if (typeof link.source === 'string') {
                link.source = this.nodeById.get(link.source);
            }
            if (typeof link.target === 'string') {
                link.target = this.nodeById.get(link.target);
            }
        });
    }
    
    apply(alpha) {
        return () => {
            this.links.forEach(link => {
                const source = link.source;
                const target = link.target;
                
                if (!source || !target) return;
                
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    const force = (distance - this.distance) * this.strength * alpha;
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;
                    
                    source.vx += fx;
                    source.vy += fy;
                    target.vx -= fx;
                    target.vy -= fy;
                }
            });
        };
    }
}

class CenterForce {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.strength = 0.1;
    }
    
    x(x) {
        if (x === undefined) return this.x;
        this.x = x;
        return this;
    }
    
    y(y) {
        if (y === undefined) return this.y;
        this.y = y;
        return this;
    }
    
    strength(s) {
        if (s === undefined) return this.strength;
        this.strength = s;
        return this;
    }
    
    apply(alpha) {
        return (nodes) => {
            let totalX = 0, totalY = 0;
            nodes.forEach(node => {
                totalX += node.x;
                totalY += node.y;
            });
            
            const centerX = totalX / nodes.length;
            const centerY = totalY / nodes.length;
            
            const offsetX = this.x - centerX;
            const offsetY = this.y - centerY;
            
            nodes.forEach(node => {
                node.vx += offsetX * this.strength * alpha;
                node.vy += offsetY * this.strength * alpha;
            });
        };
    }
}

class CollideForce {
    constructor() {
        this.radius = 1;
        this.strength = 0.7;
    }
    
    radius(r) {
        if (r === undefined) return this.radius;
        this.radius = r;
        return this;
    }
    
    strength(s) {
        if (s === undefined) return this.strength;
        this.strength = s;
        return this;
    }
    
    apply(alpha) {
        return (nodes) => {
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const nodeA = nodes[i];
                    const nodeB = nodes[j];
                    
                    const dx = nodeB.x - nodeA.x;
                    const dy = nodeB.y - nodeA.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = this.radius * 2;
                    
                    if (distance < minDistance && distance > 0) {
                        const force = (minDistance - distance) * this.strength * alpha;
                        const fx = (dx / distance) * force * 0.5;
                        const fy = (dy / distance) * force * 0.5;
                        
                        nodeA.vx -= fx;
                        nodeA.vy -= fy;
                        nodeB.vx += fx;
                        nodeB.vy += fy;
                    }
                }
            }
        };
    }
}

// Create d3-like API
const d3 = {
    forceSimulation: (nodes) => new ForceSimulation(nodes),
    forceManyBody: () => new ManyBodyForce(),
    forceLink: (links) => new LinkForce(links),
    forceCenter: (x, y) => new CenterForce(x, y),
    forceCollide: () => new CollideForce()
};

// Make d3 available globally
window.d3 = d3;

console.log('D3 Force Simulation library loaded successfully');