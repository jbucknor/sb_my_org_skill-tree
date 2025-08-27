/**
 * Import/Export Controller
 * Handles data import/export functionality with validation
 */

class ImportExportController {
    constructor(userProgress, skillData) {
        this.userProgress = userProgress;
        this.skillData = skillData;
        this.supportedFormats = ['json'];
        this.currentVersion = '1.0.0';
    }

    /**
     * Export user progress to JSON format
     */
    exportProgress() {
        try {
            const exportData = {
                metadata: {
                    version: this.currentVersion,
                    exportDate: new Date().toISOString(),
                    appName: 'Life Skills Skill Tree',
                    description: 'Exported skill tree progress data'
                },
                progress: {
                    completedSkills: this.userProgress.progress.completedSkills,
                    totalPoints: this.userProgress.progress.totalPoints,
                    categoryProgress: this.userProgress.progress.categoryProgress,
                    createdDate: this.userProgress.progress.createdDate,
                    lastSaved: this.userProgress.progress.lastSaved
                },
                statistics: this.generateExportStatistics(),
                skillTree: this.exportSkillTreeStructure()
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            return {
                success: true,
                data: jsonString,
                filename: this.generateFilename(),
                size: new Blob([jsonString]).size
            };

        } catch (error) {
            console.error('Export error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Import user progress from JSON data
     */
    importProgress(jsonData) {
        try {
            // Parse and validate JSON
            const importData = JSON.parse(jsonData);
            const validation = this.validateImportData(importData);
            
            if (!validation.valid) {
                return {
                    success: false,
                    error: `Invalid import data: ${validation.errors.join(', ')}`
                };
            }

            // Check version compatibility
            if (!this.isVersionCompatible(importData.metadata?.version)) {
                return {
                    success: false,
                    error: 'Incompatible version. Please export from a compatible version.'
                };
            }

            // Create backup of current progress
            const backup = this.createBackup();

            try {
                // Import the progress data
                const result = this.performImport(importData);
                
                if (result.success) {
                    // Sync with skill data
                    this.userProgress.syncWithSkillData(this.skillData);
                    this.skillData.importData(importData.progress);
                    
                    return {
                        success: true,
                        message: 'Progress imported successfully!',
                        statistics: result.statistics
                    };
                } else {
                    // Restore backup on failure
                    this.restoreBackup(backup);
                    return result;
                }

            } catch (error) {
                // Restore backup on error
                this.restoreBackup(backup);
                throw error;
            }

        } catch (error) {
            console.error('Import error:', error);
            return {
                success: false,
                error: `Failed to import: ${error.message}`
            };
        }
    }

    /**
     * Validate import data structure
     */
    validateImportData(data) {
        const errors = [];

        // Check basic structure
        if (!data || typeof data !== 'object') {
            errors.push('Invalid data format');
            return { valid: false, errors };
        }

        // Check metadata
        if (!data.metadata) {
            errors.push('Missing metadata');
        } else {
            if (!data.metadata.version) {
                errors.push('Missing version information');
            }
            if (!data.metadata.exportDate) {
                errors.push('Missing export date');
            }
        }

        // Check progress data
        if (!data.progress) {
            errors.push('Missing progress data');
        } else {
            if (!Array.isArray(data.progress.completedSkills)) {
                errors.push('Invalid completed skills data');
            }
            if (typeof data.progress.totalPoints !== 'number') {
                errors.push('Invalid total points data');
            }
            if (!data.progress.categoryProgress || typeof data.progress.categoryProgress !== 'object') {
                errors.push('Invalid category progress data');
            }
        }

        // Validate skill IDs exist in current skill tree
        if (data.progress && Array.isArray(data.progress.completedSkills)) {
            const invalidSkills = data.progress.completedSkills.filter(skillId => {
                return !this.skillData.getSkill(skillId);
            });
            
            if (invalidSkills.length > 0) {
                errors.push(`Unknown skills: ${invalidSkills.join(', ')}`);
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Check if import version is compatible
     */
    isVersionCompatible(importVersion) {
        if (!importVersion) return false;
        
        const currentMajor = this.currentVersion.split('.')[0];
        const importMajor = importVersion.split('.')[0];
        
        // Same major version is compatible
        return currentMajor === importMajor;
    }

    /**
     * Perform the actual import operation
     */
    performImport(importData) {
        const progressData = importData.progress;
        
        // Calculate what's being imported
        const currentCompleted = new Set(this.userProgress.progress.completedSkills);
        const importCompleted = new Set(progressData.completedSkills);
        
        const newSkills = progressData.completedSkills.filter(id => !currentCompleted.has(id));
        const lostSkills = this.userProgress.progress.completedSkills.filter(id => !importCompleted.has(id));
        
        // Update progress
        this.userProgress.progress.completedSkills = [...progressData.completedSkills];
        this.userProgress.progress.totalPoints = progressData.totalPoints;
        this.userProgress.progress.categoryProgress = { ...progressData.categoryProgress };
        
        // Preserve creation date if not in import
        if (progressData.createdDate) {
            this.userProgress.progress.createdDate = progressData.createdDate;
        }
        
        // Update last saved
        this.userProgress.progress.lastSaved = new Date().toISOString();
        
        // Save to storage
        this.userProgress.saveProgress();
        
        return {
            success: true,
            statistics: {
                totalSkillsImported: progressData.completedSkills.length,
                newSkillsAdded: newSkills.length,
                skillsRemoved: lostSkills.length,
                totalPoints: progressData.totalPoints,
                categoriesUpdated: Object.keys(progressData.categoryProgress).length
            }
        };
    }

    /**
     * Create backup of current progress
     */
    createBackup() {
        return {
            progress: JSON.parse(JSON.stringify(this.userProgress.progress)),
            timestamp: Date.now()
        };
    }

    /**
     * Restore from backup
     */
    restoreBackup(backup) {
        if (backup && backup.progress) {
            this.userProgress.progress = backup.progress;
            this.userProgress.saveProgress();
        }
    }

    /**
     * Generate export statistics
     */
    generateExportStatistics() {
        const stats = this.userProgress.getStats();
        const treeStats = this.skillData ? {
            totalSkillsAvailable: this.skillData.getAllSkills().length,
            categoriesAvailable: this.skillData.getAllCategories().length
        } : {};

        return {
            ...stats,
            ...treeStats,
            completionPercentage: this.skillData ? 
                Math.round((stats.totalSkillsCompleted / this.skillData.getAllSkills().length) * 100) : 0,
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Export skill tree structure (for reference)
     */
    exportSkillTreeStructure() {
        if (!this.skillData) return null;

        return {
            version: this.skillData.schema_version,
            categories: this.skillData.getAllCategories().map(cat => ({
                id: cat.id,
                name: cat.name,
                icon: cat.icon,
                description: cat.description
            })),
            totalSkills: this.skillData.getAllSkills().length,
            skillsByCategory: this.skillData.getAllCategories().reduce((acc, cat) => {
                acc[cat.id] = this.skillData.getSkillsByCategory(cat.id).length;
                return acc;
            }, {})
        };
    }

    /**
     * Generate filename for export
     */
    generateFilename() {
        const date = new Date();
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeString = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
        return `skill-tree-progress-${dateString}-${timeString}.json`;
    }

    /**
     * Download progress as file
     */
    downloadProgress() {
        const exportResult = this.exportProgress();
        
        if (!exportResult.success) {
            throw new Error(exportResult.error);
        }

        // Create blob and download
        const blob = new Blob([exportResult.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = exportResult.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up object URL
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        return {
            success: true,
            filename: exportResult.filename,
            size: exportResult.size
        };
    }

    /**
     * Import progress from file
     */
    importFromFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file provided'));
                return;
            }

            // Check file type
            if (!file.name.toLowerCase().endsWith('.json')) {
                reject(new Error('Invalid file type. Please select a JSON file.'));
                return;
            }

            // Check file size (limit to 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                reject(new Error('File too large. Maximum size is 10MB.'));
                return;
            }

            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const result = this.importProgress(event.target.result);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * Create shareable progress link (future enhancement)
     */
    createShareableLink() {
        const exportResult = this.exportProgress();
        
        if (!exportResult.success) {
            return null;
        }

        // For now, just return the data for manual sharing
        // In the future, this could upload to a sharing service
        return {
            data: exportResult.data,
            suggestion: 'Copy this data and share it with others. They can import it using the Import function.'
        };
    }

    /**
     * Validate file before import
     */
    validateFile(file) {
        const errors = [];

        if (!file) {
            errors.push('No file selected');
        } else {
            if (!file.name.toLowerCase().endsWith('.json')) {
                errors.push('File must be a JSON file');
            }
            
            if (file.size === 0) {
                errors.push('File is empty');
            }
            
            if (file.size > 10 * 1024 * 1024) {
                errors.push('File is too large (maximum 10MB)');
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Get import/export statistics
     */
    getStatistics() {
        return {
            supportedFormats: this.supportedFormats,
            currentVersion: this.currentVersion,
            lastExport: localStorage.getItem('lastExportDate'),
            lastImport: localStorage.getItem('lastImportDate'),
            totalExports: parseInt(localStorage.getItem('totalExports') || '0'),
            totalImports: parseInt(localStorage.getItem('totalImports') || '0')
        };
    }

    /**
     * Update usage statistics
     */
    updateStatistics(action) {
        const now = new Date().toISOString();
        
        if (action === 'export') {
            localStorage.setItem('lastExportDate', now);
            const totalExports = parseInt(localStorage.getItem('totalExports') || '0') + 1;
            localStorage.setItem('totalExports', totalExports.toString());
        } else if (action === 'import') {
            localStorage.setItem('lastImportDate', now);
            const totalImports = parseInt(localStorage.getItem('totalImports') || '0') + 1;
            localStorage.setItem('totalImports', totalImports.toString());
        }
    }
}

// Export for use in other modules
window.ImportExportController = ImportExportController;