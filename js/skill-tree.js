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
        
        // Mycelium layout settings
        this.nodeRadius = 30; // Visual radius of skill nodes
        this.minDistance = 80; // Minimum distance between nodes
        this.categorySpacing = 400; // Base spacing between category seed areas
        this.maxIterations = 100; // Maximum iterations for force simulation
        this.forceStrength = 0.8; // Strength of repulsion forces
        this.connectionCurve = 0.3; // Curvature factor for organic connections
        
        // Canvas bounds for layout
        this.canvasWidth = 1600;
        this.canvasHeight = 1200;
        
        // Initialize layout
        this.calculateLayout();
    }

    /**
     * Calculate positions for all skills using fractal geometry patterns
     */
    calculateLayout() {
        if (!this.skillData || !this.skillData.initialized) return;

        const categories = this.skillData.getAllCategories();
        
        // Phase 1: Establish category seed points using fractal positioning
        this.establishFractalCategorySeedPoints(categories);
        
        // Phase 2: Generate fractal branch structures for each category
        this.generateFractalBranches(categories);
        
        // Phase 3: Apply enhanced force-directed positioning to eliminate overlaps
        this.applyEnhancedForceDirectedLayout();
        
        // Phase 4: Optimize connection paths to prevent intersections
        this.optimizeConnectionPaths();
    }

    /**
     * Establish fractal-based seed points for categories using self-similar patterns
     */
    establishFractalCategorySeedPoints(categories) {
        const numCategories = categories.length;
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        
        // Use deterministic seeding for consistent fractal layouts
        const seed = 42;
        let randomState = seed;
        
        const seededRandom = () => {
            randomState = (randomState * 9301 + 49297) % 233280;
            return randomState / 233280;
        };
        
        // Generate fractal spiral using golden angle and fractal scaling
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const fractalDimension = 1.618; // Golden ratio for natural fractal appearance
        
        categories.forEach((category, index) => {
            // Create fractal positioning with self-similar scaling
            const tier = Math.floor(Math.log2(index + 2)) - 1; // Fractal tier level
            const posInTier = (index + 1) - Math.pow(2, tier + 1) + 1;
            
            // Base radius scaled by fractal dimension
            const baseRadius = this.categorySpacing * Math.pow(fractalDimension, -tier * 0.5);
            const radius = baseRadius * (0.7 + 0.6 * Math.sqrt(posInTier));
            
            // Fractal angular positioning with self-similarity
            const baseAngle = index * goldenAngle;
            const fractalAngle = baseAngle + (tier * Math.PI / 3) + (posInTier * goldenAngle * 0.7);
            
            // Add fractal noise with decreasing amplitude at higher tiers
            const fractalNoise = Math.pow(fractalDimension, -tier) * 100;
            const noiseX = (seededRandom() - 0.5) * fractalNoise;
            const noiseY = (seededRandom() - 0.5) * fractalNoise;
            
            category.position = {
                x: centerX + Math.cos(fractalAngle) * radius + noiseX,
                y: centerY + Math.sin(fractalAngle) * radius + noiseY
            };
            
            // Store fractal properties for later use in skill positioning
            category.fractalTier = tier;
            category.fractalAngle = fractalAngle;
            category.fractalRadius = radius;
            
            // Ensure positions stay within bounds with padding
            const padding = 180;
            category.position.x = Math.max(padding, Math.min(this.canvasWidth - padding, category.position.x));
            category.position.y = Math.max(padding, Math.min(this.canvasHeight - padding, category.position.y));
        });
    }
    /**
     * Generate fractal branch structures for each category with self-similar patterns
     */
    generateFractalBranches(categories) {
        // Use deterministic seeded random for consistent fractal patterns
        let randomState = 42;
        const seededRandom = () => {
            randomState = (randomState * 9301 + 49297) % 233280;
            return randomState / 233280;
        };
        
        const goldenRatio = 1.618;
        const fractalAngleSpread = Math.PI / 3; // 60-degree base branching angle
        
        categories.forEach(category => {
            const categorySkills = this.skillData.getSkillsByCategory(category.id);
            if (categorySkills.length === 0) return;
            
            // Build skill tree structure for this category
            const skillTree = this.buildSkillTreeStructure(categorySkills);
            
            // Generate fractal branches for each root skill
            skillTree.roots.forEach((rootSkill, rootIndex) => {
                const baseAngle = (rootIndex / skillTree.roots.length) * Math.PI * 2 + category.fractalAngle;
                this.generateFractalBranch(
                    rootSkill,
                    category.position,
                    baseAngle,
                    0, // depth
                    category.fractalRadius * 0.4, // initial branch length
                    fractalAngleSpread,
                    category.fractalTier,
                    seededRandom
                );
            });
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
     * Recursively generate fractal branch with self-similar patterns
     */
    generateFractalBranch(skillNode, parentPos, angle, depth, branchLength, angleSpread, categoryTier, seededRandom) {
        if (!skillNode || skillNode.positioned) return;
        
        // Calculate fractal scaling factors
        const lengthDecay = 0.618; // Golden ratio inverse for natural scaling
        const angleDecayFactor = Math.pow(0.8, depth * 0.5);
        const currentAngleSpread = angleSpread * angleDecayFactor;
        
        // Add fractal noise to angle and length
        const angleNoise = (seededRandom() - 0.5) * currentAngleSpread * 0.4;
        const lengthNoise = (seededRandom() - 0.5) * branchLength * 0.3;
        const actualAngle = angle + angleNoise;
        const actualLength = Math.max(this.minDistance * 0.8, branchLength + lengthNoise);
        
        // Calculate position using fractal geometry
        const x = parentPos.x + Math.cos(actualAngle) * actualLength;
        const y = parentPos.y + Math.sin(actualAngle) * actualLength;
        
        // Apply fractal spiraling effect for natural appearance
        const spiralEffect = depth * 0.1 * Math.sin(angle * 3 + depth);
        const spiralX = x + Math.cos(actualAngle + Math.PI/2) * spiralEffect * 20;
        const spiralY = y + Math.sin(actualAngle + Math.PI/2) * spiralEffect * 20;
        
        // Ensure position stays within bounds
        const padding = 60;
        skillNode.skill.position = {
            x: Math.max(padding, Math.min(this.canvasWidth - padding, spiralX)),
            y: Math.max(padding, Math.min(this.canvasHeight - padding, spiralY))
        };
        
        skillNode.positioned = true;
        
        // Recursively position children with fractal branching
        const numChildren = skillNode.children.length;
        if (numChildren > 0) {
            const childAngleSpread = currentAngleSpread * (1 + numChildren * 0.1);
            const childBranchLength = branchLength * lengthDecay;
            
            skillNode.children.forEach((childNode, childIndex) => {
                if (childNode.positioned) return;
                
                // Calculate child angle with fractal distribution
                let childAngle;
                if (numChildren === 1) {
                    // Single child continues in similar direction with slight variation
                    childAngle = actualAngle + (seededRandom() - 0.5) * Math.PI / 6;
                } else {
                    // Multiple children spread in fractal pattern
                    const angleStep = childAngleSpread / Math.max(1, numChildren - 1);
                    const baseChildAngle = actualAngle - childAngleSpread / 2 + childIndex * angleStep;
                    
                    // Add fractal self-similarity variations
                    const fractalVariation = (seededRandom() - 0.5) * Math.PI / 8;
                    childAngle = baseChildAngle + fractalVariation;
                }
                
                // Recursive fractal branch generation
                this.generateFractalBranch(
                    childNode,
                    skillNode.skill.position,
                    childAngle,
                    depth + 1,
                    childBranchLength,
                    angleSpread,
                    categoryTier,
                    seededRandom
                );
            });
        }
    }

    /**
     * Calculate enhanced organic position for mycelium growth
     */
    calculateEnhancedMyceliumGrowth(parentPos, angle, depth, categoryCenter, threadId, seededRandom) {
        // More realistic mycelium growth with thread-specific behavior
        const baseDistance = this.minDistance * (1.2 + depth * 0.3);
        const distanceVariation = (seededRandom() - 0.5) * 30;
        const distance = Math.max(this.minDistance, baseDistance + distanceVariation);
        
        // Calculate base position using growth angle with mycelium-like meandering
        const meanderingStrength = 0.4 * (1 + depth * 0.1);
        const meander = (seededRandom() - 0.5) * meanderingStrength;
        const actualAngle = angle + meander;
        
        let x = parentPos.x + Math.cos(actualAngle) * distance;
        let y = parentPos.y + Math.sin(actualAngle) * distance;
        
        // Apply environmental influences (nutrient gradients)
        const environmentalInfluence = 0.2;
        const environmentX = Math.cos(threadId * 1.7) * environmentalInfluence * distance;
        const environmentY = Math.sin(threadId * 1.7) * environmentalInfluence * distance;
        
        x += environmentX;
        y += environmentY;
        
        // Apply mycelium-specific wandering behavior
        const wanderStrength = 0.25 * (1 - depth * 0.05); // Less wandering at deeper levels
        x += (seededRandom() - 0.5) * distance * wanderStrength;
        y += (seededRandom() - 0.5) * distance * wanderStrength;
        
        // Subtle attraction to category center to maintain network cohesion
        const toCenterX = categoryCenter.x - x;
        const toCenterY = categoryCenter.y - y;
        const centerDistance = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
        
        if (centerDistance > 350) {
            const pullStrength = 0.08;
            x += toCenterX * pullStrength;
            y += toCenterY * pullStrength;
        }
        
        // Ensure position stays within bounds
        x = Math.max(this.nodeRadius * 2, Math.min(this.canvasWidth - this.nodeRadius * 2, x));
        y = Math.max(this.nodeRadius * 2, Math.min(this.canvasHeight - this.nodeRadius * 2, y));
        
        return { x, y };
    }

    /**
     * Apply enhanced force-directed positioning to eliminate overlaps with better spacing
     */
    applyEnhancedForceDirectedLayout() {
        const allSkills = this.skillData.getAllSkills();
        const enhancedMinDistance = this.minDistance * 1.2; // Increased minimum distance for better spacing
        const maxForceIterations = this.maxIterations * 1.5; // More iterations for better convergence
        
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
}

// Export for use in other modules
window.SkillTree = SkillTree;