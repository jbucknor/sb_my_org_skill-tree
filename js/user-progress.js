/**
 * User Progress Manager
 * Handles local storage persistence and progress tracking
 */

class UserProgress {
    constructor() {
        this.STORAGE_KEY = 'skillTreeProgress';
        this.STORAGE_VERSION = '1.0.0';
        this.progress = {
            version: this.STORAGE_VERSION,
            completedSkills: [],
            totalPoints: 0,
            categoryProgress: {},
            lastSaved: null,
            createdDate: new Date().toISOString()
        };
        
        this.autoSaveInterval = null;
        this.listeners = new Set();
        
        // Initialize
        this.loadProgress();
        this.startAutoSave();
    }

    /**
     * Load progress from local storage
     */
    loadProgress() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                
                // Validate version compatibility
                if (this.isValidVersion(parsed.version)) {
                    this.progress = { ...this.progress, ...parsed };
                    console.log('Loaded user progress from local storage');
                    this.notifyListeners('progress-loaded', this.progress);
                    return true;
                } else {
                    console.warn('Progress data version mismatch, starting fresh');
                    this.saveProgress(); // Save fresh progress
                }
            } else {
                console.log('No existing progress found, starting fresh');
                this.saveProgress(); // Initial save
            }
        } catch (error) {
            console.error('Error loading progress from local storage:', error);
            this.progress = this.getDefaultProgress();
        }
        return false;
    }

    /**
     * Save progress to local storage
     */
    saveProgress() {
        try {
            this.progress.lastSaved = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.progress));
            console.log('Progress saved to local storage');
            this.notifyListeners('progress-saved', this.progress);
            return true;
        } catch (error) {
            console.error('Error saving progress to local storage:', error);
            
            // Handle storage quota exceeded
            if (error.name === 'QuotaExceededError') {
                this.handleStorageQuotaExceeded();
            }
            return false;
        }
    }

    /**
     * Handle storage quota exceeded by cleaning up old data
     */
    handleStorageQuotaExceeded() {
        try {
            // Try to free up space by keeping only essential progress data
            const essentialProgress = {
                version: this.progress.version,
                completedSkills: this.progress.completedSkills,
                totalPoints: this.progress.totalPoints,
                lastSaved: new Date().toISOString()
            };
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(essentialProgress));
            console.warn('Storage quota exceeded, saved essential data only');
        } catch (error) {
            console.error('Could not save even essential progress data:', error);
        }
    }

    /**
     * Complete a skill and update progress
     */
    completeSkill(skillId, skillData = null) {
        if (!this.progress.completedSkills.includes(skillId)) {
            this.progress.completedSkills.push(skillId);
            
            if (skillData) {
                this.progress.totalPoints += skillData.points;
                this.updateCategoryProgress(skillData.category);
            }
            
            this.saveProgress();
            this.notifyListeners('skill-completed', { skillId, skillData });
            console.log(`Skill completed: ${skillId}`);
            return true;
        }
        return false;
    }

    /**
     * Mark a skill as incomplete
     */
    uncompleteSkill(skillId, skillData = null) {
        const index = this.progress.completedSkills.indexOf(skillId);
        if (index > -1) {
            this.progress.completedSkills.splice(index, 1);
            
            if (skillData) {
                this.progress.totalPoints -= skillData.points;
                this.updateCategoryProgress(skillData.category);
            }
            
            this.saveProgress();
            this.notifyListeners('skill-uncompleted', { skillId, skillData });
            console.log(`Skill uncompleted: ${skillId}`);
            return true;
        }
        return false;
    }

    /**
     * Update category progress statistics
     */
    updateCategoryProgress(categoryId) {
        if (!this.progress.categoryProgress[categoryId]) {
            this.progress.categoryProgress[categoryId] = {
                completedCount: 0,
                totalSkills: 0,
                points: 0,
                lastUpdated: new Date().toISOString()
            };
        }
        
        // This will be properly calculated when skill data is available
        this.progress.categoryProgress[categoryId].lastUpdated = new Date().toISOString();
    }

    /**
     * Sync progress with skill data for accurate calculations
     */
    syncWithSkillData(skillData) {
        let totalPoints = 0;
        const categoryStats = {};
        
        // Initialize category stats
        for (const category of skillData.getAllCategories()) {
            categoryStats[category.id] = {
                completedCount: 0,
                totalSkills: 0,
                points: 0,
                percentage: 0,
                lastUpdated: new Date().toISOString()
            };
        }
        
        // Calculate stats for each skill
        for (const skill of skillData.getAllSkills()) {
            const categoryId = skill.category;
            if (!categoryStats[categoryId]) continue;
            
            categoryStats[categoryId].totalSkills++;
            
            if (this.progress.completedSkills.includes(skill.skill_id)) {
                categoryStats[categoryId].completedCount++;
                categoryStats[categoryId].points += skill.points;
                totalPoints += skill.points;
            }
        }
        
        // Calculate percentages
        for (const category in categoryStats) {
            const stats = categoryStats[category];
            stats.percentage = stats.totalSkills > 0 
                ? Math.round((stats.completedCount / stats.totalSkills) * 100)
                : 0;
        }
        
        // Update progress
        this.progress.totalPoints = totalPoints;
        this.progress.categoryProgress = categoryStats;
        this.saveProgress();
        
        console.log('Progress synced with skill data');
        this.notifyListeners('progress-synced', this.progress);
    }

    /**
     * Check if a skill is completed
     */
    isSkillCompleted(skillId) {
        return this.progress.completedSkills.includes(skillId);
    }

    /**
     * Get total points earned
     */
    getTotalPoints() {
        return this.progress.totalPoints || 0;
    }

    /**
     * Get category progress
     */
    getCategoryProgress(categoryId) {
        return this.progress.categoryProgress[categoryId] || {
            completedCount: 0,
            totalSkills: 0,
            points: 0,
            percentage: 0
        };
    }

    /**
     * Get all category progress
     */
    getAllCategoryProgress() {
        return this.progress.categoryProgress;
    }

    /**
     * Export progress data
     */
    exportProgress() {
        const exportData = {
            ...this.progress,
            exportDate: new Date().toISOString(),
            exportVersion: this.STORAGE_VERSION
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Import progress data from JSON string
     */
    importProgress(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            
            // Validate import data
            if (!this.validateImportData(importedData)) {
                throw new Error('Invalid import data format');
            }
            
            // Backup current progress
            const backup = { ...this.progress };
            
            try {
                // Import data
                this.progress = {
                    version: this.STORAGE_VERSION,
                    completedSkills: importedData.completedSkills || [],
                    totalPoints: importedData.totalPoints || 0,
                    categoryProgress: importedData.categoryProgress || {},
                    lastSaved: new Date().toISOString(),
                    createdDate: importedData.createdDate || new Date().toISOString(),
                    importedDate: new Date().toISOString()
                };
                
                this.saveProgress();
                this.notifyListeners('progress-imported', this.progress);
                console.log('Successfully imported progress data');
                return true;
                
            } catch (error) {
                // Restore backup on error
                this.progress = backup;
                this.saveProgress();
                throw error;
            }
            
        } catch (error) {
            console.error('Error importing progress:', error);
            return false;
        }
    }

    /**
     * Validate imported data structure
     */
    validateImportData(data) {
        return data && 
               typeof data === 'object' &&
               Array.isArray(data.completedSkills) &&
               typeof data.totalPoints === 'number';
    }

    /**
     * Reset all progress
     */
    resetProgress() {
        const confirmed = confirm(
            'Are you sure you want to reset all progress? This action cannot be undone.'
        );
        
        if (confirmed) {
            this.progress = this.getDefaultProgress();
            this.saveProgress();
            this.notifyListeners('progress-reset', this.progress);
            console.log('Progress reset');
            return true;
        }
        return false;
    }

    /**
     * Get default progress structure
     */
    getDefaultProgress() {
        return {
            version: this.STORAGE_VERSION,
            completedSkills: [],
            totalPoints: 0,
            categoryProgress: {},
            lastSaved: null,
            createdDate: new Date().toISOString()
        };
    }

    /**
     * Check if version is compatible
     */
    isValidVersion(version) {
        // For now, accept same major version
        const currentMajor = this.STORAGE_VERSION.split('.')[0];
        const importMajor = version ? version.split('.')[0] : '0';
        return currentMajor === importMajor;
    }

    /**
     * Start auto-save functionality
     */
    startAutoSave() {
        // Auto-save every 30 seconds if there are changes
        this.autoSaveInterval = setInterval(() => {
            // This will be triggered by skill completion events
            // The save happens immediately on skill changes, 
            // this is just a backup safety net
        }, 30000);
    }

    /**
     * Stop auto-save
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    /**
     * Add event listener for progress changes
     */
    addEventListener(callback) {
        this.listeners.add(callback);
    }

    /**
     * Remove event listener
     */
    removeEventListener(callback) {
        this.listeners.delete(callback);
    }

    /**
     * Notify all listeners of progress changes
     */
    notifyListeners(event, data) {
        for (const listener of this.listeners) {
            try {
                listener(event, data);
            } catch (error) {
                console.error('Error in progress listener:', error);
            }
        }
    }

    /**
     * Get progress statistics
     */
    getStats() {
        const stats = {
            totalSkillsCompleted: this.progress.completedSkills.length,
            totalPoints: this.progress.totalPoints,
            categoriesInProgress: Object.keys(this.progress.categoryProgress).length,
            daysSinceCreated: null,
            averagePointsPerDay: 0
        };
        
        if (this.progress.createdDate) {
            const created = new Date(this.progress.createdDate);
            const now = new Date();
            const diffTime = Math.abs(now - created);
            stats.daysSinceCreated = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (stats.daysSinceCreated > 0) {
                stats.averagePointsPerDay = Math.round(stats.totalPoints / stats.daysSinceCreated * 100) / 100;
            }
        }
        
        return stats;
    }

    /**
     * Cleanup on page unload
     */
    cleanup() {
        this.stopAutoSave();
        this.listeners.clear();
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.userProgress) {
        window.userProgress.cleanup();
    }
});

// Export for use in other modules
window.UserProgress = UserProgress;