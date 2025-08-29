/**
 * Skill Tree Core Logic
 * Manages skill tree structure and relationships
 */

class SkillTree {
    constructor(skillData, userProgress) {
        this.skillData = skillData;
        this.userProgress = userProgress;
        this.focusedCategory = null;
        this.selectedSkill = null;
        
        // Layout settings
        this.nodeRadius = 30; // Visual radius of skill nodes
        this.minDistance = 80; // Minimum distance between nodes
        this.categorySpacing = 400; // Base spacing between category seed areas
        this.connectionCurve = 0.3; // Curvature factor for organic connections
        
        // Force simulation parameters
        this.maxIterations = 100; // Maximum iterations for force simulation
        this.forceStrength = 5; // Strength of repulsion forces between nodes
        
        // Canvas bounds for layout
        this.canvasWidth = 1600;
        this.canvasHeight = 1200;
        
        // D3 force simulation
        this.simulation = null;
        this.nodes = [];
        this.links = [];
        
        // Initialize layout
        this.calculateLayout();
    }

    /**
     * Calculate positions for all skills using D3 force-directed layout
     */
    calculateLayout() {
        if (!this.skillData || !this.skillData.initialized) return;

        console.log('Initializing D3 force-directed layout...');
        
        // Step 1: Position categories in center circle
        const categories = this.skillData.getAllCategories();
        this.establishRadialCategorySeedPoints(categories);
        
        // Step 2: Position skills radiating from their categories  
        this.generateRadialSkillPositions(categories);
        
        // Step 3: Prepare nodes and links for D3 force simulation
        this.prepareD3NodesAndLinks();
        
        // Step 4: Apply D3 force-directed layout (or fallback if D3 unavailable)
        if (typeof d3 !== 'undefined' && d3.forceSimulation) {
            this.createD3Simulation();
        } else {
            console.warn('D3.js not available, using fallback positioning');
            this.applyEnhancedForceDirectedLayout();
            
            // Optimize connection paths for fallback
            setTimeout(() => {
                this.optimizeConnectionPaths();
                if (window.canvasRenderer) {
                    window.canvasRenderer.render();
                }
            }, 500);
        }
    }

    /**
     * Fallback positioning when D3 is not available
     */
    fallbackRadialPositioning() {
        const categories = this.skillData.getAllCategories();
        const allSkills = this.skillData.getAllSkills();
        
        // Simple radial positioning by category
        categories.forEach((category, categoryIndex) => {
            const categorySkills = this.skillData.getSkillsByCategory(category.id);
            const angle = (categoryIndex / categories.length) * Math.PI * 2;
            const categoryRadius = 200;
            const centerX = this.canvasWidth / 2;
            const centerY = this.canvasHeight / 2;
            
            const categoryX = centerX + Math.cos(angle) * categoryRadius;
            const categoryY = centerY + Math.sin(angle) * categoryRadius;
            
            categorySkills.forEach((skill, skillIndex) => {
                const skillAngle = angle + (skillIndex / categorySkills.length) * Math.PI * 0.5;
                const skillRadius = 80 + (skillIndex % 3) * 40;
                
                if (!skill.position) {
                    skill.position = {};
                }
                skill.position.x = categoryX + Math.cos(skillAngle) * skillRadius;
                skill.position.y = categoryY + Math.sin(skillAngle) * skillRadius;
                
                // Keep within bounds
                skill.position.x = Math.max(50, Math.min(this.canvasWidth - 50, skill.position.x));
                skill.position.y = Math.max(50, Math.min(this.canvasHeight - 50, skill.position.y));
            });
        });
        
        console.log('Applied fallback radial positioning');
    }

    /**
     * Prepare nodes and links for D3 force simulation
     */
    prepareD3NodesAndLinks() {
        const allSkills = this.skillData.getAllSkills();
        
        // Create nodes array from all skills
        this.nodes = allSkills.map(skill => {
            const isRootNode = !skill.prerequisites || skill.prerequisites.length === 0;
            
            return {
                id: skill.skill_id,
                skill: skill,
                category: skill.category,
                x: skill.position ? skill.position.x : 0,
                y: skill.position ? skill.position.y : 0,
                // Fix root nodes in place using fx/fy (D3 fixed position properties)
                fx: isRootNode ? (skill.position ? skill.position.x : 0) : null,
                fy: isRootNode ? (skill.position ? skill.position.y : 0) : null,
                isRoot: isRootNode
            };
        });
        
        // Create links array from skill dependencies
        this.links = [];
        allSkills.forEach(skill => {
            if (skill.prerequisites && skill.prerequisites.length > 0) {
                skill.prerequisites.forEach(prereqId => {
                    this.links.push({
                        source: prereqId,
                        target: skill.skill_id
                    });
                });
            }
        });
        
        console.log(`Prepared ${this.nodes.length} nodes and ${this.links.length} links for D3 simulation`);
        console.log(`Root nodes (fixed): ${this.nodes.filter(n => n.isRoot).length}`);
        console.log(`Floating nodes: ${this.nodes.filter(n => !n.isRoot).length}`);
    }

