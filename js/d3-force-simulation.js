/**
 * Minimal D3 Force Simulation Implementation
 * Includes the essential force simulation methods needed for the skill tree
 * This provides d3.forceManyBody() and d3.forceCollide() functionality
 */

// Create a minimal d3 object if it doesn't exist
if (typeof d3 === 'undefined') {
    window.d3 = {};
}

// Force Simulation Constructor
function ForceSimulation(nodes = []) {
    this.nodes = nodes.map((node, i) => {
        const simNode = {
            ...node,
            index: i,
            x: node.x || 0,
            y: node.y || 0,
            vx: node.vx || 0,
            vy: node.vy || 0
        };
        return simNode;
    });
    
    this.forces = new Map();
    this.alpha = 1.0;
    this.alphaMin = 0.001;
    this._alphaDecay = 1 - Math.pow(this.alphaMin, 1 / 300);
    this.alphaTarget = 0;
    this._velocityDecay = 0.4;
    this.stopped = false;
    this.stepper = null;
    
    this.listeners = {
        tick: [],
        end: []
    };
}

ForceSimulation.prototype.restart = function() {
    this.alpha = 1.0;
    this.stopped = false;
    this.tick();
    return this;
};

ForceSimulation.prototype.stop = function() {
    this.stopped = true;
    if (this.stepper) {
        clearTimeout(this.stepper);
        this.stepper = null;
    }
    return this;
};

ForceSimulation.prototype.tick = function() {
    if (this.stopped) return;
    
    const alpha = this.alpha;
    
    // Apply forces
    this.forces.forEach((force) => {
        if (typeof force === 'function') {
            force(alpha);
        }
    });
    
    // Update positions
    for (let i = 0; i < this.nodes.length; i++) {
        const node = this.nodes[i];
        
        // Skip fixed nodes
        if (node.fx != null) {
            node.x = node.fx;
            node.vx = 0;
        } else {
            node.vx *= this._velocityDecay;
            node.x += node.vx;
        }
        
        if (node.fy != null) {
            node.y = node.fy;
            node.vy = 0;
        } else {
            node.vy *= this._velocityDecay;
            node.y += node.vy;
        }
    }
    
    // Trigger tick event
    this.listeners.tick.forEach(callback => callback());
    
    // Update alpha
    this.alpha += (this.alphaTarget - this.alpha) * this._alphaDecay;
    
    if (this.alpha > this.alphaMin) {
        this.stepper = setTimeout(() => this.tick(), 16); // ~60fps
    } else {
        this.stop();
        this.listeners.end.forEach(callback => callback());
    }
    
    return this;
};

ForceSimulation.prototype.force = function(name, force) {
    if (arguments.length > 1) {
        if (force == null) {
            this.forces.delete(name);
        } else {
            this.forces.set(name, force);
            if (typeof force.initialize === 'function') {
                force.initialize(this.nodes);
            }
        }
        return this;
    } else {
        return this.forces.get(name);
    }
};

ForceSimulation.prototype.on = function(type, callback) {
    if (this.listeners[type]) {
        if (callback) {
            this.listeners[type].push(callback);
        } else {
            return this.listeners[type];
        }
    }
    return this;
};

ForceSimulation.prototype.alphaDecay = function(_) {
    if (arguments.length) {
        this._alphaDecay = +_;
        return this;
    }
    return this._alphaDecay;
};

ForceSimulation.prototype.velocityDecay = function(_) {
    if (arguments.length) {
        this._velocityDecay = +_;
        return this;
    }
    return this._velocityDecay;
};

ForceSimulation.prototype.setAlpha = function(_) {
    if (arguments.length) {
        this.alpha = +_;
        return this;
    }
    return this.alpha;
};

ForceSimulation.prototype.nodes = function(_) {
    if (arguments.length) {
        this.nodes = _;
        return this;
    }
    return this.nodes;
};

// Many Body Force (charge/repulsion)
function ForceManyBody() {
    let nodes;
    let strength = -30;
    let distanceMin2 = 1;
    let distanceMax2 = Infinity;
    
    function force(alpha) {
        for (let i = 0; i < nodes.length; i++) {
            const node1 = nodes[i];
            if (node1.fx != null && node1.fy != null) continue; // Skip fixed nodes
            
            for (let j = i + 1; j < nodes.length; j++) {
                const node2 = nodes[j];
                let dx = node2.x - node1.x;
                let dy = node2.y - node1.y;
                let distance2 = dx * dx + dy * dy;
                
                if (distance2 < distanceMax2) {
                    if (distance2 < distanceMin2) distance2 = Math.sqrt(distanceMin2 * distance2);
                    
                    const distance = Math.sqrt(distance2);
                    const k = strength * alpha / distance2;
                    
                    dx *= k;
                    dy *= k;
                    
                    if (!(node1.fx != null && node1.fy != null)) {
                        node1.vx -= dx;
                        node1.vy -= dy;
                    }
                    if (!(node2.fx != null && node2.fy != null)) {
                        node2.vx += dx;
                        node2.vy += dy;
                    }
                }
            }
        }
    }
    
    force.initialize = function(_nodes) {
        nodes = _nodes;
    };
    
    force.strength = function(_) {
        if (arguments.length) {
            strength = typeof _ === 'function' ? _ : +_;
            return force;
        }
        return strength;
    };
    
    force.distanceMin = function(_) {
        if (arguments.length) {
            distanceMin2 = _ * _;
            return force;
        }
        return Math.sqrt(distanceMin2);
    };
    
    force.distanceMax = function(_) {
        if (arguments.length) {
            distanceMax2 = _ * _;
            return force;
        }
        return Math.sqrt(distanceMax2);
    };
    
    return force;
}

