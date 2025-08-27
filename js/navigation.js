/**
 * Navigation Controller
 * Handles navigation, panning, zooming, and view management
 */

class NavigationController {
    constructor(canvasRenderer) {
        this.canvasRenderer = canvasRenderer;
        this.panSpeed = 1;
        this.zoomSpeed = 0.1;
        this.minZoom = 0.1;
        this.maxZoom = 5;
        this.animationDuration = 300; // ms
        this.isAnimating = false;
        
        // Navigation history for back/forward
        this.viewHistory = [];
        this.historyIndex = -1;
        
        // Bookmarks for quick navigation
        this.bookmarks = new Map();
        
        this.setupKeyboardShortcuts();
    }

    /**
     * Setup keyboard shortcuts for navigation
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle if canvas has focus or no input is focused
            const activeElement = document.activeElement;
            if (activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)) {
                return;
            }

            switch (e.key) {
                case 'w':
                case 'W':
                case 'ArrowUp':
                    e.preventDefault();
                    this.pan(0, 50);
                    break;
                case 's':
                case 'S':
                case 'ArrowDown':
                    e.preventDefault();
                    this.pan(0, -50);
                    break;
                case 'a':
                case 'A':
                case 'ArrowLeft':
                    e.preventDefault();
                    this.pan(50, 0);
                    break;
                case 'd':
                case 'D':
                case 'ArrowRight':
                    e.preventDefault();
                    this.pan(-50, 0);
                    break;
                case '=':
                case '+':
                    e.preventDefault();
                    this.zoomIn();
                    break;
                case '-':
                case '_':
                    e.preventDefault();
                    this.zoomOut();
                    break;
                case '0':
                    e.preventDefault();
                    this.resetView();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goHome();
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    this.fitToView();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                    e.preventDefault();
                    this.goToCategory(parseInt(e.key) - 1);
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.clearSelection();
                    break;
            }
        });
    }

    /**
     * Pan the view by specified amount
     */
    pan(deltaX, deltaY) {
        if (this.canvasRenderer) {
            this.canvasRenderer.pan(deltaX * this.panSpeed, deltaY * this.panSpeed);
            this.canvasRenderer.render();
        }
    }

    /**
     * Zoom in at center
     */
    zoomIn() {
        if (this.canvasRenderer) {
            const centerX = this.canvasRenderer.width / 2;
            const centerY = this.canvasRenderer.height / 2;
            this.canvasRenderer.zoom(1 + this.zoomSpeed, centerX, centerY);
            this.canvasRenderer.render();
        }
    }

    /**
     * Zoom out at center
     */
    zoomOut() {
        if (this.canvasRenderer) {
            const centerX = this.canvasRenderer.width / 2;
            const centerY = this.canvasRenderer.height / 2;
            this.canvasRenderer.zoom(1 - this.zoomSpeed, centerX, centerY);
            this.canvasRenderer.render();
        }
    }

    /**
     * Reset view to default position
     */
    resetView() {
        if (this.canvasRenderer) {
            this.canvasRenderer.resetView();
            this.canvasRenderer.render();
        }
    }

    /**
     * Go to home/center position
     */
    goHome() {
        this.animateToPosition(600, 400, 1);
    }

    /**
     * Fit entire skill tree to view
     */
    fitToView() {
        if (!window.skillData || !this.canvasRenderer) return;

        const skills = window.skillData.getAllSkills();
        if (skills.length === 0) return;

        // Calculate bounding box of all skills
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        skills.forEach(skill => {
            minX = Math.min(minX, skill.position.x);
            maxX = Math.max(maxX, skill.position.x);
            minY = Math.min(minY, skill.position.y);
            maxY = Math.max(maxY, skill.position.y);
        });

        // Add padding
        const padding = 100;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        // Calculate scale to fit in viewport
        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const scaleX = this.canvasRenderer.width / contentWidth;
        const scaleY = this.canvasRenderer.height / contentHeight;
        const targetScale = Math.min(scaleX, scaleY, this.maxZoom);

        // Calculate center position
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        this.animateToPosition(centerX, centerY, targetScale);
    }

    /**
     * Navigate to a specific category by index
     */
    goToCategory(categoryIndex) {
        if (!window.skillData) return;

        const categories = window.skillData.getAllCategories();
        if (categoryIndex >= 0 && categoryIndex < categories.length) {
            const category = categories[categoryIndex];
            this.animateToPosition(category.position.x, category.position.y, 1.5);
            
            // Trigger category selection in UI
            if (window.app && window.app.handleCategoryClick) {
                window.app.handleCategoryClick(category.id);
            }
        }
    }

    /**
     * Navigate to specific skill
     */
    goToSkill(skillId) {
        if (!window.skillData) return;

        const skill = window.skillData.getSkill(skillId);
        if (skill) {
            this.animateToPosition(skill.position.x, skill.position.y, 2);
            
            // Optionally show skill details
            if (window.app && window.app.showSkillModal) {
                setTimeout(() => {
                    window.app.showSkillModal(skill);
                }, this.animationDuration);
            }
        }
    }

