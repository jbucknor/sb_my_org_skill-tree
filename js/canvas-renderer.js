/**
 * Canvas Renderer for Skill Tree
 * Handles all canvas drawing operations and visual rendering
 */

class CanvasRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.width = 0;
        this.height = 0;
        this.pixelRatio = window.devicePixelRatio || 1;
        
        // Visual settings
        this.nodeRadius = 25;
        this.nodeStrokeWidth = 3;
        this.connectionWidth = 2;
        this.fontFamily = 'Segoe UI, Roboto, Arial, sans-serif';
        
        // Animation settings
        this.animationFrameId = null;
        this.particles = [];
        
        // Initialize canvas
        this.setupCanvas();
        this.setupEventHandlers();
        
        console.log('Canvas renderer initialized');
    }

    /**
     * Setup canvas with proper sizing and DPI support
     */
    setupCanvas() {
        // Force a resize after a short delay to ensure container is rendered
        setTimeout(() => {
            this.resizeCanvas();
            this.render();
        }, 100);
        
        // Setup high DPI support
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        // Set initial transform
        this.resetView();
    }

    /**
     * Resize canvas to match container
     */
    resizeCanvas() {
        // Get container dimensions instead of canvas dimensions
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        this.width = containerRect.width || 800; // Fallback width
        this.height = containerRect.height || 600; // Fallback height
        
        // Ensure minimum size
        if (this.width < 100) this.width = 800;
        if (this.height < 100) this.height = 600;
        
        // Set canvas size for high DPI
        this.canvas.width = this.width * this.pixelRatio;
        this.canvas.height = this.height * this.pixelRatio;
        
        // Scale context to match device pixel ratio
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        
        // Set CSS size
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        
        console.log(`Canvas resized to ${this.width}x${this.height}`);
    }

    /**
     * Setup event handlers for canvas interactions
     */
    setupEventHandlers() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.render();
        });
        
        // Handle mouse events for interaction
        this.setupMouseEvents();
        this.setupTouchEvents();
        this.setupKeyboardEvents();
    }

    /**
     * Setup mouse event handlers
     */
    setupMouseEvents() {
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;
        let renderTimeout = null;

        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            this.canvas.style.cursor = 'grabbing';
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - lastX;
                const deltaY = e.clientY - lastY;
                
                this.pan(deltaX, deltaY);
                
                lastX = e.clientX;
                lastY = e.clientY;
                
                // Throttle render calls during dragging to prevent duplication
                if (renderTimeout) {
                    clearTimeout(renderTimeout);
                }
                renderTimeout = setTimeout(() => {
                    this.render();
                    renderTimeout = null;
                }, 16); // ~60fps throttling
            } else {
                // Handle hover effects
                this.handleHover(e);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
            this.canvas.style.cursor = 'grab';
            // Ensure a final render after dragging stops
            if (renderTimeout) {
                clearTimeout(renderTimeout);
                renderTimeout = null;
            }
            this.render();
        });

        this.canvas.addEventListener('mouseleave', () => {
            isDragging = false;
            this.canvas.style.cursor = 'grab';
            this.hideTooltip();
            // Ensure a final render if dragging was interrupted
            if (renderTimeout) {
                clearTimeout(renderTimeout);
                renderTimeout = null;
            }
            this.render();
        });

        // Handle mouse wheel for zooming
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom(zoomFactor, mouseX, mouseY);
            this.render();
        });

        // Handle click events
        this.canvas.addEventListener('click', (e) => {
            this.handleClick(e);
        });
    }

    /**
     * Setup touch event handlers for mobile
     */
    setupTouchEvents() {
        let lastTouchDistance = 0;
        let touches = [];
        let touchRenderTimeout = null;

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touches = Array.from(e.touches);
            
            if (touches.length === 2) {
                // Start pinch zoom
                lastTouchDistance = this.getTouchDistance(touches[0], touches[1]);
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const currentTouches = Array.from(e.touches);
            
            if (currentTouches.length === 1 && touches.length === 1) {
                // Single touch pan
                const deltaX = currentTouches[0].clientX - touches[0].clientX;
                const deltaY = currentTouches[0].clientY - touches[0].clientY;
                
                this.pan(deltaX, deltaY);
                
                // Throttle render calls during touch dragging
                if (touchRenderTimeout) {
                    clearTimeout(touchRenderTimeout);
                }
                touchRenderTimeout = setTimeout(() => {
                    this.render();
                    touchRenderTimeout = null;
                }, 16); // ~60fps throttling
            } else if (currentTouches.length === 2 && touches.length === 2) {
                // Pinch zoom
                const currentDistance = this.getTouchDistance(currentTouches[0], currentTouches[1]);
                const zoomFactor = currentDistance / lastTouchDistance;
                
                const centerX = (currentTouches[0].clientX + currentTouches[1].clientX) / 2;
                const centerY = (currentTouches[0].clientY + currentTouches[1].clientY) / 2;
                
                const rect = this.canvas.getBoundingClientRect();
                this.zoom(zoomFactor, centerX - rect.left, centerY - rect.top);
                
                // Throttle render calls during pinch zoom
                if (touchRenderTimeout) {
                    clearTimeout(touchRenderTimeout);
                }
                touchRenderTimeout = setTimeout(() => {
                    this.render();
                    touchRenderTimeout = null;
                }, 16); // ~60fps throttling
                
                lastTouchDistance = currentDistance;
            }
            
            touches = currentTouches;
        });

        this.canvas.addEventListener('touchend', (e) => {
            touches = Array.from(e.touches);
            
            // Ensure a final render after touch interaction ends
            if (touchRenderTimeout) {
                clearTimeout(touchRenderTimeout);
                touchRenderTimeout = null;
            }
            this.render();
            
            if (touches.length === 0) {
                // Handle tap (similar to click)
                if (e.changedTouches.length === 1) {
                    this.handleTouch(e.changedTouches[0]);
                }
            }
        });
    }

    /**
     * Setup keyboard event handlers for accessibility
     */
    setupKeyboardEvents() {
        this.canvas.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    this.pan(20, 0);
                    break;
                case 'ArrowRight':
                    this.pan(-20, 0);
                    break;
                case 'ArrowUp':
                    this.pan(0, 20);
                    break;
                case 'ArrowDown':
                    this.pan(0, -20);
                    break;
                case '+':
                case '=':
                    this.zoom(1.1, this.width / 2, this.height / 2);
                    break;
                case '-':
                    this.zoom(0.9, this.width / 2, this.height / 2);
                    break;
                case '0':
                    this.resetView();
                    break;
            }
            this.render();
        });
    }

    /**
     * Get distance between two touch points
     */
    getTouchDistance(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Handle click events on skill nodes
     */
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const worldPos = this.screenToWorld(x, y);
        const clickedSkill = this.getSkillAtPosition(worldPos.x, worldPos.y);
        
        if (clickedSkill) {
            this.onSkillClick(clickedSkill);
        }
    }

    /**
     * Handle touch events on skill nodes
     */
    handleTouch(touch) {
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        const worldPos = this.screenToWorld(x, y);
        const touchedSkill = this.getSkillAtPosition(worldPos.x, worldPos.y);
        
        if (touchedSkill) {
            this.onSkillClick(touchedSkill);
        }
    }

    /**
     * Handle hover effects
     */
    handleHover(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const worldPos = this.screenToWorld(x, y);
        const hoveredSkill = this.getSkillAtPosition(worldPos.x, worldPos.y);
        
        if (hoveredSkill) {
            this.showTooltip(hoveredSkill, x, y);
            this.canvas.style.cursor = 'pointer';
        } else {
            this.hideTooltip();
            this.canvas.style.cursor = 'grab';
        }
    }

    /**
     * Find skill at given world coordinates
     */
    getSkillAtPosition(worldX, worldY) {
        if (!window.skillData) return null;
        
        for (const skill of window.skillData.getAllSkills()) {
            const dx = worldX - skill.position.x;
            const dy = worldY - skill.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.nodeRadius) {
                return skill;
            }
        }
        
        return null;
    }

    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.offsetX) / this.scale,
            y: (screenY - this.offsetY) / this.scale
        };
    }

    /**
     * Convert world coordinates to screen coordinates
     */
    worldToScreen(worldX, worldY) {
        return {
            x: worldX * this.scale + this.offsetX,
            y: worldY * this.scale + this.offsetY
        };
    }

    /**
     * Pan the view
     */
    pan(deltaX, deltaY) {
        this.offsetX += deltaX;
        this.offsetY += deltaY;
        
        // Add boundaries to prevent excessive panning
        const maxOffset = 2000 * this.scale;
        this.offsetX = Math.max(-maxOffset, Math.min(maxOffset, this.offsetX));
        this.offsetY = Math.max(-maxOffset, Math.min(maxOffset, this.offsetY));
    }

    /**
     * Zoom the view
     */
    zoom(factor, centerX, centerY) {
        const newScale = this.scale * factor;
        
        // Limit zoom levels
        if (newScale < 0.1 || newScale > 5) {
            return;
        }
        
        // Adjust offset to zoom towards center point
        this.offsetX = centerX - (centerX - this.offsetX) * factor;
        this.offsetY = centerY - (centerY - this.offsetY) * factor;
        
        this.scale = newScale;
    }

    /**
     * Reset view to default position and zoom
     */
    resetView() {
        this.scale = 1;
        this.offsetX = this.width / 2 - 600; // Center on skill tree
        this.offsetY = this.height / 2 - 400;
    }

    /**
     * Main render function
     */
    render(skillData = null, userProgress = null) {
        if (!skillData) skillData = window.skillData;
        if (!userProgress) userProgress = window.userProgress;
        
        if (!skillData || !skillData.initialized) {
            this.renderLoadingScreen();
            return;
        }
        
        // Cancel any existing animation frame to prevent duplicates
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Save context state
        this.ctx.save();
        
        // Apply transform
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.scale, this.scale);
        
        // Render background pattern
        this.renderBackground();
        
        // Render connections first (so nodes appear on top)
        this.renderConnections(skillData, userProgress);
        
        // Render skill nodes
        this.renderSkillNodes(skillData, userProgress);
        
        // Render category labels
        this.renderCategoryLabels(skillData);
        
        // Restore context state
        this.ctx.restore();
        
        // Render particles (in screen space)
        this.renderParticles();
        
        // Continue animation loop if there are particles
        if (this.particles.length > 0) {
            this.animationFrameId = requestAnimationFrame(() => this.render(skillData, userProgress));
        }
    }

    /**
     * Render loading screen
     */
    renderLoadingScreen() {
        this.ctx.fillStyle = 'rgba(26, 26, 46, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#4fc3f7';
        this.ctx.font = '24px ' + this.fontFamily;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Loading Skill Tree...', this.width / 2, this.height / 2);
    }

    /**
     * Render background pattern
     */
    renderBackground() {
        const gridSize = 100;
        const startX = Math.floor(-this.offsetX / this.scale / gridSize) * gridSize;
        const startY = Math.floor(-this.offsetY / this.scale / gridSize) * gridSize;
        const endX = startX + (this.width / this.scale) + gridSize;
        const endY = startY + (this.height / this.scale) + gridSize;
        
        this.ctx.strokeStyle = 'rgba(79, 195, 247, 0.1)';
        this.ctx.lineWidth = 1 / this.scale;
        
        this.ctx.beginPath();
        for (let x = startX; x <= endX; x += gridSize) {
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
        }
        for (let y = startY; y <= endY; y += gridSize) {
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
        }
        this.ctx.stroke();
    }

    /**
     * Render connections between skill nodes
     */
    renderConnections(skillData, userProgress) {
        this.ctx.lineWidth = this.connectionWidth / this.scale;
        
        for (const skill of skillData.getAllSkills()) {
            if (skill.unlocks && skill.unlocks.length > 0) {
                for (const unlockedSkillId of skill.unlocks) {
                    const unlockedSkill = skillData.getSkill(unlockedSkillId);
                    if (!unlockedSkill) continue;
                    
                    // Determine connection color and style
                    const isCompleted = userProgress && userProgress.isSkillCompleted(skill.skill_id);
                    const isUnlockedCompleted = userProgress && userProgress.isSkillCompleted(unlockedSkillId);
                    
                    let strokeStyle, strokeAlpha;
                    if (isCompleted) {
                        strokeStyle = this.getCategoryColor(skill.category);
                        strokeAlpha = isUnlockedCompleted ? 1 : 0.7;
                    } else {
                        strokeStyle = 'rgba(79, 195, 247, 0.3)';
                        strokeAlpha = 0.3;
                    }
                    
                    this.ctx.strokeStyle = strokeStyle;
                    this.ctx.globalAlpha = strokeAlpha;
                    
                    // Draw connection line
                    this.ctx.beginPath();
                    this.ctx.moveTo(skill.position.x, skill.position.y);
                    this.ctx.lineTo(unlockedSkill.position.x, unlockedSkill.position.y);
                    this.ctx.stroke();
                }
            }
        }
        
        this.ctx.globalAlpha = 1;
    }

    /**
     * Render skill nodes
     */
    renderSkillNodes(skillData, userProgress) {
        for (const skill of skillData.getAllSkills()) {
            this.renderSkillNode(skill, userProgress);
        }
    }

    /**
     * Render a single skill node
     */
    renderSkillNode(skill, userProgress) {
        const isCompleted = userProgress && userProgress.isSkillCompleted(skill.skill_id);
        const isUnlocked = skill.unlocked;
        
        const x = skill.position.x;
        const y = skill.position.y;
        const radius = this.nodeRadius / this.scale;
        
        // Determine node appearance
        let fillColor, strokeColor, alpha;
        
        if (isCompleted) {
            fillColor = this.getCategoryColor(skill.category, 'secondary');
            strokeColor = this.getCategoryColor(skill.category, 'dark');
            alpha = 1;
        } else if (isUnlocked) {
            fillColor = this.getCategoryColor(skill.category, 'primary');
            strokeColor = this.getCategoryColor(skill.category, 'dark');
            alpha = 0.8;
        } else {
            fillColor = 'rgba(79, 195, 247, 0.2)';
            strokeColor = 'rgba(79, 195, 247, 0.5)';
            alpha = 0.5;
        }
        
        this.ctx.globalAlpha = alpha;
        
        // Draw node background
        this.ctx.fillStyle = fillColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Draw node border
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = this.nodeStrokeWidth / this.scale;
        this.ctx.stroke();
        
        // Draw completion indicator
        if (isCompleted) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = `${16 / this.scale}px ${this.fontFamily}`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('✓', x, y);
        } else if (isUnlocked) {
            // Draw skill points
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = `${12 / this.scale}px ${this.fontFamily}`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(skill.points.toString(), x, y);
        }
        
        // Draw skill name below node (only if zoomed in enough)
        if (this.scale > 0.7) {
            this.ctx.fillStyle = '#e0e0e0';
            this.ctx.font = `${10 / this.scale}px ${this.fontFamily}`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'top';
            
            const maxWidth = radius * 3;
            const words = skill.name.split(' ');
            let line = '';
            let lineY = y + radius + 5 / this.scale;
            
            for (const word of words) {
                const testLine = line + word + ' ';
                const metrics = this.ctx.measureText(testLine);
                
                if (metrics.width > maxWidth && line !== '') {
                    this.ctx.fillText(line.trim(), x, lineY);
                    line = word + ' ';
                    lineY += 12 / this.scale;
                } else {
                    line = testLine;
                }
            }
            this.ctx.fillText(line.trim(), x, lineY);
        }
        
        this.ctx.globalAlpha = 1;
    }

    /**
     * Render category labels
     */
    renderCategoryLabels(skillData) {
        if (this.scale < 0.5) return; // Only show labels when zoomed in enough
        
        for (const category of skillData.getAllCategories()) {
            this.ctx.fillStyle = category.color;
            this.ctx.font = `bold ${20 / this.scale}px ${this.fontFamily}`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Position label above category
            const labelY = category.position.y - 80 / this.scale;
            
            // Draw category icon and name
            this.ctx.fillText(category.icon + ' ' + category.name, category.position.x, labelY);
        }
    }

    /**
     * Render particle effects
     */
    renderParticles() {
        this.ctx.save();
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Update particle
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.alpha -= particle.decay;
            
            // Remove dead particles
            if (particle.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        this.ctx.restore();
    }

    /**
     * Get category color
     */
    getCategoryColor(categoryId, variant = 'primary') {
        const colors = {
            family: { primary: '#ff6b6b', secondary: '#ffa8a8', dark: '#c92a2a' },
            business: { primary: '#4c6ef5', secondary: '#748ffc', dark: '#3b5bdb' },
            relationships: { primary: '#f06292', secondary: '#f8bbd9', dark: '#c2185b' },
            health: { primary: '#66bb6a', secondary: '#a5d6a7', dark: '#388e3c' },
            finances: { primary: '#ffa726', secondary: '#ffcc02', dark: '#f57c00' },
            spirituality: { primary: '#ab47bc', secondary: '#ce93d8', dark: '#7b1fa2' },
            emotions: { primary: '#26c6da', secondary: '#80deea', dark: '#0097a7' }
        };
        
        return colors[categoryId] ? colors[categoryId][variant] : '#4fc3f7';
    }

    /**
     * Add skill completion particle effect
     */
    addCompletionEffect(skill) {
        const screenPos = this.worldToScreen(skill.position.x, skill.position.y);
        const color = this.getCategoryColor(skill.category);
        
        // Create burst of particles
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            const speed = 2 + Math.random() * 3;
            
            this.particles.push({
                x: screenPos.x,
                y: screenPos.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 3,
                alpha: 1,
                decay: 0.02,
                color: color
            });
        }
        
        // Start animation loop
        if (!this.animationFrameId) {
            this.animationFrameId = requestAnimationFrame(() => this.render());
        }
    }

    /**
     * Show tooltip for skill node
     */
    showTooltip(skill, screenX, screenY) {
        const tooltip = document.getElementById('tooltip');
        const content = document.querySelector('#tooltip .tooltip-content');
        
        if (tooltip && content) {
            const isCompleted = window.userProgress && window.userProgress.isSkillCompleted(skill.skill_id);
            const completionText = isCompleted ? '✅ Completed' : `${skill.points} points`;
            
            content.innerHTML = `
                <strong>${skill.name}</strong><br>
                ${skill.description}<br>
                <em>${completionText}</em>
            `;
            
            tooltip.style.left = (screenX + 10) + 'px';
            tooltip.style.top = (screenY - 10) + 'px';
            tooltip.setAttribute('aria-hidden', 'false');
        }
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Handle skill node click
     */
    onSkillClick(skill) {
        if (window.app && window.app.showSkillModal) {
            window.app.showSkillModal(skill);
        }
    }

    /**
     * Center view on a specific category
     */
    centerOnCategory(categoryId) {
        const category = window.skillData.getCategory(categoryId);
        if (!category) return;
        
        this.offsetX = this.width / 2 - category.position.x * this.scale;
        this.offsetY = this.height / 2 - category.position.y * this.scale;
        
        this.render();
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.particles = [];
    }
}

// Export for use in other modules
window.CanvasRenderer = CanvasRenderer;