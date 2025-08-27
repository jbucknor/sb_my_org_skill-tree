/**
 * Main Application Controller
 * Orchestrates all components and handles application lifecycle
 */

class SkillTreeApp {
    constructor() {
        this.initialized = false;
        this.skillData = null;
        this.userProgress = null;
        this.canvasRenderer = null;
        this.currentModal = null;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            console.log('Initializing Skill Tree App...');
            
            // Show loading screen
            this.showLoadingScreen('Initializing application...');
            
            // Initialize data models
            await this.initializeDataModels();
            
            // Initialize UI components
            await this.initializeUI();
            
            // Setup event handlers
            this.setupEventHandlers();
            
            // Initial render
            this.render();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            console.log('Skill Tree App initialized successfully');
            this.initialized = true;
            
        } catch (error) {
            console.error('Error initializing application:', error);
            this.showErrorMessage('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Initialize data models
     */
    async initializeDataModels() {
        this.updateLoadingStatus('Loading skill data...');
        
        // Initialize skill data
        this.skillData = new SkillData();
        window.skillData = this.skillData;
        
        this.updateLoadingStatus('Loading user progress...');
        
        // Initialize user progress
        this.userProgress = new UserProgress();
        window.userProgress = this.userProgress;
        
        // Sync progress with skill data
        this.userProgress.syncWithSkillData(this.skillData);
        
        // Listen for progress changes
        this.userProgress.addEventListener((event, data) => {
            this.handleProgressEvent(event, data);
        });
        
        console.log('Data models initialized');
    }

    /**
     * Initialize UI components
     */
    async initializeUI() {
        this.updateLoadingStatus('Setting up user interface...');
        
        // Initialize canvas renderer
        const canvas = document.getElementById('skill-tree-canvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }
        
        this.canvasRenderer = new CanvasRenderer(canvas);
        window.canvasRenderer = this.canvasRenderer;
        
        // Initialize navigation controls
        this.initializeNavigation();
        
        // Initialize progress display
        this.updateProgressDisplay();
        
        // Initialize category navigation
        this.initializeCategoryNavigation();
        
        // Initialize modals
        this.initializeModals();
        
        console.log('UI components initialized');
    }

    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // Navigation controls
        const zoomInBtn = document.getElementById('zoom-in-btn');
        const zoomOutBtn = document.getElementById('zoom-out-btn');
        const resetViewBtn = document.getElementById('reset-view-btn');
        const exportBtn = document.getElementById('export-btn');
        const importBtn = document.getElementById('import-btn');
        
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => this.handleZoomIn());
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => this.handleZoomOut());
        }
        
        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => this.handleResetView());
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.handleExport());
        }
        
        if (importBtn) {
            importBtn.addEventListener('click', () => this.handleImport());
        }
        
        // Category navigation
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.handleCategoryClick(category);
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
        
        // Window events
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        console.log('Event handlers setup complete');
    }

    /**
     * Initialize navigation controls
     */
    initializeNavigation() {
        // Enable canvas focus for keyboard navigation
        const canvas = document.getElementById('skill-tree-canvas');
        if (canvas) {
            canvas.setAttribute('tabindex', '0');
        }
    }

    /**
     * Initialize category navigation
     */
    initializeCategoryNavigation() {
        const categoryList = document.getElementById('category-list');
        if (!categoryList) return;
        
        // Update category buttons with progress indicators
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            const categoryId = btn.dataset.category;
            const progress = this.userProgress.getCategoryProgress(categoryId);
            
            // Add progress indicator (could be enhanced with visual elements)
            if (progress.percentage > 0) {
                btn.classList.add('has-progress');
                btn.setAttribute('title', `${progress.percentage}% complete`);
            }
        });
    }

    /**
     * Initialize modal components
     */
    initializeModals() {
        const modal = document.getElementById('skill-modal');
        const closeBtn = document.getElementById('close-modal');
        const completeBtn = document.getElementById('complete-skill-btn');
        const uncompleteBtn = document.getElementById('uncomplete-skill-btn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideSkillModal());
        }
        
        if (completeBtn) {
            completeBtn.addEventListener('click', () => this.handleSkillComplete());
        }
        
        if (uncompleteBtn) {
            uncompleteBtn.addEventListener('click', () => this.handleSkillUncomplete());
        }
        
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.hideSkillModal();
            }
        });
        
        // Close modal on backdrop click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideSkillModal();
                }
            });
        }
    }

    /**
     * Show skill modal
     */
    showSkillModal(skill) {
        const modal = document.getElementById('skill-modal');
        const title = document.getElementById('skill-modal-title');
        const info = document.getElementById('skill-info');
        const completeBtn = document.getElementById('complete-skill-btn');
        const uncompleteBtn = document.getElementById('uncomplete-skill-btn');
        
        if (!modal || !skill) return;
        
        this.currentModal = skill;
        
        // Update modal content
        if (title) {
            title.textContent = skill.name;
        }
        
        if (info) {
            const isCompleted = this.userProgress.isSkillCompleted(skill.skill_id);
            const canComplete = skill.unlocked && !isCompleted;
            
            info.innerHTML = `
                <h3>${skill.name}</h3>
                <p>${skill.description}</p>
                
                <div class="skill-meta">
                    <div class="meta-item">
                        <div class="meta-label">Points</div>
                        <div class="meta-value">${skill.points}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Time Required</div>
                        <div class="meta-value">${skill.timeRequired}</div>
                    </div>
                </div>
                
                ${skill.achievements ? `
                    <h4>Achievements:</h4>
                    <ul>
                        ${skill.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                    </ul>
                ` : ''}
                
                ${skill.prerequisites && skill.prerequisites.length > 0 ? `
                    <h4>Prerequisites:</h4>
                    <ul>
                        ${skill.prerequisites.map(prereqId => {
                            const prereqSkill = this.skillData.getSkill(prereqId);
                            const isPrereqCompleted = this.userProgress.isSkillCompleted(prereqId);
                            return prereqSkill ? `
                                <li class="${isPrereqCompleted ? 'completed' : 'incomplete'}">
                                    ${prereqSkill.name} ${isPrereqCompleted ? '✅' : '❌'}
                                </li>
                            ` : '';
                        }).join('')}
                    </ul>
                ` : ''}
            `;
        }
        
        // Update buttons
        if (completeBtn && uncompleteBtn) {
            const isCompleted = this.userProgress.isSkillCompleted(skill.skill_id);
            
            if (isCompleted) {
                completeBtn.style.display = 'none';
                uncompleteBtn.style.display = 'inline-block';
            } else {
                completeBtn.style.display = 'inline-block';
                completeBtn.disabled = !skill.unlocked;
                uncompleteBtn.style.display = 'none';
                
                if (!skill.unlocked) {
                    completeBtn.textContent = 'Prerequisites Required';
                } else {
                    completeBtn.textContent = 'Mark as Completed';
                }
            }
        }
        
        // Show modal
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus on close button for accessibility
        if (document.getElementById('close-modal')) {
            setTimeout(() => document.getElementById('close-modal').focus(), 100);
        }
    }

    /**
     * Hide skill modal
     */
    hideSkillModal() {
        const modal = document.getElementById('skill-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
        this.currentModal = null;
    }

    /**
     * Handle skill completion
     */
    handleSkillComplete() {
        if (!this.currentModal) return;
        
        const skill = this.currentModal;
        
        // Complete skill in data model
        const success = this.skillData.completeSkill(skill.skill_id);
        if (success) {
            // Update user progress
            this.userProgress.completeSkill(skill.skill_id, skill);
            
            // Add visual effect
            this.canvasRenderer.addCompletionEffect(skill);
            
            // Update UI
            this.updateProgressDisplay();
            this.render();
            
            // Update modal
            this.showSkillModal(skill);
            
            console.log(`Skill completed: ${skill.name}`);
        }
    }

    /**
     * Handle skill uncompletion
     */
    handleSkillUncomplete() {
        if (!this.currentModal) return;
        
        const skill = this.currentModal;
        
        // Uncomplete skill in data model
        const success = this.skillData.uncompleteSkill(skill.skill_id);
        if (success) {
            // Update user progress
            this.userProgress.uncompleteSkill(skill.skill_id, skill);
            
            // Update UI
            this.updateProgressDisplay();
            this.render();
            
            // Update modal
            this.showSkillModal(skill);
            
            console.log(`Skill uncompleted: ${skill.name}`);
        }
    }

    /**
     * Handle progress events
     */
    handleProgressEvent(event, data) {
        switch (event) {
            case 'skill-completed':
            case 'skill-uncompleted':
                this.updateProgressDisplay();
                this.render();
                break;
            case 'progress-imported':
                this.updateProgressDisplay();
                this.render();
                console.log('Progress imported successfully');
                break;
            case 'progress-reset':
                this.updateProgressDisplay();
                this.render();
                console.log('Progress reset');
                break;
        }
    }

    /**
     * Update progress display
     */
    updateProgressDisplay() {
        // Update total points
        const totalPointsElement = document.getElementById('total-points');
        if (totalPointsElement) {
            totalPointsElement.textContent = this.userProgress.getTotalPoints();
        }
        
        // Update category progress
        const categoryProgressElement = document.getElementById('category-progress');
        if (categoryProgressElement) {
            const categories = this.skillData.getAllCategories();
            
            categoryProgressElement.innerHTML = categories.map(category => {
                const progress = this.userProgress.getCategoryProgress(category.id);
                return `
                    <div class="category-progress-item">
                        <div class="category-name">${category.name}</div>
                        <div class="progress-bar">
                            <div class="progress-fill ${category.id}" style="width: ${progress.percentage}%"></div>
                        </div>
                        <div class="progress-percentage">${progress.percentage}%</div>
                    </div>
                `;
            }).join('');
        }
    }

    /**
     * Handle zoom in
     */
    handleZoomIn() {
        if (this.canvasRenderer) {
            const canvas = this.canvasRenderer.canvas;
            this.canvasRenderer.zoom(1.2, canvas.width / 2, canvas.height / 2);
            this.render();
        }
    }

    /**
     * Handle zoom out
     */
    handleZoomOut() {
        if (this.canvasRenderer) {
            const canvas = this.canvasRenderer.canvas;
            this.canvasRenderer.zoom(0.8, canvas.width / 2, canvas.height / 2);
            this.render();
        }
    }

    /**
     * Handle reset view
     */
    handleResetView() {
        if (this.canvasRenderer) {
            this.canvasRenderer.resetView();
            this.render();
        }
    }

    /**
     * Handle category click
     */
    handleCategoryClick(categoryId) {
        // Update active category
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            if (btn.dataset.category === categoryId) {
                btn.classList.add('active');
                btn.classList.add('activating');
                setTimeout(() => btn.classList.remove('activating'), 300);
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Center view on category
        if (this.canvasRenderer) {
            this.canvasRenderer.centerOnCategory(categoryId);
        }
    }

    /**
     * Handle export
     */
    handleExport() {
        try {
            const progressData = this.userProgress.exportProgress();
            const blob = new Blob([progressData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `skill-tree-progress-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('Progress exported successfully');
        } catch (error) {
            console.error('Error exporting progress:', error);
            this.showErrorMessage('Failed to export progress. Please try again.');
        }
    }

    /**
     * Handle import
     */
    handleImport() {
        const fileInput = document.getElementById('import-file');
        if (!fileInput) return;
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const success = this.userProgress.importProgress(event.target.result);
                    if (success) {
                        // Sync with skill data
                        this.userProgress.syncWithSkillData(this.skillData);
                        
                        // Update skill data with imported progress
                        const importedData = JSON.parse(event.target.result);
                        this.skillData.importData(importedData);
                        
                        this.showSuccessMessage('Progress imported successfully!');
                    } else {
                        this.showErrorMessage('Failed to import progress. Please check the file format.');
                    }
                } catch (error) {
                    console.error('Error importing progress:', error);
                    this.showErrorMessage('Failed to import progress. Invalid file format.');
                }
            };
            reader.readAsText(file);
        }, { once: true });
        
        fileInput.click();
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(e) {
        // Only handle shortcuts when not in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (e.key) {
            case 'Escape':
                if (this.currentModal) {
                    this.hideSkillModal();
                }
                break;
            case 'e':
            case 'E':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.handleExport();
                }
                break;
            case 'i':
            case 'I':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.handleImport();
                }
                break;
            case 'r':
            case 'R':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.handleResetView();
                }
                break;
        }
    }

    /**
     * Render the skill tree
     */
    render() {
        if (this.canvasRenderer && this.skillData && this.userProgress) {
            this.canvasRenderer.render(this.skillData, this.userProgress);
        }
    }

    /**
     * Show loading screen
     */
    showLoadingScreen(message = 'Loading...') {
        const loadingScreen = document.getElementById('loading-screen');
        const appContainer = document.getElementById('app-container');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            this.updateLoadingStatus(message);
        }
        
        if (appContainer) {
            appContainer.style.display = 'none';
        }
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const appContainer = document.getElementById('app-container');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        if (appContainer) {
            appContainer.style.display = 'grid';
        }
    }

    /**
     * Update loading status message
     */
    updateLoadingStatus(message) {
        const statusElement = document.getElementById('loading-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    /**
     * Show success message
     */
    showSuccessMessage(message) {
        // Could implement a toast notification system here
        alert(`✅ ${message}`);
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        // Could implement a toast notification system here
        alert(`❌ ${message}`);
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.canvasRenderer) {
            this.canvasRenderer.cleanup();
        }
        
        if (this.userProgress) {
            this.userProgress.cleanup();
        }
        
        console.log('Application cleanup complete');
    }
}

// Initialize app when page loads
window.app = new SkillTreeApp();