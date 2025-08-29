/**
 * Minimal D3 Hierarchy Implementation
 * Based on D3.js hierarchy module for force-directed trees
 * This ensures GitHub Pages compatibility without external dependencies
 */

// Hierarchy Node implementation
function HierarchyNode(data, parent = null) {
    this.data = data;
    this.parent = parent;
    this.children = null;
    this.depth = parent ? parent.depth + 1 : 0;
    this.height = 0; // Will be calculated
}

HierarchyNode.prototype.descendants = function() {
    const nodes = [this];
    const children = this.children;
    if (children) {
        for (let i = 0, n = children.length; i < n; ++i) {
            nodes.push(...children[i].descendants());
        }
    }
    return nodes;
};

HierarchyNode.prototype.ancestors = function() {
    const nodes = [this];
    let node = this;
    while (node = node.parent) {
        nodes.push(node);
    }
    return nodes;
};

HierarchyNode.prototype.leaves = function() {
    const leaves = [];
    this.descendants().forEach(node => {
        if (!node.children || node.children.length === 0) {
            leaves.push(node);
        }
    });
    return leaves;
};

HierarchyNode.prototype.links = function() {
    const root = this;
    const links = [];
    root.descendants().forEach(node => {
        if (node.parent) {
            links.push({ source: node.parent, target: node });
        }
    });
    return links;
};

HierarchyNode.prototype.sum = function(value) {
    return this.eachAfter(node => {
        let sum = +value(node.data) || 0;
        const children = node.children;
        if (children) {
            for (let i = children.length - 1; i >= 0; --i) {
                sum += children[i].value;
            }
        }
        node.value = sum;
    });
};

HierarchyNode.prototype.sort = function(compare) {
    return this.eachBefore(node => {
        if (node.children) {
            node.children.sort(compare);
        }
    });
};

HierarchyNode.prototype.each = function(callback) {
    const stack = [this];
    let node;
    while (node = stack.pop()) {
        callback(node);
        const children = node.children;
        if (children) {
            for (let i = children.length - 1; i >= 0; --i) {
                stack.push(children[i]);
            }
        }
    }
    return this;
};

HierarchyNode.prototype.eachBefore = function(callback) {
    const stack = [this];
    let node;
    while (node = stack.pop()) {
        callback(node);
        const children = node.children;
        if (children) {
            for (let i = children.length - 1; i >= 0; --i) {
                stack.push(children[i]);
            }
        }
    }
    return this;
};

HierarchyNode.prototype.eachAfter = function(callback) {
    const stack = [];
    const nodes = [this];
    let node;
    
    // Collect all nodes
    while (node = nodes.pop()) {
        stack.push(node);
        const children = node.children;
        if (children) {
            for (let i = 0, n = children.length; i < n; ++i) {
                nodes.push(children[i]);
            }
        }
    }
    
    // Process in reverse order (post-order)
    while (node = stack.pop()) {
        callback(node);
    }
    
    return this;
};

// Main hierarchy function
function hierarchy(data, children) {
    if (!children) {
        children = defaultChildren;
    }
    
    function createHierarchy(data, parent) {
        const node = new HierarchyNode(data, parent);
        const childs = children(data);
        if (childs && childs.length > 0) {
            node.children = childs.map(child => createHierarchy(child, node));
        }
        return node;
    }
    
    const root = createHierarchy(data);
    
    // Calculate height
    root.eachBefore(node => {
        let height = 0;
        if (node.children) {
            for (let i = 0, n = node.children.length; i < n; ++i) {
                height = Math.max(height, node.children[i].height + 1);
            }
        }
        node.height = height;
    });
    
    return root;
}

function defaultChildren(d) {
    return d.children;
}

