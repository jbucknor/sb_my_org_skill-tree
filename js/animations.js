/**
 * Animation Controller
 * Handles visual animations and effects for the skill tree
 */

class AnimationController {
    constructor(canvasRenderer) {
        this.canvasRenderer = canvasRenderer;
        this.activeAnimations = new Map();
        this.animationId = 0;
        this.isRunning = false;
        
        // Animation settings
        this.defaultDuration = 1000;
        this.particleLifetime = 2000;
        
        this.startAnimationLoop();
    }

    /**
     * Start the main animation loop
     */
    startAnimationLoop() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        const animate = () => {
            this.updateAnimations();
            
            if (this.isRunning) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * Stop the animation loop
     */
    stopAnimationLoop() {
        this.isRunning = false;
    }

    /**
     * Update all active animations
     */
    updateAnimations() {
        const now = performance.now();
        let hasActiveAnimations = false;

        for (const [id, animation] of this.activeAnimations) {
            const progress = Math.min((now - animation.startTime) / animation.duration, 1);
            const easedProgress = this.applyEasing(progress, animation.easing);
            
            // Update animation
            animation.update(easedProgress);
            
            if (progress >= 1) {
                // Animation complete
                if (animation.onComplete) {
                    animation.onComplete();
                }
                this.activeAnimations.delete(id);
            } else {
                hasActiveAnimations = true;
            }
        }

        // Update particles
        this.updateParticles();

        // Render if there are active animations
        if (hasActiveAnimations || this.canvasRenderer.particles.length > 0) {
            this.canvasRenderer.render();
        }
    }

    /**
     * Update particle systems
     */
    updateParticles() {
        const now = performance.now();
        
        // Update existing particles
        for (let i = this.canvasRenderer.particles.length - 1; i >= 0; i--) {
            const particle = this.canvasRenderer.particles[i];
            const age = now - particle.createdAt;
            
            if (age >= this.particleLifetime) {
                this.canvasRenderer.particles.splice(i, 1);
                continue;
            }
            
            // Update particle properties
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.alpha = Math.max(0, 1 - (age / this.particleLifetime));
            
            // Apply gravity/physics if defined
            if (particle.gravity) {
                particle.vy += particle.gravity;
            }
            
            if (particle.friction) {
                particle.vx *= particle.friction;
                particle.vy *= particle.friction;
            }
        }
    }

    /**
     * Apply easing function to progress value
     */
    applyEasing(t, easing = 'easeInOut') {
        switch (easing) {
            case 'linear':
                return t;
            case 'easeIn':
                return t * t;
            case 'easeOut':
                return 1 - (1 - t) * (1 - t);
            case 'easeInOut':
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            case 'bounce':
                return this.bounceOut(t);
            case 'elastic':
                return this.elasticOut(t);
            default:
                return t;
        }
    }

    /**
     * Bounce easing function
     */
    bounceOut(t) {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }

    /**
     * Elastic easing function
     */
    elasticOut(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 
            ? 0 
            : t === 1 
            ? 1 
            : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    /**
     * Animate skill completion
     */
    animateSkillCompletion(skill) {
        const screenPos = this.canvasRenderer.worldToScreen(skill.position.x, skill.position.y);
        const color = this.canvasRenderer.getCategoryColor(skill.category);
        
        // Pulse animation for the skill node
        this.createPulseAnimation(skill, color);
        
        // Burst particles
        this.createBurstParticles(screenPos.x, screenPos.y, color);
        
        // Ripple effect
        this.createRippleAnimation(screenPos.x, screenPos.y, color);
        
        // Flash effect
        this.createFlashAnimation();
    }

    /**
     * Create pulse animation for skill node
     */
    createPulseAnimation(skill, color) {
        const id = this.animationId++;
        
        this.activeAnimations.set(id, {
            startTime: performance.now(),
            duration: 800,
            easing: 'bounce',
            skill: skill,
            color: color,
            update: (progress) => {
                // This would modify the skill's visual properties
                // The actual implementation would depend on how the canvas renderer handles it
                const scale = 1 + Math.sin(progress * Math.PI) * 0.5;
                skill._animationScale = scale;
                skill._animationAlpha = 1 + Math.sin(progress * Math.PI) * 0.3;
            },
            onComplete: () => {
                delete skill._animationScale;
                delete skill._animationAlpha;
            }
        });
    }

    /**
     * Create burst particle effect
     */
    createBurstParticles(x, y, color) {
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 3 + Math.random() * 4;
            const size = 2 + Math.random() * 4;
            
            this.canvasRenderer.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                alpha: 1,
                color: color,
                createdAt: performance.now(),
                gravity: 0.1,
                friction: 0.99
            });
        }
    }

    /**
     * Create ripple animation
     */
    createRippleAnimation(x, y, color) {
        const id = this.animationId++;
        
        this.activeAnimations.set(id, {
            startTime: performance.now(),
            duration: 1200,
            easing: 'easeOut',
            x: x,
            y: y,
            color: color,
            update: (progress) => {
                const radius = progress * 80;
                const alpha = 1 - progress;
                
                // Add ripple to render queue (would need renderer support)
                this.addRippleToRender(x, y, radius, color, alpha);
            }
        });
    }

    /**
     * Create screen flash effect
     */
    createFlashAnimation() {
        const id = this.animationId++;
        
        this.activeAnimations.set(id, {
            startTime: performance.now(),
            duration: 300,
            easing: 'easeOut',
            update: (progress) => {
                const alpha = (1 - progress) * 0.3;
                this.setScreenFlash(alpha);
            },
            onComplete: () => {
                this.setScreenFlash(0);
            }
        });
    }

    /**
     * Animate skill unlock
     */
    animateSkillUnlock(skill) {
        const id = this.animationId++;
        
        this.activeAnimations.set(id, {
            startTime: performance.now(),
            duration: 1000,
            easing: 'elastic',
            skill: skill,
            update: (progress) => {
                skill._unlockProgress = progress;
                skill._unlockGlow = Math.sin(progress * Math.PI) * 0.5;
            },
            onComplete: () => {
                delete skill._unlockProgress;
                delete skill._unlockGlow;
            }
        });

        // Sparkle particles around newly unlocked skill
        const screenPos = this.canvasRenderer.worldToScreen(skill.position.x, skill.position.y);
        this.createSparkleParticles(screenPos.x, screenPos.y, this.canvasRenderer.getCategoryColor(skill.category));
    }

    /**
     * Create sparkle particles
     */
    createSparkleParticles(x, y, color) {
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 20;
            const sparkleX = x + Math.cos(angle) * distance;
            const sparkleY = y + Math.sin(angle) * distance;
            
            this.canvasRenderer.particles.push({
                x: sparkleX,
                y: sparkleY,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: 1 + Math.random() * 2,
                alpha: 1,
                color: color,
                createdAt: performance.now(),
                friction: 0.95,
                sparkle: true // Special type for different rendering
            });
        }
    }

    /**
     * Animate category focus
     */
    animateCategoryFocus(category) {
        const screenPos = this.canvasRenderer.worldToScreen(category.position.x, category.position.y);
        
        // Zoom and pan to category
        if (window.navigationController) {
            window.navigationController.animateToPosition(
                category.position.x, 
                category.position.y, 
                1.5
            );
        }
        
        // Highlight effect
        this.createHighlightAnimation(category);
    }

    /**
     * Create highlight animation for category
     */
    createHighlightAnimation(category) {
        const id = this.animationId++;
        
        this.activeAnimations.set(id, {
            startTime: performance.now(),
            duration: 2000,
            easing: 'easeInOut',
            category: category,
            update: (progress) => {
                category._highlightAlpha = Math.sin(progress * Math.PI * 4) * 0.3 + 0.5;
            },
            onComplete: () => {
                delete category._highlightAlpha;
            }
        });
    }

    /**
     * Animate connection line activation
     */
    animateConnectionActivation(fromSkill, toSkill) {
        const id = this.animationId++;
        
        this.activeAnimations.set(id, {
            startTime: performance.now(),
            duration: 800,
            easing: 'easeInOut',
            fromSkill: fromSkill,
            toSkill: toSkill,
            update: (progress) => {
                // Store animation data for renderer
                const connectionKey = `${fromSkill.skill_id}-${toSkill.skill_id}`;
                if (!this.canvasRenderer.connectionAnimations) {
                    this.canvasRenderer.connectionAnimations = new Map();
                }
                this.canvasRenderer.connectionAnimations.set(connectionKey, {
                    progress: progress,
                    glow: Math.sin(progress * Math.PI) * 0.5
                });
            },
            onComplete: () => {
                const connectionKey = `${fromSkill.skill_id}-${toSkill.skill_id}`;
                if (this.canvasRenderer.connectionAnimations) {
                    this.canvasRenderer.connectionAnimations.delete(connectionKey);
                }
            }
        });
    }

    /**
     * Create floating number animation (for points gained)
     */
    animateFloatingNumber(x, y, number, color = '#4fc3f7') {
        const id = this.animationId++;
        const screenPos = this.canvasRenderer.worldToScreen(x, y);
        
        this.activeAnimations.set(id, {
            startTime: performance.now(),
            duration: 1500,
            easing: 'easeOut',
            startY: screenPos.y,
            number: number,
            color: color,
            x: screenPos.x,
            update: (progress) => {
                const currentY = this.startY - progress * 60;
                const alpha = 1 - progress;
                
                // This would need renderer support to display floating text
                this.addFloatingTextToRender(this.x, currentY, `+${this.number}`, this.color, alpha);
            }
        });
    }

    /**
     * Create shake animation (for errors or locked skills)
     */
    animateShake(skill) {
        const id = this.animationId++;
        
        this.activeAnimations.set(id, {
            startTime: performance.now(),
            duration: 400,
            easing: 'elastic',
            skill: skill,
            update: (progress) => {
                const intensity = (1 - progress) * 10;
                skill._shakeX = Math.sin(progress * 20) * intensity;
                skill._shakeY = Math.cos(progress * 25) * intensity * 0.5;
            },
            onComplete: () => {
                delete skill._shakeX;
                delete skill._shakeY;
            }
        });
    }

    /**
     * Helper methods for render integration
     */
    addRippleToRender(x, y, radius, color, alpha) {
        if (!this.canvasRenderer.ripples) {
            this.canvasRenderer.ripples = [];
        }
        this.canvasRenderer.ripples.push({ x, y, radius, color, alpha });
    }

    setScreenFlash(alpha) {
        this.canvasRenderer.screenFlashAlpha = alpha;
    }

    addFloatingTextToRender(x, y, text, color, alpha) {
        if (!this.canvasRenderer.floatingTexts) {
            this.canvasRenderer.floatingTexts = [];
        }
        this.canvasRenderer.floatingTexts.push({ x, y, text, color, alpha });
    }

    /**
     * Clean up animations
     */
    cleanup() {
        this.stopAnimationLoop();
        this.activeAnimations.clear();
        if (this.canvasRenderer) {
            this.canvasRenderer.particles = [];
        }
    }

    /**
     * Pause all animations
     */
    pause() {
        this.isRunning = false;
    }

    /**
     * Resume animations
     */
    resume() {
        if (!this.isRunning) {
            this.startAnimationLoop();
        }
    }

    /**
     * Get animation statistics
     */
    getStats() {
        return {
            activeAnimations: this.activeAnimations.size,
            particles: this.canvasRenderer ? this.canvasRenderer.particles.length : 0,
            isRunning: this.isRunning
        };
    }
}

// Export for use in other modules
window.AnimationController = AnimationController;