    /**
     * Smooth animation to specific position and zoom
     */
    animateToPosition(worldX, worldY, targetScale) {
        if (this.isAnimating || !this.canvasRenderer) return;

        this.isAnimating = true;
        const startTime = performance.now();
        
        // Store starting values
        const startScale = this.canvasRenderer.scale;
        const startOffsetX = this.canvasRenderer.offsetX;
        const startOffsetY = this.canvasRenderer.offsetY;
        
        // Calculate target offset (center the target position)
        const targetOffsetX = this.canvasRenderer.width / 2 - worldX * targetScale;
        const targetOffsetY = this.canvasRenderer.height / 2 - worldY * targetScale;
        
        // Save current view to history
        this.saveViewToHistory();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / this.animationDuration, 1);
            
            // Use easing function for smooth animation
            const easeProgress = this.easeInOutCubic(progress);
            
            // Interpolate values
            this.canvasRenderer.scale = this.lerp(startScale, targetScale, easeProgress);
            this.canvasRenderer.offsetX = this.lerp(startOffsetX, targetOffsetX, easeProgress);
            this.canvasRenderer.offsetY = this.lerp(startOffsetY, targetOffsetY, easeProgress);
            
            this.canvasRenderer.render();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * Linear interpolation
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    }

    /**
     * Cubic ease in-out function
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    /**
     * Save current view to navigation history
     */
    saveViewToHistory() {
        if (!this.canvasRenderer) return;

        const viewState = {
            scale: this.canvasRenderer.scale,
            offsetX: this.canvasRenderer.offsetX,
            offsetY: this.canvasRenderer.offsetY,
            timestamp: Date.now()
        };

        // Remove any history after current index (when going back then making new navigation)
        this.viewHistory = this.viewHistory.slice(0, this.historyIndex + 1);
        
        // Add new state
        this.viewHistory.push(viewState);
        this.historyIndex = this.viewHistory.length - 1;

        // Limit history size
        const maxHistorySize = 50;
        if (this.viewHistory.length > maxHistorySize) {
            this.viewHistory.shift();
            this.historyIndex--;
        }
    }

    /**
     * Navigate back in history
     */
    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreViewFromHistory(this.historyIndex);
        }
    }

    /**
     * Navigate forward in history
     */
    goForward() {
        if (this.historyIndex < this.viewHistory.length - 1) {
            this.historyIndex++;
            this.restoreViewFromHistory(this.historyIndex);
        }
    }

    /**
     * Restore view from history at given index
     */
    restoreViewFromHistory(index) {
        if (index < 0 || index >= this.viewHistory.length || !this.canvasRenderer) return;

        const viewState = this.viewHistory[index];
        this.canvasRenderer.scale = viewState.scale;
        this.canvasRenderer.offsetX = viewState.offsetX;
        this.canvasRenderer.offsetY = viewState.offsetY;
        this.canvasRenderer.render();
    }

    /**
     * Create bookmark for current view
     */
    createBookmark(name) {
        if (!this.canvasRenderer) return false;

        this.bookmarks.set(name, {
            scale: this.canvasRenderer.scale,
            offsetX: this.canvasRenderer.offsetX,
            offsetY: this.canvasRenderer.offsetY,
            created: Date.now()
        });

        return true;
    }

    /**
     * Navigate to bookmark
     */
    goToBookmark(name) {
        const bookmark = this.bookmarks.get(name);
        if (bookmark && this.canvasRenderer) {
            // Convert to world coordinates for animation
            const worldX = (-bookmark.offsetX + this.canvasRenderer.width / 2) / bookmark.scale;
            const worldY = (-bookmark.offsetY + this.canvasRenderer.height / 2) / bookmark.scale;
            
            this.animateToPosition(worldX, worldY, bookmark.scale);
            return true;
        }
        return false;
    }

    /**
     * Get all bookmarks
     */
    getBookmarks() {
        return Array.from(this.bookmarks.entries()).map(([name, data]) => ({
            name,
            created: new Date(data.created)
        }));
    }

    /**
     * Delete bookmark
     */
    deleteBookmark(name) {
        return this.bookmarks.delete(name);
    }

    /**
     * Clear selection (close modals, etc.)
     */
    clearSelection() {
        if (window.app && window.app.hideSkillModal) {
            window.app.hideSkillModal();
        }
    }

    /**
     * Get current view state
     */
    getCurrentView() {
        if (!this.canvasRenderer) return null;

        return {
            scale: this.canvasRenderer.scale,
            offsetX: this.canvasRenderer.offsetX,
            offsetY: this.canvasRenderer.offsetY
        };
    }

    /**
     * Set view state
     */
    setView(viewState) {
        if (!this.canvasRenderer || !viewState) return;

        this.canvasRenderer.scale = viewState.scale;
        this.canvasRenderer.offsetX = viewState.offsetX;
        this.canvasRenderer.offsetY = viewState.offsetY;
        this.canvasRenderer.render();
    }

    /**
     * Calculate visible area bounds
     */
    getVisibleBounds() {
        if (!this.canvasRenderer) return null;

        const topLeft = this.canvasRenderer.screenToWorld(0, 0);
        const bottomRight = this.canvasRenderer.screenToWorld(
            this.canvasRenderer.width, 
            this.canvasRenderer.height
        );

        return {
            x: topLeft.x,
            y: topLeft.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y
        };
    }

    /**
     * Check if point is visible
     */
    isPointVisible(worldX, worldY, buffer = 0) {
        const bounds = this.getVisibleBounds();
        if (!bounds) return false;

        return worldX >= bounds.x - buffer && 
               worldX <= bounds.x + bounds.width + buffer &&
               worldY >= bounds.y - buffer && 
               worldY <= bounds.y + bounds.height + buffer;
    }
}

// Export for use in other modules
window.NavigationController = NavigationController;