    /**
     * Prepare skill data for D3 force simulation using hierarchy.links()
     */
    prepareD3Data() {
        if (typeof d3 === 'undefined') {
            console.warn('D3.js not available, cannot create hierarchy');
            return;
        }

        const allSkills = this.skillData.getAllSkills();
        const categories = this.skillData.getAllCategories();
        
        // Create a hierarchical data structure for D3
        // First, create a tree structure from the skill relationships
        const skillTreeData = this.buildHierarchicalData(allSkills, categories);
        
        // Use D3 hierarchy to create the tree structure
        const root = d3.hierarchy(skillTreeData);
        
        // Create nodes from hierarchy
        this.nodes = root.descendants().map(d => {
            const skill = d.data.skill;
            const categoryIndex = categories.findIndex(cat => cat.id === (skill ? skill.category : d.data.id));
            
            // Initial radial positioning by category
            const angle = (categoryIndex / categories.length) * Math.PI * 2;
            const radius = Math.min(this.canvasWidth, this.canvasHeight) * 0.25;
            const centerX = this.canvasWidth / 2;
            const centerY = this.canvasHeight / 2;
            
            // Add some randomness and depth-based positioning
            const randomAngle = angle + (Math.random() - 0.5) * 0.5;
            const depthRadius = radius + (d.depth * 80) + (Math.random() - 0.5) * 60;
            
            return {
                id: skill ? skill.skill_id : d.data.id,
                skill: skill,
                category: skill ? skill.category : d.data.id,
                x: centerX + Math.cos(randomAngle) * depthRadius,
                y: centerY + Math.sin(randomAngle) * depthRadius,
                fx: null, // Fixed x position (null = not fixed)
                fy: null,  // Fixed y position (null = not fixed)
                depth: d.depth,
                hierarchyNode: d
            };
        });
        
        // Use D3 hierarchy.links() to create links - this is what was requested
        this.links = root.links().map(link => ({
            source: link.source.data.skill ? link.source.data.skill.skill_id : link.source.data.id,
            target: link.target.data.skill ? link.target.data.skill.skill_id : link.target.data.id,
            sourceNode: link.source,
            targetNode: link.target,
            type: 'hierarchy'
        }));
        
        console.log(`Prepared ${this.nodes.length} nodes and ${this.links.length} links using D3 hierarchy.links()`);
    }

    /**
     * Build hierarchical data structure from skill relationships
     */
    buildHierarchicalData(allSkills, categories) {
        // Create a virtual root node
        const root = {
            id: 'root',
            name: 'Skill Tree Root',
            children: []
        };

        // Group skills by category first
        const skillsByCategory = new Map();
        categories.forEach(cat => {
            skillsByCategory.set(cat.id, {
                id: cat.id,
                name: cat.name,
                children: [],
                isCategory: true
            });
        });

        // Find root skills (skills with no prerequisites or whose prerequisites don't exist)
        const skillMap = new Map();
        allSkills.forEach(skill => {
            skillMap.set(skill.skill_id, skill);
        });

        const rootSkills = allSkills.filter(skill => 
            !skill.prerequisites || 
            skill.prerequisites.length === 0 || 
            skill.prerequisites.every(prereq => !skillMap.has(prereq))
        );

        // Build tree structure recursively
        const addedSkills = new Set();
        
        const buildSkillTree = (skill, parent) => {
            if (addedSkills.has(skill.skill_id)) return null;
            
            addedSkills.add(skill.skill_id);
            const skillNode = {
                id: skill.skill_id,
                name: skill.name,
                skill: skill,
                children: []
            };

            // Add children (skills that this skill unlocks)
            if (skill.unlocks && skill.unlocks.length > 0) {
                skill.unlocks.forEach(unlockedId => {
                    const unlockedSkill = skillMap.get(unlockedId);
                    if (unlockedSkill && !addedSkills.has(unlockedId)) {
                        const childNode = buildSkillTree(unlockedSkill, skillNode);
                        if (childNode) {
                            skillNode.children.push(childNode);
                        }
                    }
                });
            }

            return skillNode;
        };

        // Add root skills to their respective categories
        rootSkills.forEach(skill => {
            const categoryNode = skillsByCategory.get(skill.category);
            if (categoryNode) {
                const skillTree = buildSkillTree(skill, categoryNode);
                if (skillTree) {
                    categoryNode.children.push(skillTree);
                }
            }
        });

        // Add any remaining skills that weren't connected to root skills
        allSkills.forEach(skill => {
            if (!addedSkills.has(skill.skill_id)) {
                const categoryNode = skillsByCategory.get(skill.category);
                if (categoryNode) {
                    const skillTree = buildSkillTree(skill, categoryNode);
                    if (skillTree) {
                        categoryNode.children.push(skillTree);
                    }
                }
            }
        });

        // Add categories to root
        skillsByCategory.forEach(category => {
            if (category.children.length > 0) {
                root.children.push(category);
            }
        });

        return root;
    }