// Force simulation classes - minimal implementation for GitHub Pages
class SimpleForceSimulation {
    constructor(nodes = []) {
        this.nodes = nodes;
        this.forces = new Map();
        this._alpha = 1;
        this.alphaMin = 0.001;
        this._alphaDecay = 1 - Math.pow(this.alphaMin, 1 / 300);
        this._velocityDecay = 0.4;
        this.tickHandlers = [];
        this.endHandlers = [];
        this.timer = null;
        
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
        if (this.timer) clearInterval(this.timer);
        
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
                force(this._alpha);
            } else if (force && force.apply) {
                const applyFunc = force.apply(this._alpha);
                if (typeof applyFunc === 'function') {
                    applyFunc(this.nodes);
                }
            }
        });
        
        // Update positions
        this.nodes.forEach(node => {
            node.vx *= this._velocityDecay;
            node.vy *= this._velocityDecay;
            
            if (node.fx === null) node.x += node.vx;
            if (node.fy === null) node.y += node.vy;
            
            if (node.fx !== null) {
                node.x = node.fx;
                node.vx = 0;
            }
            if (node.fy !== null) {
                node.y = node.fy;
                node.vy = 0;
            }
        });
        
        this._alpha *= (1 - this._alphaDecay);
        this.tickHandlers.forEach(handler => handler());
        
        if (this._alpha < this.alphaMin) {
            this.stop();
            this.endHandlers.forEach(handler => handler());
        }
        
        return this;
    }
    
    alphaDecay(decay) {
        if (decay === undefined) return this._alphaDecay;
        this._alphaDecay = decay;
        return this;
    }
    
    velocityDecay(decay) {
        if (decay === undefined) return this._velocityDecay;
        this._velocityDecay = decay;
        return this;
    }
    
    alpha(a) {
        if (a === undefined) return this._alpha;
        this._alpha = a;
        return this;
    }
}

// Simple force implementations
class SimpleManyBodyForce {
    constructor() {
        this._strength = -30;
        this._distanceMax = Infinity;
        this._distanceMin = 1;
    }
    
    strength(s) {
        if (s === undefined) return this._strength;
        this._strength = s;
        return this;
    }
    
    distanceMax(d) {
        if (d === undefined) return this._distanceMax;
        this._distanceMax = d;
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
                    
                    if (distance > 0 && distance < this._distanceMax) {
                        const force = this._strength * alpha / Math.max(distance, this._distanceMin);
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

class SimpleLinkForce {
    constructor(links = []) {
        this.links = links;
        this._distance = 30;
        this._strength = 1;
        this.idFunc = d => d.id;
        this.nodeById = new Map();
    }
    
    id(func) {
        if (func === undefined) return this.idFunc;
        this.idFunc = func;
        return this;
    }
    
    distance(d) {
        if (d === undefined) return this._distance;
        this._distance = d;
        return this;
    }
    
    strength(s) {
        if (s === undefined) return this._strength;
        this._strength = s;
        return this;
    }
    
    initialize(nodes) {
        this.nodeById.clear();
        nodes.forEach(node => {
            this.nodeById.set(this.idFunc(node), node);
        });
        
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
                    const force = (distance - this._distance) * this._strength * alpha;
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

class SimpleCenterForce {
    constructor(x = 0, y = 0) {
        this._x = x;
        this._y = y;
        this._strength = 0.1;
    }
    
    x(x) {
        if (x === undefined) return this._x;
        this._x = x;
        return this;
    }
    
    y(y) {
        if (y === undefined) return this._y;
        this._y = y;
        return this;
    }
    
    strength(s) {
        if (s === undefined) return this._strength;
        this._strength = s;
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
            
            const offsetX = this._x - centerX;
            const offsetY = this._y - centerY;
            
            nodes.forEach(node => {
                node.vx += offsetX * this._strength * alpha;
                node.vy += offsetY * this._strength * alpha;
            });
        };
    }
}

class SimpleCollideForce {
    constructor() {
        this._radius = 1;
        this._strength = 0.7;
    }
    
    radius(r) {
        if (r === undefined) return this._radius;
        this._radius = r;
        return this;
    }
    
    strength(s) {
        if (s === undefined) return this._strength;
        this._strength = s;
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
                    const minDistance = this._radius * 2;
                    
                    if (distance < minDistance && distance > 0) {
                        const force = (minDistance - distance) * this._strength * alpha;
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

// Export D3-like API
if (typeof window !== 'undefined') {
    // Browser environment
    window.d3 = {
        hierarchy: hierarchy,
        forceSimulation: (nodes) => new SimpleForceSimulation(nodes),
        forceManyBody: () => new SimpleManyBodyForce(),
        forceLink: (links) => new SimpleLinkForce(links),
        forceCenter: (x, y) => new SimpleCenterForce(x, y),
        forceCollide: () => new SimpleCollideForce()
    };
    
    console.log('D3 Hierarchy and Force Simulation loaded successfully');
}