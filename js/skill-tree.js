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
        this.categorySpacing = 600;
        this.skillSpacing = 150; // Increased spacing to prevent overlap
        this.treeDepth = 200;
        
        // Initialize layout
        this.calculateLayout();
    }

    /**
     * Calculate positions for all skills based on dependencies
     */
    calculateLayout() {
        if (!this.skillData || !this.skillData.initialized) return;

        const categories = this.skillData.getAllCategories();
        
        // Position categories in a circular layout with more spacing
        const centerX = 800;
        const centerY = 600;
        const radius = 500;
        
        categories.forEach((category, index) => {
            const angle = (index / categories.length) * Math.PI * 2 - Math.PI / 2;
            category.position = {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            };
            
            // Layout skills within each category
            this.layoutCategorySkills(category);
        });

        // Resolve overlaps between skills from different categories
        this.resolveSkillOverlaps();
    }

    /**
     * Layout skills within a category using tree-like branching
     */
    layoutCategorySkills(category) {
        const skills = this.skillData.getSkillsByCategory(category.id);
        if (skills.length === 0) return;

        // Find root skills (no prerequisites)
        const rootSkills = skills.filter(skill => 
            !skill.prerequisites || skill.prerequisites.length === 0
        );

        // Create a tree structure mapping each skill to its children
        const skillTree = new Map();
        skills.forEach(skill => {
            skillTree.set(skill.skill_id, {
                skill: skill,
                children: [],
                positioned: false
            });
        });

        // Build parent-child relationships
        skills.forEach(skill => {
            if (skill.unlocks) {
                skill.unlocks.forEach(childId => {
                    const childNode = skillTree.get(childId);
                    if (childNode && skillTree.has(skill.skill_id)) {
                        skillTree.get(skill.skill_id).children.push(childNode);
                    }
                });
            }
        });

        // Position skills in tree branches radiating from category center
        const branchAngleStep = (Math.PI * 2) / Math.max(rootSkills.length, 1);
        const baseDistance = this.skillSpacing;
        
        rootSkills.forEach((rootSkill, rootIndex) => {
            const branchAngle = (rootIndex * branchAngleStep) - Math.PI/2; // Start from top
            this.layoutSkillBranch(
                skillTree.get(rootSkill.skill_id),
                category.position.x,
                category.position.y,
                branchAngle,
                baseDistance,
                0
            );
        });
    }

    /**
     * Recursively layout a branch of skills
     */
    layoutSkillBranch(node, originX, originY, angle, distance, depth) {
        if (!node || node.positioned) return;

        // Calculate position for this skill
        const x = originX + Math.cos(angle) * distance;
        const y = originY + Math.sin(angle) * distance;
        
        node.skill.position = { x, y };
        node.positioned = true;

        // Position children in sub-branches
        if (node.children.length > 0) {
            const childDistance = distance + this.skillSpacing;
            const maxSpread = Math.PI / 3; // 60 degrees max spread for children
            const childAngleStep = node.children.length > 1 ? 
                maxSpread / (node.children.length - 1) : 0;
            const startAngle = angle - maxSpread / 2;

            node.children.forEach((childNode, childIndex) => {
                const childAngle = startAngle + (childIndex * childAngleStep);
                this.layoutSkillBranch(
                    childNode,
                    originX,
                    originY,
                    childAngle,
                    childDistance,
                    depth + 1
                );
            });
        }
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
     * Resolve overlaps between skills from different categories
     */
    resolveSkillOverlaps() {
        const allSkills = this.skillData.getAllSkills();
        const nodeRadius = 25; // Approximate visual radius of skill nodes
        const minDistance = nodeRadius * 2 + 10; // Minimum distance between node centers
        
        // Group skills by category for efficient collision detection
        const skillsByCategory = new Map();
        allSkills.forEach(skill => {
            if (!skillsByCategory.has(skill.category)) {
                skillsByCategory.set(skill.category, []);
            }
            skillsByCategory.get(skill.category).push(skill);
        });
        
        // Check for overlaps between different categories
        const categories = Array.from(skillsByCategory.keys());
        let resolved = 0;
        
        for (let i = 0; i < categories.length; i++) {
            for (let j = i + 1; j < categories.length; j++) {
                const category1Skills = skillsByCategory.get(categories[i]);
                const category2Skills = skillsByCategory.get(categories[j]);
                
                // Check each skill in category1 against each skill in category2
                for (const skill1 of category1Skills) {
                    for (const skill2 of category2Skills) {
                        const distance = Math.sqrt(
                            Math.pow(skill1.position.x - skill2.position.x, 2) +
                            Math.pow(skill1.position.y - skill2.position.y, 2)
                        );
                        
                        if (distance < minDistance) {
                            // Resolve overlap by moving skills away from each other
                            this.resolveSkillPairOverlap(skill1, skill2, minDistance);
                            resolved++;
                        }
                    }
                }
            }
        }
        
        if (resolved > 0) {
            console.log(`Resolved ${resolved} skill overlaps between categories`);
        }
    }

    /**
     * Resolve overlap between two specific skills
     */
    resolveSkillPairOverlap(skill1, skill2, minDistance) {
        // Calculate the vector from skill1 to skill2
        const dx = skill2.position.x - skill1.position.x;
        const dy = skill2.position.y - skill1.position.y;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        
        if (currentDistance === 0) {
            // Skills are at exactly the same position, create artificial separation
            skill1.position.x -= 5;
            skill2.position.x += 5;
            return;
        }
        
        // Calculate how much to move each skill
        const pushDistance = (minDistance - currentDistance) / 2;
        
        // Normalize the direction vector
        const normalizedDx = dx / currentDistance;
        const normalizedDy = dy / currentDistance;
        
        // Get category positions to determine push direction preference  
        const category1 = this.skillData.getCategory(skill1.category);
        const category2 = this.skillData.getCategory(skill2.category);
        
        // Push skills toward their respective category centers
        const toCat1X = category1.position.x - skill1.position.x;
        const toCat1Y = category1.position.y - skill1.position.y;
        const toCat2X = category2.position.x - skill2.position.x;
        const toCat2Y = category2.position.y - skill2.position.y;
        
        // If we can push toward category centers, do that; otherwise push directly away
        const cat1Distance = Math.sqrt(toCat1X * toCat1X + toCat1Y * toCat1Y);
        const cat2Distance = Math.sqrt(toCat2X * toCat2X + toCat2Y * toCat2Y);
        
        if (cat1Distance > 10) {
            // Push skill1 toward its category center
            skill1.position.x += (toCat1X / cat1Distance) * pushDistance * 0.3;
            skill1.position.y += (toCat1Y / cat1Distance) * pushDistance * 0.3;
        } else {
            // Push skill1 away from skill2
            skill1.position.x -= normalizedDx * pushDistance;
            skill1.position.y -= normalizedDy * pushDistance;
        }
        
        if (cat2Distance > 10) {
            // Push skill2 toward its category center  
            skill2.position.x += (toCat2X / cat2Distance) * pushDistance * 0.3;
            skill2.position.y += (toCat2Y / cat2Distance) * pushDistance * 0.3;
        } else {
            // Push skill2 away from skill1
            skill2.position.x += normalizedDx * pushDistance;
            skill2.position.y += normalizedDy * pushDistance;
        }
    }
}

// Export for use in other modules
window.SkillTree = SkillTree;