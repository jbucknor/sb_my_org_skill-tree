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
     * Calculate positions for all skills using mycelium-inspired organic growth
     */
    calculateLayout() {
        if (!this.skillData || !this.skillData.initialized) return;

        const categories = this.skillData.getAllCategories();
        
        // Phase 1: Establish category seed points using organic positioning
        this.establishCategorySeedPoints(categories);
        
        // Phase 2: Grow skill networks from each category using mycelium simulation
        this.growMyceliumNetworks(categories);
        
        // Phase 3: Apply force-directed positioning to eliminate overlaps
        this.applyForceDirectedLayout();
        
        // Phase 4: Optimize connection paths to prevent intersections
        this.optimizeConnectionPaths();
    }

    /**
     * Establish organic seed points for categories using mycelium-like positioning
     */
    establishCategorySeedPoints(categories) {
        const numCategories = categories.length;
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        
        // Use deterministic seeding for consistent layouts
        const seed = 42; // Fixed seed for reproducible results
        let randomState = seed;
        
        // Simple deterministic random number generator
        const seededRandom = () => {
            randomState = (randomState * 9301 + 49297) % 233280;
            return randomState / 233280;
        };
        
        // Use golden spiral for organic positioning instead of perfect circle
        const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle ~137.5 degrees
        
        categories.forEach((category, index) => {
            // Create organic offset using golden spiral with deterministic variations
            const r = Math.sqrt(index + 1) * this.categorySpacing / 3;
            const theta = index * goldenAngle;
            
            // Add organic randomness while maintaining overall structure
            const organicOffsetX = (seededRandom() - 0.5) * 150;
            const organicOffsetY = (seededRandom() - 0.5) * 150;
            
            category.position = {
                x: centerX + Math.cos(theta) * r + organicOffsetX,
                y: centerY + Math.sin(theta) * r + organicOffsetY
            };
            
            // Ensure positions stay within bounds
            category.position.x = Math.max(200, Math.min(this.canvasWidth - 200, category.position.x));
            category.position.y = Math.max(200, Math.min(this.canvasHeight - 200, category.position.y));
        });
    }
    /**
     * Grow mycelium networks from each category seed point
     */
    growMyceliumNetworks(categories) {
        // Use same seeded random for consistency
        let randomState = 42;
        const seededRandom = () => {
            randomState = (randomState * 9301 + 49297) % 233280;
            return randomState / 233280;
        };
        
        categories.forEach(category => {
            const categorySkills = this.skillData.getSkillsByCategory(category.id);
            if (categorySkills.length === 0) return;
            
            // Find root skills (no prerequisites)
            const rootSkills = categorySkills.filter(skill => 
                !skill.prerequisites || skill.prerequisites.length === 0
            );
            
            // Create mycelium threads from root skills
            const myceliumThreads = rootSkills.map((skill, index) => ({
                skill: skill,
                parentPosition: category.position,
                depth: 0,
                threadAngle: (index / rootSkills.length) * Math.PI * 2 + (seededRandom() - 0.5) * Math.PI / 3,
                threadId: index,
                branchCount: 0
            }));
            
            const positioned = new Set();
            
            while (myceliumThreads.length > 0) {
                const current = myceliumThreads.shift();
                
                if (positioned.has(current.skill.skill_id)) continue;
                
                // Calculate organic position using enhanced mycelium growth pattern
                const position = this.calculateEnhancedMyceliumGrowth(
                    current.parentPosition,
                    current.threadAngle,
                    current.depth,
                    category.position,
                    current.threadId,
                    seededRandom
                );
                
                current.skill.position = position;
                positioned.add(current.skill.skill_id);
                
                // Queue child skills for growth with realistic branching
                if (current.skill.unlocks) {
                    current.skill.unlocks.forEach((childId, childIndex) => {
                        const childSkill = this.skillData.getSkill(childId);
                        if (childSkill && childSkill.category === category.id && !positioned.has(childId)) {
                            // Create realistic mycelium branching patterns
                            const branchAngle = current.threadAngle + 
                                (seededRandom() - 0.5) * Math.PI / 2 * (1 - current.depth * 0.1);
                            
                            myceliumThreads.push({
                                skill: childSkill,
                                parentPosition: position,
                                depth: current.depth + 1,
                                threadAngle: branchAngle,
                                threadId: current.threadId,
                                branchCount: current.branchCount + 1
                            });
                        }
                    });
                }
            }
        });
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
     * Apply force-directed positioning to eliminate overlaps
     */
    applyForceDirectedLayout() {
        const allSkills = this.skillData.getAllSkills();
        
        for (let iteration = 0; iteration < this.maxIterations; iteration++) {
            let hasOverlaps = false;
            const forces = new Map();
            
            // Initialize forces for all skills
            allSkills.forEach(skill => {
                forces.set(skill.skill_id, { x: 0, y: 0 });
            });
            
            // Calculate repulsion forces between all nodes
            for (let i = 0; i < allSkills.length; i++) {
                for (let j = i + 1; j < allSkills.length; j++) {
                    const skill1 = allSkills[i];
                    const skill2 = allSkills[j];
                    
                    const dx = skill2.position.x - skill1.position.x;
                    const dy = skill2.position.y - skill1.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < this.minDistance) {
                        hasOverlaps = true;
                        
                        if (distance === 0) {
                            // Handle identical positions
                            const randomAngle = Math.random() * Math.PI * 2;
                            forces.get(skill1.skill_id).x -= Math.cos(randomAngle) * this.forceStrength;
                            forces.get(skill1.skill_id).y -= Math.sin(randomAngle) * this.forceStrength;
                            forces.get(skill2.skill_id).x += Math.cos(randomAngle) * this.forceStrength;
                            forces.get(skill2.skill_id).y += Math.sin(randomAngle) * this.forceStrength;
                        } else {
                            // Calculate repulsion force
                            const forceStrength = this.forceStrength * (this.minDistance - distance) / distance;
                            const forceX = (dx / distance) * forceStrength;
                            const forceY = (dy / distance) * forceStrength;
                            
                            forces.get(skill1.skill_id).x -= forceX;
                            forces.get(skill1.skill_id).y -= forceY;
                            forces.get(skill2.skill_id).x += forceX;
                            forces.get(skill2.skill_id).y += forceY;
                        }
                    }
                }
            }
            
            // Apply connection attraction forces (weaker)
            allSkills.forEach(skill => {
                if (skill.unlocks) {
                    skill.unlocks.forEach(childId => {
                        const childSkill = this.skillData.getSkill(childId);
                        if (childSkill) {
                            const dx = childSkill.position.x - skill.position.x;
                            const dy = childSkill.position.y - skill.position.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            
                            if (distance > this.minDistance * 1.5) {
                                const attractionStrength = 0.1;
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
            
            // Apply forces to positions with damping
            const damping = Math.max(0.1, 1.0 - iteration / this.maxIterations);
            allSkills.forEach(skill => {
                const force = forces.get(skill.skill_id);
                skill.position.x += force.x * damping;
                skill.position.y += force.y * damping;
                
                // Keep within bounds
                skill.position.x = Math.max(this.nodeRadius, Math.min(this.canvasWidth - this.nodeRadius, skill.position.x));
                skill.position.y = Math.max(this.nodeRadius, Math.min(this.canvasHeight - this.nodeRadius, skill.position.y));
            });
            
            // Early termination if no overlaps remain
            if (!hasOverlaps) {
                console.log(`Force simulation converged after ${iteration + 1} iterations`);
                break;
            }
        }
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