    /**
     * Create and configure D3 force simulation
     * Root nodes (skills with no prerequisites) are fixed in position
     * All other nodes can float and be affected by forces
     */
    createD3Simulation() {
        try {
            if (typeof d3 === 'undefined') {
                console.warn('D3.js not available for force simulation');
                return;
            }

            console.log('Creating D3 force simulation...');

            // Create link force for skill prerequisites/unlocks
            console.log('Creating link force...');
            const linkForce = d3.forceLink(this.links)
                .id(d => d.id)
                .distance(80)  // Distance between connected nodes
                .strength(0.2); // Weaker link force to allow more floating
            console.log('Link force created');
                
            // Create many-body force for node repulsion/attraction
            console.log('Creating charge force...');
            const chargeForce = d3.forceManyBody()
                .strength(-100) // Repulsive force to separate nodes
                .distanceMax(200); // Maximum distance for force interaction
            console.log('Charge force created');
                
            // Create center force to keep nodes roughly centered
            console.log('Creating center force...');
            const centerForce = d3.forceCenter(this.canvasWidth / 2, this.canvasHeight / 2)
                .strength(0.05); // Very weak centering
            console.log('Center force created');
            
            // Create collision force to prevent node overlapping
            console.log('Creating collision force...');
            const collisionForce = d3.forceCollide()
                .radius(this.nodeRadius + 10) // Node radius plus padding
                .strength(1.0)  // Strong collision avoidance
                .iterations(2); // Multiple iterations for better collision resolution
            console.log('Collision force created');

            // Create the simulation
            console.log('Creating simulation...');
            this.simulation = d3.forceSimulation(this.nodes);
            console.log('Simulation object created, adding forces...');
            
            this.simulation
                .force('link', linkForce)
                .force('charge', chargeForce)
                .force('center', centerForce)
                .force('collision', collisionForce);
            console.log('Forces added, setting parameters...');
            
            this.simulation
                .alphaDecay(0.01) // Slower cooling for smoother animation
                .velocityDecay(0.3) // Some velocity persistence for floating effect
                .on('tick', () => this.onSimulationTick())
                .on('end', () => this.onSimulationEnd());
            console.log('Parameters set');

            // Start the simulation
            this.simulation.restart();
            
            console.log('D3 force simulation started');
            console.log('Forces applied:');
            console.log('- forceManyBody: Node repulsion/attraction');
            console.log('- forceCollide: Collision detection and overlap prevention');
            console.log('- forceLink: Skill prerequisite connections');
            console.log('- forceCenter: Weak centering force');
        } catch (error) {
            console.error('Error in createD3Simulation:', error);
            console.error('Stack trace:', error.stack);
            throw error;
        }
    }

