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
        this.skillSpacing = 120;
        this.treeDepth = 200;
        
        // Category collapse/expand state
        this.collapsedCategories = new Set();
        
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
    }

    /**
     * Layout skills within a category
     */
    layoutCategorySkills(category) {
        const skills = this.skillData.getSkillsByCategory(category.id);
        if (skills.length === 0) return;

        // Find root skills (no prerequisites)
        const rootSkills = skills.filter(skill => 
            !skill.prerequisites || skill.prerequisites.length === 0
        );

        // Position skills in layers based on dependencies
        const positioned = new Set();
        let currentLayer = 0;
        let skillsToPosition = [...rootSkills];

        while (skillsToPosition.length > 0 && currentLayer < 10) {
            const layerSkills = [...skillsToPosition];
            skillsToPosition = [];
            
            layerSkills.forEach((skill, index) => {
                if (positioned.has(skill.skill_id)) return;
                
                // Position skill relative to category center with improved spacing
                const layerOffset = currentLayer * this.skillSpacing;
                const skillsInLayer = layerSkills.length;
                
                // Calculate skill position in the layer with better distribution
                let skillX, skillY;
                
                if (skillsInLayer === 1) {
                    // Single skill centered on category
                    skillX = category.position.x;
                    skillY = category.position.y + layerOffset;
                } else {
                    // Multiple skills spread around category center
                    const angleStep = (Math.PI * 1.5) / Math.max(1, skillsInLayer - 1);
                    const startAngle = -Math.PI * 0.75; // Start from left side
                    const angle = startAngle + (index * angleStep);
                    const layerRadius = Math.min(this.skillSpacing * 0.8, skillsInLayer * 15);
                    
                    skillX = category.position.x + Math.cos(angle) * layerRadius;
                    skillY = category.position.y + layerOffset;
                }
                
                skill.position = { x: skillX, y: skillY };
                positioned.add(skill.skill_id);
                
                // Add dependent skills to next layer
                if (skill.unlocks) {
                    skill.unlocks.forEach(unlockedId => {
                        const unlockedSkill = this.skillData.getSkill(unlockedId);
                        if (unlockedSkill && !positioned.has(unlockedId)) {
                            skillsToPosition.push(unlockedSkill);
                        }
                    });
                }
            });
            
            currentLayer++;
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
     * Toggle category collapsed state
     */
    toggleCategoryCollapse(categoryId) {
        if (this.collapsedCategories.has(categoryId)) {
            this.collapsedCategories.delete(categoryId);
        } else {
            this.collapsedCategories.add(categoryId);
        }
        return !this.collapsedCategories.has(categoryId); // Return new expanded state
    }

    /**
     * Check if category is collapsed
     */
    isCategoryCollapsed(categoryId) {
        return this.collapsedCategories.has(categoryId);
    }

    /**
     * Expand all categories
     */
    expandAllCategories() {
        this.collapsedCategories.clear();
    }

    /**
     * Collapse all categories
     */
    collapseAllCategories() {
        const categories = this.skillData.getAllCategories();
        categories.forEach(category => {
            this.collapsedCategories.add(category.id);
        });
    }

    /**
     * Get visible skills (excludes skills from collapsed categories)
     */
    getVisibleSkillsFiltered(viewport) {
        const allVisible = this.getVisibleSkills(viewport);
        return allVisible.filter(skill => {
            return !this.collapsedCategories.has(skill.category);
        });
    }

    /**
     * Get skill connections for visible skills only
     */
    getVisibleSkillConnections() {
        const connections = this.getSkillConnections();
        return connections.filter(connection => {
            return !this.collapsedCategories.has(connection.from.category) && 
                   !this.collapsedCategories.has(connection.to.category);
        });
    }
}

// Export for use in other modules
window.SkillTree = SkillTree;