// Collision Force
function ForceCollide() {
    let nodes;
    let radius = 1;
    let strength = 1;
    let iterations = 1;
    
    function force() {
        for (let k = 0; k < iterations; k++) {
            for (let i = 0; i < nodes.length; i++) {
                const node1 = nodes[i];
                const r1 = typeof radius === 'function' ? radius(node1) : radius;
                if (node1.fx != null && node1.fy != null) continue; // Skip fixed nodes
                
                for (let j = i + 1; j < nodes.length; j++) {
                    const node2 = nodes[j];
                    const r2 = typeof radius === 'function' ? radius(node2) : radius;
                    let dx = node2.x - node1.x;
                    let dy = node2.y - node1.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = r1 + r2;
                    
                    if (distance < minDistance) {
                        if (distance === 0) {
                            dx = Math.random() - 0.5;
                            dy = Math.random() - 0.5;
                            const newDistance = Math.sqrt(dx * dx + dy * dy);
                            dx /= newDistance;
                            dy /= newDistance;
                        } else {
                            dx /= distance;
                            dy /= distance;
                        }
                        
                        const overlap = minDistance - distance;
                        const adjust = overlap * strength * 0.5;
                        
                        if (!(node1.fx != null && node1.fy != null)) {
                            node1.x -= dx * adjust;
                            node1.y -= dy * adjust;
                        }
                        if (!(node2.fx != null && node2.fy != null)) {
                            node2.x += dx * adjust;
                            node2.y += dy * adjust;
                        }
                    }
                }
            }
        }
    }
    
    force.initialize = function(_nodes) {
        nodes = _nodes;
    };
    
    force.radius = function(_) {
        if (arguments.length) {
            radius = typeof _ === 'function' ? _ : +_;
            return force;
        }
        return radius;
    };
    
    force.strength = function(_) {
        if (arguments.length) {
            strength = +_;
            return force;
        }
        return strength;
    };
    
    force.iterations = function(_) {
        if (arguments.length) {
            iterations = +_;
            return force;
        }
        return iterations;
    };
    
    return force;
}

// Center Force
function ForceCenter(x = 0, y = 0) {
    let nodes;
    let strength = 1;
    
    function force(alpha) {
        let sx = 0, sy = 0, n = 0;
        
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.fx != null && node.fy != null) continue; // Skip fixed nodes
            sx += node.x;
            sy += node.y;
            n++;
        }
        
        if (n) {
            sx = (sx / n - x) * strength * alpha;
            sy = (sy / n - y) * strength * alpha;
            
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (!(node.fx != null && node.fy != null)) {
                    node.vx -= sx;
                    node.vy -= sy;
                }
            }
        }
    }
    
    force.initialize = function(_nodes) {
        nodes = _nodes;
        return force;
    };
    
    force.x = function(_) {
        if (arguments.length) {
            x = +_;
            return force;
        }
        return x;
    };
    
    force.y = function(_) {
        if (arguments.length) {
            y = +_;
            return force;
        }
        return y;
    };
    
    force.strength = function(_) {
        if (arguments.length) {
            strength = +_;
            return force;
        }
        return strength;
    };
    
    return force;
}

// Link Force (for connections between nodes)
function ForceLink(links = []) {
    let nodes;
    let distance = 30;
    let strength = 1;
    let iterations = 1;
    let id = (d) => d.id;
    
    function force(alpha) {
        for (let k = 0; k < iterations; k++) {
            for (let i = 0; i < links.length; i++) {
                const link = links[i];
                let source = link.source;
                let target = link.target;
                
                // Find nodes if links contain IDs
                if (typeof source === 'string' || typeof source === 'number') {
                    source = nodes.find(n => id(n) === source);
                }
                if (typeof target === 'string' || typeof target === 'number') {
                    target = nodes.find(n => id(n) === target);
                }
                
                if (!source || !target) continue;
                
                let dx = target.x - source.x;
                let dy = target.y - source.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const targetDistance = typeof distance === 'function' ? distance(link) : distance;
                
                if (dist > 0) {
                    const k = ((dist - targetDistance) / dist) * alpha * strength;
                    dx *= k;
                    dy *= k;
                    
                    if (!(target.fx != null && target.fy != null)) {
                        target.vx -= dx;
                        target.vy -= dy;
                    }
                    if (!(source.fx != null && source.fy != null)) {
                        source.vx += dx;
                        source.vy += dy;
                    }
                }
            }
        }
    }
    
    force.initialize = function(_nodes) {
        nodes = _nodes;
    };
    
    force.links = function(_) {
        if (arguments.length) {
            links = _;
            return force;
        }
        return links;
    };
    
    force.id = function(_) {
        if (arguments.length) {
            id = _;
            return force;
        }
        return id;
    };
    
    force.distance = function(_) {
        if (arguments.length) {
            distance = typeof _ === 'function' ? _ : +_;
            return force;
        }
        return distance;
    };
    
    force.strength = function(_) {
        if (arguments.length) {
            strength = typeof _ === 'function' ? _ : +_;
            return force;
        }
        return strength;
    };
    
    force.iterations = function(_) {
        if (arguments.length) {
            iterations = +_;
            return force;
        }
        return iterations;
    };
    
    return force;
}

// Export D3 force methods
d3.forceSimulation = function(nodes) {
    return new ForceSimulation(nodes);
};

d3.forceManyBody = function() {
    return new ForceManyBody();
};

d3.forceCollide = function() {
    return new ForceCollide();
};

d3.forceCenter = function(x, y) {
    return new ForceCenter(x, y);
};

d3.forceLink = function(links) {
    return new ForceLink(links);
};

console.log('D3 Force Simulation initialized');