    /**
     * Create custom force to attract nodes to category centers
     */
    createCategoryAttractionForce() {
        return (alpha) => {
            const categories = this.skillData.getAllCategories();
            
            // Calculate category centers
            const categoryCenters = {};
            categories.forEach((category, index) => {
                const angle = (index / categories.length) * Math.PI * 2;
                const radius = Math.min(this.canvasWidth, this.canvasHeight) * 0.2;
                const centerX = this.canvasWidth / 2;
                const centerY = this.canvasHeight / 2;
                
                categoryCenters[category.id] = {
                    x: centerX + Math.cos(angle) * radius,
                    y: centerY + Math.sin(angle) * radius
                };
            });
            
            // Apply attraction force to category centers
            this.nodes.forEach(node => {
                const categoryCenter = categoryCenters[node.category];
                if (categoryCenter) {
                    const dx = categoryCenter.x - node.x;
                    const dy = categoryCenter.y - node.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 0) {
                        const force = alpha * 0.1; // Weak attraction force
                        node.vx += (dx / distance) * force;
                        node.vy += (dy / distance) * force;
                    }
                }
            });
        };
    }

    /**
     * Handle simulation tick event
     * Updates skill positions from D3 simulation while keeping root nodes fixed
     */
    onSimulationTick() {
        // Update skill positions from simulation
        this.nodes.forEach(node => {
            // Only update non-root nodes (root nodes are fixed with fx/fy)
            if (!node.isRoot) {
                // Keep nodes within canvas bounds
                node.x = Math.max(this.nodeRadius, Math.min(this.canvasWidth - this.nodeRadius, node.x));
                node.y = Math.max(this.nodeRadius, Math.min(this.canvasHeight - this.nodeRadius, node.y));
            }
            
            // Update the actual skill position for all nodes
            if (node.skill && node.skill.position) {
                node.skill.position.x = node.x;
                node.skill.position.y = node.y;
            }
        });
        
        // Trigger re-render if canvas renderer is available
        if (window.canvasRenderer) {
            window.canvasRenderer.render();
        }
    }

    /**
     * Handle simulation end event
     */
    onSimulationEnd() {
        console.log('D3 force simulation completed');
        
        // Final position update
        this.nodes.forEach(node => {
            if (node.skill && node.skill.position) {
                node.skill.position.x = node.x;
                node.skill.position.y = node.y;
            }
        });
        
        // Optimize connection paths
        this.optimizeConnectionPaths();
        
        // Final render
        if (window.canvasRenderer) {
            window.canvasRenderer.render();
        }
    }

    /**
     * Restart the D3 simulation (useful for re-arranging layout)
     */
    restartSimulation() {
        if (typeof d3 === 'undefined' || !d3.forceSimulation) {
            console.warn('D3.js not available, using fallback positioning');
            this.fallbackRadialPositioning();
            return;
        }

        // Re-prepare nodes and links in case skills changed
        this.prepareD3NodesAndLinks();

        if (this.simulation) {
            // Update simulation with new nodes
            this.simulation.nodes(this.nodes);
            this.simulation.force('link').links(this.links);
            this.simulation.setAlpha(1).restart();
            console.log('D3 simulation restarted with updated nodes');
        } else {
            this.calculateLayout();
        }
    }

    /**
     * Stop the D3 simulation
     */
    stopSimulation() {
        if (this.simulation) {
            this.simulation.stop();
        }
    }

    /**
     * Position categories in a circle at the center of the canvas
     */
    establishRadialCategorySeedPoints(categories) {
        const numCategories = categories.length;
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        
        // Smaller radius for center circle arrangement
        const categoryRadius = Math.min(this.canvasWidth, this.canvasHeight) * 0.15;
        
        categories.forEach((category, index) => {
            // Distribute categories evenly around a circle
            const angle = (index / numCategories) * Math.PI * 2;
            
            // Position category at center circle
            category.position = {
                x: centerX + Math.cos(angle) * categoryRadius,
                y: centerY + Math.sin(angle) * categoryRadius
            };
            
            // Store radial properties for skill positioning
            category.radialAngle = angle;
            category.radialRadius = categoryRadius;
            category.centerX = centerX;
            category.centerY = centerY;
            
            // Ensure positions stay within bounds with padding
            const padding = 100;
            category.position.x = Math.max(padding, Math.min(this.canvasWidth - padding, category.position.x));
            category.position.y = Math.max(padding, Math.min(this.canvasHeight - padding, category.position.y));
        });
        
        console.log(`Positioned ${numCategories} categories in center circle`);
    }
    /**
     * Generate radial skill positions for each category
     */
    generateRadialSkillPositions(categories) {
        categories.forEach(category => {
            const categorySkills = this.skillData.getSkillsByCategory(category.id);
            if (categorySkills.length === 0) return;
            
            // Build skill tree structure for this category
            const skillTree = this.buildSkillTreeStructure(categorySkills);
            
            // Position skills in concentric rings radiating from the category center
            this.positionSkillsRadially(category, skillTree);
        });
    }
    
    /**
     * Build hierarchical tree structure for skills in a category
     */
    buildSkillTreeStructure(categorySkills) {
        const skillMap = new Map();
        const roots = [];
        
        // Create skill map
        categorySkills.forEach(skill => {
            skillMap.set(skill.skill_id, {
                skill: skill,
                children: [],
                parents: []
            });
        });
        
        // Build parent-child relationships
        categorySkills.forEach(skill => {
            const skillNode = skillMap.get(skill.skill_id);
            
            // Add children based on unlocks
            if (skill.unlocks) {
                skill.unlocks.forEach(childId => {
                    const childNode = skillMap.get(childId);
                    if (childNode) {
                        skillNode.children.push(childNode);
                        childNode.parents.push(skillNode);
                    }
                });
            }
            
            // Add parents based on prerequisites
            if (skill.prerequisites) {
                skill.prerequisites.forEach(parentId => {
                    const parentNode = skillMap.get(parentId);
                    if (parentNode && !skillNode.parents.includes(parentNode)) {
                        skillNode.parents.push(parentNode);
                        if (!parentNode.children.includes(skillNode)) {
                            parentNode.children.push(skillNode);
                        }
                    }
                });
            }
            
            // Identify root skills (no parents or no prerequisites)
            if (skillNode.parents.length === 0 || !skill.prerequisites || skill.prerequisites.length === 0) {
                roots.push(skillNode);
            }
        });
        
        return { skillMap, roots };
    }
    
    /**
     * Position skills radially around the category center in concentric rings
     * Uses space-efficient packing to fill space close to root first
     */
    positionSkillsRadially(category, skillTree) {
        const categoryCenter = category.position;
        const startRadius = 50; // Start closer to category center
        const minRadiusIncrement = 45; // Minimum space between rings
        const minAngleSpacing = Math.PI / 12; // Minimum angle between skills to avoid crowding
        
        // Organize skills by their distance from root skills (depth levels)
        const depthLevels = this.organizeSkillsByDepth(skillTree);
        
        let currentRadius = startRadius; // Track the current outer radius
        
        depthLevels.forEach((skillsAtDepth, depth) => {
            const numSkills = skillsAtDepth.length;
            
            if (numSkills === 0) return;
            
            // Calculate required angle spacing
            const optimalAngleSpacing = (Math.PI * 2) / numSkills;
            const actualAngleSpacing = Math.max(minAngleSpacing, optimalAngleSpacing);
            
            // Calculate minimum radius needed for this number of nodes with proper spacing
            // This ensures nodes don't overlap based on their visual size
            const nodeSpacingRadius = (this.nodeRadius * 2.2) / Math.sin(actualAngleSpacing / 2);
            
            // Use the larger of: current radius + increment, or required spacing radius
            const ringRadius = Math.max(currentRadius + minRadiusIncrement, nodeSpacingRadius);
            
            // Position skills around the ring
            skillsAtDepth.forEach((skillNode, index) => {
                // Add some variation based on category's radial angle to avoid perfect alignment
                const baseAngle = category.radialAngle + (index * actualAngleSpacing);
                
                // Add slight random variation for more natural appearance (deterministic)
                const variation = Math.sin(index * 2.4 + depth * 1.7) * 0.1;
                const actualAngle = baseAngle + variation;
                
                const x = categoryCenter.x + Math.cos(actualAngle) * ringRadius;
                const y = categoryCenter.y + Math.sin(actualAngle) * ringRadius;
                
                // Ensure position stays within bounds
                const padding = 50;
                skillNode.skill.position = {
                    x: Math.max(padding, Math.min(this.canvasWidth - padding, x)),
                    y: Math.max(padding, Math.min(this.canvasHeight - padding, y))
                };
                
                skillNode.positioned = true;
            });
            
            // Update current radius to the outer edge of this ring for next iteration
            currentRadius = ringRadius;
        });
    }
    
    /**
     * Organize skills by their depth from root skills
     */
    organizeSkillsByDepth(skillTree) {
        const depthLevels = new Map();
        const visited = new Set();
        
        // BFS to assign depth levels
        const queue = [];
        
        // Start with root skills at depth 0
        skillTree.roots.forEach(rootSkill => {
            queue.push({ skill: rootSkill, depth: 0 });
        });
        
        while (queue.length > 0) {
            const { skill, depth } = queue.shift();
            
            if (visited.has(skill.skill.skill_id)) continue;
            visited.add(skill.skill.skill_id);
            
            // Add to depth level
            if (!depthLevels.has(depth)) {
                depthLevels.set(depth, []);
            }
            depthLevels.get(depth).push(skill);
            
            // Add children to queue with next depth
            skill.children.forEach(childSkill => {
                if (!visited.has(childSkill.skill.skill_id)) {
                    queue.push({ skill: childSkill, depth: depth + 1 });
                }
            });
        }
        
        return depthLevels;
    }

    /**
     * Apply enhanced force-directed positioning to eliminate overlaps with better spacing
     */
    applyEnhancedForceDirectedLayout() {
        const allSkills = this.skillData.getAllSkills();
        const enhancedMinDistance = this.minDistance * 1.5; // Increased from 1.2 to 1.5 for better spacing
        const maxForceIterations = this.maxIterations * 2; // More iterations for better convergence
        
        for (let iteration = 0; iteration < maxForceIterations; iteration++) {
            let hasOverlaps = false;
            let totalOverlapForce = 0;
            const forces = new Map();
            
            // Initialize forces for all skills
            allSkills.forEach(skill => {
                forces.set(skill.skill_id, { x: 0, y: 0 });
            });
            
            // Calculate repulsion forces with spatial partitioning for efficiency
            const spatialGrid = this.createSpatialGrid(allSkills, enhancedMinDistance * 2);
            
            allSkills.forEach(skill1 => {
                const nearbySkills = this.getNearbySkillsFromGrid(skill1, spatialGrid, enhancedMinDistance * 2);
                
                nearbySkills.forEach(skill2 => {
                    if (skill1.skill_id >= skill2.skill_id) return; // Avoid duplicate calculations
                    
                    const dx = skill2.position.x - skill1.position.x;
                    const dy = skill2.position.y - skill1.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < enhancedMinDistance) {
                        hasOverlaps = true;
                        
                        if (distance === 0) {
                            // Handle identical positions with stronger dispersion
                            const randomAngle = Math.random() * Math.PI * 2;
                            const separationForce = this.forceStrength * 2;
                            forces.get(skill1.skill_id).x -= Math.cos(randomAngle) * separationForce;
                            forces.get(skill1.skill_id).y -= Math.sin(randomAngle) * separationForce;
                            forces.get(skill2.skill_id).x += Math.cos(randomAngle) * separationForce;
                            forces.get(skill2.skill_id).y += Math.sin(randomAngle) * separationForce;
                        } else {
                            // Enhanced repulsion force with non-linear scaling
                            const overlapAmount = enhancedMinDistance - distance;
                            const forceStrength = this.forceStrength * Math.pow(overlapAmount / distance, 1.5);
                            const forceX = (dx / distance) * forceStrength;
                            const forceY = (dy / distance) * forceStrength;
                            
                            forces.get(skill1.skill_id).x -= forceX;
                            forces.get(skill1.skill_id).y -= forceY;
                            forces.get(skill2.skill_id).x += forceX;
                            forces.get(skill2.skill_id).y += forceY;
                            
                            totalOverlapForce += Math.abs(forceX) + Math.abs(forceY);
                        }
                    }
                });
            });
            
            // Apply connection attraction forces (weaker and more controlled)
            allSkills.forEach(skill => {
                if (skill.unlocks) {
                    skill.unlocks.forEach(childId => {
                        const childSkill = this.skillData.getSkill(childId);
                        if (childSkill) {
                            const dx = childSkill.position.x - skill.position.x;
                            const dy = childSkill.position.y - skill.position.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            
                            // Only apply attraction if nodes are too far apart
                            const maxConnectionDistance = enhancedMinDistance * 3;
                            if (distance > maxConnectionDistance) {
                                const attractionStrength = 0.05 * Math.min(1, distance / maxConnectionDistance - 1);
                                const forceX = (dx / distance) * attractionStrength;
                                const forceY = (dy / distance) * attractionStrength;
                                
                                forces.get(skill.skill_id).x += forceX;
                                forces.get(skill.skill_id).y += forceY;
                                forces.get(childId).x -= forceX;
                                forces.get(childId).y -= forceY;
                            }
                        }
                    });
                }
            });
            
            // Apply forces to positions with adaptive damping
            const progressRatio = iteration / maxForceIterations;
            const adaptiveDamping = Math.max(0.05, 1.0 - Math.pow(progressRatio, 0.7));
            
            allSkills.forEach(skill => {
                const force = forces.get(skill.skill_id);
                const forceMagnitude = Math.sqrt(force.x * force.x + force.y * force.y);
                
                // Limit maximum force to prevent instability
                const maxForce = 20;
                if (forceMagnitude > maxForce) {
                    force.x = (force.x / forceMagnitude) * maxForce;
                    force.y = (force.y / forceMagnitude) * maxForce;
                }
                
                skill.position.x += force.x * adaptiveDamping;
                skill.position.y += force.y * adaptiveDamping;
                
                // Enhanced bounds checking with proper padding
                const padding = this.nodeRadius * 2;
                skill.position.x = Math.max(padding, Math.min(this.canvasWidth - padding, skill.position.x));
                skill.position.y = Math.max(padding, Math.min(this.canvasHeight - padding, skill.position.y));
            });
            
            // Early termination with improved convergence criteria
            if (!hasOverlaps || (iteration > 20 && totalOverlapForce < 0.1)) {
                console.log(`Enhanced force simulation converged after ${iteration + 1} iterations`);
                break;
            }
        }
    }
    
    /**
     * Create spatial grid for efficient collision detection
     */
    createSpatialGrid(skills, cellSize) {
        const grid = new Map();
        const cellSizeInt = Math.ceil(cellSize);
        
        skills.forEach(skill => {
            const cellX = Math.floor(skill.position.x / cellSizeInt);
            const cellY = Math.floor(skill.position.y / cellSizeInt);
            const cellKey = `${cellX},${cellY}`;
            
            if (!grid.has(cellKey)) {
                grid.set(cellKey, []);
            }
            grid.get(cellKey).push(skill);
        });
        
        return { grid, cellSize: cellSizeInt };
    }
    
    /**
     * Get nearby skills from spatial grid for efficient collision detection
     */
    getNearbySkillsFromGrid(skill, spatialGrid, searchRadius) {
        const nearby = [];
        const { grid, cellSize } = spatialGrid;
        const searchCells = Math.ceil(searchRadius / cellSize);
        
        const centerCellX = Math.floor(skill.position.x / cellSize);
        const centerCellY = Math.floor(skill.position.y / cellSize);
        
        for (let dx = -searchCells; dx <= searchCells; dx++) {
            for (let dy = -searchCells; dy <= searchCells; dy++) {
                const cellKey = `${centerCellX + dx},${centerCellY + dy}`;
                const cellSkills = grid.get(cellKey);
                
                if (cellSkills) {
                    cellSkills.forEach(otherSkill => {
                        if (skill.skill_id !== otherSkill.skill_id) {
                            const distance = Math.sqrt(
                                Math.pow(skill.position.x - otherSkill.position.x, 2) +
                                Math.pow(skill.position.y - otherSkill.position.y, 2)
                            );
                            if (distance <= searchRadius) {
                                nearby.push(otherSkill);
                            }
                        }
                    });
                }
            }
        }
        
        return nearby;
    }
    /**
     * Optimize connection paths to prevent intersections
     */
    optimizeConnectionPaths() {
        const connections = this.getSkillConnections();
        
        // Store optimized connection paths
        this.connectionPaths = new Map();
        
        connections.forEach(connection => {
            const path = this.calculateOrganicConnectionPath(
                connection.from.position,
                connection.to.position,
                connections
            );
            
            this.connectionPaths.set(
                `${connection.from.skill_id}-${connection.to.skill_id}`,
                path
            );
        });
    }
    
    /**
     * Calculate organic connection path that avoids intersections
     */
    calculateOrganicConnectionPath(fromPos, toPos, allConnections) {
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // For very short connections, use direct line
        if (distance < this.minDistance) {
            return [fromPos, toPos];
        }
        
        // Create organic mycelium-like curves
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;
        
        // Use deterministic seeding based on position for consistent curves
        const seed = Math.floor(fromPos.x + fromPos.y + toPos.x + toPos.y) % 1000;
        let randomState = seed;
        const seededRandom = () => {
            randomState = (randomState * 9301 + 49297) % 233280;
            return randomState / 233280;
        };
        
        // Add organic curvature with mycelium-like characteristics
        const perpX = -dy / distance;
        const perpY = dx / distance;
        
        // Mycelium connections curve naturally around obstacles
        const curveDirection = seededRandom() > 0.5 ? 1 : -1;
        const curveStrength = (distance * this.connectionCurve * 0.6 + 20) * curveDirection;
        
        // Add secondary curve variation for more organic appearance
        const secondaryCurve = (seededRandom() - 0.5) * 15;
        
        const controlX = midX + perpX * curveStrength + perpY * secondaryCurve;
        const controlY = midY + perpY * curveStrength - perpX * secondaryCurve;
        
        // Ensure control point doesn't go out of bounds
        const boundedControlX = Math.max(50, Math.min(this.canvasWidth - 50, controlX));
        const boundedControlY = Math.max(50, Math.min(this.canvasHeight - 50, controlY));
        
        // Return organic bezier curve control points
        return [
            fromPos,
            { x: boundedControlX, y: boundedControlY },
            toPos
        ];
    }

    /**
     * Get skills within viewport bounds for rendering optimization
     */
    getVisibleSkills(viewport) {
        if (!this.skillData) return [];
        
        const buffer = 100; // Extra buffer for smooth scrolling
        const visibleSkills = [];
        
        for (const skill of this.skillData.getAllSkills()) {
            const pos = skill.position;
            if (pos.x >= viewport.x - buffer && 
                pos.x <= viewport.x + viewport.width + buffer &&
                pos.y >= viewport.y - buffer && 
                pos.y <= viewport.y + viewport.height + buffer) {
                visibleSkills.push(skill);
            }
        }
        
        return visibleSkills;
    }

    /**
     * Get connections between skills for rendering
     */
    getSkillConnections() {
        if (!this.skillData) return [];
        
        const connections = [];
        
        for (const skill of this.skillData.getAllSkills()) {
            if (skill.unlocks && skill.unlocks.length > 0) {
                for (const unlockedId of skill.unlocks) {
                    const unlockedSkill = this.skillData.getSkill(unlockedId);
                    if (unlockedSkill) {
                        connections.push({
                            from: skill,
                            to: unlockedSkill,
                            active: this.userProgress.isSkillCompleted(skill.skill_id),
                            type: skill.category === unlockedSkill.category ? 'category' : 'cross-category'
                        });
                    }
                }
            }
        }
        
        return connections;
    }

    /**
     * Find path between two skills
     */
    findSkillPath(fromSkillId, toSkillId) {
        const visited = new Set();
        const queue = [{ skill: fromSkillId, path: [] }];
        
        while (queue.length > 0) {
            const { skill: currentId, path } = queue.shift();
            
            if (visited.has(currentId)) continue;
            visited.add(currentId);
            
            const currentPath = [...path, currentId];
            
            if (currentId === toSkillId) {
                return currentPath;
            }
            
            const skill = this.skillData.getSkill(currentId);
            if (skill && skill.unlocks) {
                for (const unlockedId of skill.unlocks) {
                    if (!visited.has(unlockedId)) {
                        queue.push({ skill: unlockedId, path: currentPath });
                    }
                }
            }
        }
        
        return null; // No path found
    }

    /**
     * Get recommended skills based on current progress
     */
    getRecommendedSkills() {
        const unlockedIncomplete = [];
        const nearlyUnlocked = [];
        
        for (const skill of this.skillData.getAllSkills()) {
            if (skill.unlocked && !this.userProgress.isSkillCompleted(skill.skill_id)) {
                unlockedIncomplete.push(skill);
            } else if (!skill.unlocked) {
                // Check if skill is nearly unlocked (1 prerequisite away)
                const missingPrereqs = skill.prerequisites.filter(prereqId => 
                    !this.userProgress.isSkillCompleted(prereqId)
                );
                
                if (missingPrereqs.length === 1) {
                    nearlyUnlocked.push(skill);
                }
            }
        }
        
        return {
            unlocked: unlockedIncomplete.slice(0, 5), // Limit to 5 recommendations
            nearlyUnlocked: nearlyUnlocked.slice(0, 3)
        };
    }

    /**
     * Calculate optimal learning path for a category
     */
    getOptimalPath(categoryId) {
        const categorySkills = this.skillData.getSkillsByCategory(categoryId);
        const path = [];
        const completed = new Set();
        
        // Add already completed skills
        categorySkills.forEach(skill => {
            if (this.userProgress.isSkillCompleted(skill.skill_id)) {
                completed.add(skill.skill_id);
            }
        });
        
        // Find optimal order for remaining skills
        const remaining = categorySkills.filter(skill => 
            !this.userProgress.isSkillCompleted(skill.skill_id)
        );
        
        while (remaining.length > 0) {
            // Find skills that can be completed next (prerequisites met)
            const available = remaining.filter(skill => {
                return !skill.prerequisites || skill.prerequisites.every(prereqId => 
                    completed.has(prereqId)
                );
            });
            
            if (available.length === 0) break; // No more skills can be unlocked
            
            // Sort by points (ascending) for gradual progression
            available.sort((a, b) => a.points - b.points);
            
            const nextSkill = available[0];
            path.push(nextSkill);
            completed.add(nextSkill.skill_id);
            
            const index = remaining.indexOf(nextSkill);
            remaining.splice(index, 1);
        }
        
        return path;
    }

    /**
     * Get statistics for the skill tree
     */
    getTreeStatistics() {
        const totalSkills = this.skillData.getAllSkills().length;
        const completedSkills = this.skillData.getAllSkills().filter(skill => 
            this.userProgress.isSkillCompleted(skill.skill_id)
        ).length;
        
        const categoryStats = {};
        for (const category of this.skillData.getAllCategories()) {
            const categorySkills = this.skillData.getSkillsByCategory(category.id);
            const completedInCategory = categorySkills.filter(skill => 
                this.userProgress.isSkillCompleted(skill.skill_id)
            ).length;
            
            categoryStats[category.id] = {
                total: categorySkills.length,
                completed: completedInCategory,
                percentage: categorySkills.length > 0 ? 
                    Math.round((completedInCategory / categorySkills.length) * 100) : 0
            };
        }
        
        return {
            totalSkills,
            completedSkills,
            overallPercentage: totalSkills > 0 ? 
                Math.round((completedSkills / totalSkills) * 100) : 0,
            categoryStats
        };
    }

    /**
     * Update skill tree after progress changes
     */
    updateSkillStates() {
        // Recalculate unlocked states
        this.skillData.updateUnlockedSkills();
        
        // Update any cached data or positions if needed
        // This could be extended for dynamic layout adjustments
    }

    /**
     * Focus on a specific category
     */
    focusCategory(categoryId) {
        this.focusedCategory = categoryId;
    }

    /**
     * Clear category focus
     */
    clearFocus() {
        this.focusedCategory = null;
    }

    /**
     * Select a skill for detailed view
     */
    selectSkill(skillId) {
        this.selectedSkill = skillId;
    }

    /**
     * Clear skill selection
     */
    clearSelection() {
        this.selectedSkill = null;
    }

    /**
     * Get optimized connection path for rendering
     */
    getConnectionPath(fromSkillId, toSkillId) {
        const key = `${fromSkillId}-${toSkillId}`;
        return this.connectionPaths?.get(key) || null;
    }

    /**
     * Check if any skill nodes are overlapping (for testing and validation)
     */
    detectOverlappingNodes() {
        const allSkills = this.skillData.getAllSkills();
        const overlaps = [];
        const minSeparation = this.nodeRadius * 2; // Minimum visual separation (reduced for more realistic testing)
        
        for (let i = 0; i < allSkills.length; i++) {
            for (let j = i + 1; j < allSkills.length; j++) {
                const skill1 = allSkills[i];
                const skill2 = allSkills[j];
                
                if (!skill1.position || !skill2.position) continue;
                
                const dx = skill2.position.x - skill1.position.x;
                const dy = skill2.position.y - skill1.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < minSeparation) {
                    overlaps.push({
                        skill1: skill1.skill_id,
                        skill2: skill2.skill_id,
                        distance: distance,
                        requiredDistance: minSeparation
                    });
                }
            }
        }
        
        return overlaps;
    }

    /**
     * Check for severe visual overlaps that affect readability
     */
    detectSevereOverlaps() {
        const allSkills = this.skillData.getAllSkills();
        const severeOverlaps = [];
        const severeOverlapThreshold = this.nodeRadius * 1.5; // Very close overlaps that affect readability
        
        for (let i = 0; i < allSkills.length; i++) {
            for (let j = i + 1; j < allSkills.length; j++) {
                const skill1 = allSkills[i];
                const skill2 = allSkills[j];
                
                if (!skill1.position || !skill2.position) continue;
                
                const dx = skill2.position.x - skill1.position.x;
                const dy = skill2.position.y - skill1.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < severeOverlapThreshold) {
                    severeOverlaps.push({
                        skill1: skill1.skill_id,
                        skill2: skill2.skill_id,
                        distance: distance,
                        requiredDistance: severeOverlapThreshold
                    });
                }
            }
        }
        
        return severeOverlaps;
    }
}

// Export for use in other modules
window.SkillTree = SkillTree;