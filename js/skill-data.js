/**
 * Skill Data Model and Schema
 * Manages the core skill tree data structure and validation
 */

class SkillData {
    constructor() {
        this.skills = new Map();
        this.categories = new Map();
        this.schema_version = '1.0.0';
        this.initialized = false;
        
        // Initialize categories
        this.initializeCategories();
        
        // Load initial skill data
        this.loadInitialSkills();
    }

    /**
     * Initialize the seven life categories
     */
    initializeCategories() {
        const categories = [
            {
                id: 'family',
                name: 'Family',
                icon: '👨‍👩‍👧‍👦',
                description: 'Skills related to family relationships, communication, and time investment',
                color: '#ff6b6b',
                position: { x: 200, y: 150 }
            },
            {
                id: 'business',
                name: 'Business',
                icon: '💼',
                description: 'Professional development, leadership, project management, and career skills',
                color: '#4c6ef5',
                position: { x: 600, y: 150 }
            },
            {
                id: 'relationships',
                name: 'Relationships',
                icon: '🤝',
                description: 'Social skills, networking, empathy, and interpersonal connections',
                color: '#f06292',
                position: { x: 1000, y: 150 }
            },
            {
                id: 'health',
                name: 'Health',
                icon: '🏃‍♂️',
                description: 'Physical fitness, nutrition, mental health, and wellbeing',
                color: '#66bb6a',
                position: { x: 200, y: 400 }
            },
            {
                id: 'finances',
                name: 'Finances',
                icon: '💰',
                description: 'Financial literacy, budgeting, investing, and money management',
                color: '#ffa726',
                position: { x: 600, y: 400 }
            },
            {
                id: 'spirituality',
                name: 'Spirituality',
                icon: '🧘‍♀️',
                description: 'Mindfulness, meditation, purpose discovery, and inner growth',
                color: '#ab47bc',
                position: { x: 1000, y: 400 }
            },
            {
                id: 'emotions',
                name: 'Emotions',
                icon: '😊',
                description: 'Emotional intelligence, stress management, and self-awareness',
                color: '#26c6da',
                position: { x: 600, y: 650 }
            }
        ];

        categories.forEach(category => {
            this.categories.set(category.id, category);
        });
    }

    /**
     * Load initial skill definitions
     */
    loadInitialSkills() {
        // Family skills
        this.addSkill({
            skill_id: 'family_communication_001',
            name: 'Active Listening',
            description: 'Practice focused listening with family members without interrupting or judging.',
            category: 'family',
            points: 3,
            timeRequired: '15 hours',
            prerequisites: [],
            unlocks: ['family_communication_002', 'relationships_empathy_001'],
            position: { x: 250, y: 150 },
            achievements: [
                'Listen without interrupting in 5 family conversations',
                'Ask clarifying questions instead of making assumptions',
                'Summarize what you heard before responding'
            ]
        });

        this.addSkill({
            skill_id: 'family_communication_002',
            name: 'Conflict Resolution',
            description: 'Learn to mediate and resolve family conflicts constructively.',
            category: 'family',
            points: 5,
            timeRequired: '25 hours',
            prerequisites: ['family_communication_001'],
            unlocks: ['family_leadership_001'],
            position: { x: 200, y: 200 },
            achievements: [
                'Successfully mediate a family disagreement',
                'Use "I" statements instead of blame language',
                'Find win-win solutions in 3 family conflicts'
            ]
        });

        this.addSkill({
            skill_id: 'family_time_001',
            name: 'Quality Time Investment',
            description: 'Dedicate focused, undistracted time with family members.',
            category: 'family',
            points: 4,
            timeRequired: '20 hours',
            prerequisites: [],
            unlocks: ['family_communication_002'],
            position: { x: 150, y: 150 },
            achievements: [
                'Spend 1-on-1 time with each family member weekly',
                'Create and maintain a family activity tradition',
                'Turn off devices during family meals for 30 days'
            ]
        });

        // Business skills
        this.addSkill({
            skill_id: 'business_leadership_001',
            name: 'Team Leadership',
            description: 'Develop skills to lead and motivate teams effectively.',
            category: 'business',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: [],
            unlocks: ['business_communication_001'],
            position: { x: 650, y: 150 },
            achievements: [
                'Lead a team project from start to finish',
                'Provide constructive feedback to team members',
                'Delegate tasks effectively and follow up'
            ]
        });

        this.addSkill({
            skill_id: 'business_projectmgmt_001',
            name: 'Project Management',
            description: 'Master planning, executing, and delivering projects on time.',
            category: 'business',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['business_leadership_001'],
            unlocks: ['business_strategy_001'],
            position: { x: 600, y: 200 },
            achievements: [
                'Complete a project using a formal methodology',
                'Manage project timeline and budget successfully',
                'Use project management tools effectively'
            ]
        });

        // Relationships skills
        this.addSkill({
            skill_id: 'relationships_empathy_001',
            name: 'Empathetic Understanding',
            description: 'Develop the ability to understand and share the feelings of others.',
            category: 'relationships',
            points: 5,
            timeRequired: '25 hours',
            prerequisites: ['family_communication_001'],
            unlocks: ['relationships_networking_001'],
            position: { x: 1050, y: 150 },
            achievements: [
                'Practice perspective-taking in 10 conversations',
                'Validate others\' emotions without trying to fix them',
                'Show genuine interest in others\' experiences'
            ]
        });

        this.addSkill({
            skill_id: 'relationships_networking_001',
            name: 'Professional Networking',
            description: 'Build meaningful professional relationships and expand your network.',
            category: 'relationships',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['relationships_empathy_001'],
            unlocks: ['business_communication_001'],
            position: { x: 1000, y: 200 },
            achievements: [
                'Attend 3 professional networking events',
                'Make 5 new meaningful professional connections',
                'Follow up with new connections within 48 hours'
            ]
        });

        // Health skills
        this.addSkill({
            skill_id: 'health_fitness_001',
            name: 'Regular Exercise',
            description: 'Establish and maintain a consistent fitness routine.',
            category: 'health',
            points: 6,
            timeRequired: '60 hours',
            prerequisites: [],
            unlocks: ['health_nutrition_001'],
            position: { x: 250, y: 400 },
            achievements: [
                'Exercise consistently for 30 days',
                'Try 3 different types of physical activity',
                'Increase your baseline fitness level measurably'
            ]
        });

        this.addSkill({
            skill_id: 'health_nutrition_001',
            name: 'Nutrition Planning',
            description: 'Plan and prepare nutritious meals and understand dietary needs.',
            category: 'health',
            points: 5,
            timeRequired: '30 hours',
            prerequisites: ['health_fitness_001'],
            unlocks: ['health_mental_001'],
            position: { x: 200, y: 450 },
            achievements: [
                'Plan a week of balanced meals in advance',
                'Prepare healthy meals from scratch 5 times',
                'Learn to read and understand nutrition labels'
            ]
        });

        // Finance skills
        this.addSkill({
            skill_id: 'finances_budgeting_001',
            name: 'Personal Budgeting',
            description: 'Create and stick to a personal or family budget.',
            category: 'finances',
            points: 5,
            timeRequired: '20 hours',
            prerequisites: [],
            unlocks: ['finances_saving_001'],
            position: { x: 650, y: 400 },
            achievements: [
                'Track all expenses for 30 days',
                'Create a monthly budget and stick to it',
                'Identify and reduce 3 unnecessary expenses'
            ]
        });

        this.addSkill({
            skill_id: 'finances_investing_001',
            name: 'Investment Basics',
            description: 'Learn fundamental investment principles and start investing.',
            category: 'finances',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['finances_budgeting_001'],
            unlocks: ['finances_planning_001'],
            position: { x: 600, y: 450 },
            achievements: [
                'Understand different investment vehicles',
                'Open and fund an investment account',
                'Create a diversified investment portfolio'
            ]
        });

        // Spirituality skills
        this.addSkill({
            skill_id: 'spirituality_meditation_001',
            name: 'Daily Meditation',
            description: 'Establish a regular meditation or mindfulness practice.',
            category: 'spirituality',
            points: 6,
            timeRequired: '40 hours',
            prerequisites: [],
            unlocks: ['spirituality_gratitude_001'],
            position: { x: 1050, y: 400 },
            achievements: [
                'Meditate daily for 21 consecutive days',
                'Try 3 different meditation techniques',
                'Notice improved focus and calm in daily life'
            ]
        });

        this.addSkill({
            skill_id: 'spirituality_purpose_001',
            name: 'Purpose Discovery',
            description: 'Explore and clarify your life\'s purpose and values.',
            category: 'spirituality',
            points: 10,
            timeRequired: '50 hours',
            prerequisites: ['spirituality_meditation_001'],
            unlocks: ['emotions_selfaware_001'],
            position: { x: 1000, y: 450 },
            achievements: [
                'Complete a values clarification exercise',
                'Write a personal mission statement',
                'Align daily actions with identified purpose'
            ]
        });

        // Emotions skills
        this.addSkill({
            skill_id: 'emotions_selfaware_001',
            name: 'Self-Awareness',
            description: 'Develop deeper understanding of your emotions and reactions.',
            category: 'emotions',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['spirituality_purpose_001'],
            unlocks: ['emotions_regulation_001'],
            position: { x: 650, y: 650 },
            achievements: [
                'Keep an emotion journal for 30 days',
                'Identify your top 3 emotional triggers',
                'Practice mindful observation of emotions'
            ]
        });

        this.addSkill({
            skill_id: 'emotions_stress_001',
            name: 'Stress Management',
            description: 'Learn techniques to manage and reduce stress effectively.',
            category: 'emotions',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: [],
            unlocks: ['emotions_selfaware_001'],
            position: { x: 600, y: 700 },
            achievements: [
                'Learn and practice 3 stress reduction techniques',
                'Implement a daily stress management routine',
                'Successfully manage stress during a challenging period'
            ]
        });

        console.log(`Loaded ${this.skills.size} initial skills across ${this.categories.size} categories`);
        this.initialized = true;
    }

    /**
     * Add a skill to the skill tree
     */
    addSkill(skillData) {
        // Validate skill data
        if (!this.validateSkill(skillData)) {
            console.error('Invalid skill data:', skillData);
            return false;
        }

        this.skills.set(skillData.skill_id, {
            ...skillData,
            completed: false,
            dateCompleted: null,
            unlocked: this.isSkillUnlocked(skillData)
        });

        return true;
    }

    /**
     * Validate skill data structure
     */
    validateSkill(skill) {
        const required = ['skill_id', 'name', 'description', 'category', 'points', 'position'];
        
        return required.every(field => {
            if (!skill.hasOwnProperty(field)) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
            return true;
        });
    }

    /**
     * Check if a skill should be unlocked based on prerequisites
     */
    isSkillUnlocked(skill, userProgress = null) {
        if (!skill.prerequisites || skill.prerequisites.length === 0) {
            return true; // No prerequisites means it's unlocked
        }

        // If we have user progress, check against it
        if (userProgress) {
            return skill.prerequisites.every(prereqId => {
                return userProgress.completedSkills && userProgress.completedSkills.includes(prereqId);
            });
        }

        // Default check (for initialization)
        return skill.prerequisites.every(prereqId => {
            const prereqSkill = this.skills.get(prereqId);
            return prereqSkill && prereqSkill.completed;
        });
    }

    /**
     * Get all skills for a specific category
     */
    getSkillsByCategory(categoryId) {
        return Array.from(this.skills.values()).filter(skill => skill.category === categoryId);
    }

    /**
     * Get skill by ID
     */
    getSkill(skillId) {
        return this.skills.get(skillId);
    }

    /**
     * Get all skills
     */
    getAllSkills() {
        return Array.from(this.skills.values());
    }

    /**
     * Get all categories
     */
    getAllCategories() {
        return Array.from(this.categories.values());
    }

    /**
     * Get category by ID
     */
    getCategory(categoryId) {
        return this.categories.get(categoryId);
    }

    /**
     * Update skill completion status
     */
    completeSkill(skillId) {
        const skill = this.skills.get(skillId);
        if (!skill) {
            console.error(`Skill not found: ${skillId}`);
            return false;
        }

        if (!skill.unlocked) {
            console.error(`Cannot complete locked skill: ${skillId}`);
            return false;
        }

        skill.completed = true;
        skill.dateCompleted = new Date().toISOString();

        // Unlock dependent skills
        this.updateUnlockedSkills();

        return true;
    }

    /**
     * Mark skill as incomplete
     */
    uncompleteSkill(skillId) {
        const skill = this.skills.get(skillId);
        if (!skill) {
            console.error(`Skill not found: ${skillId}`);
            return false;
        }

        skill.completed = false;
        skill.dateCompleted = null;

        // Update locked status for dependent skills
        this.updateUnlockedSkills();

        return true;
    }

    /**
     * Update unlocked status for all skills based on current completion state
     */
    updateUnlockedSkills() {
        for (const skill of this.skills.values()) {
            skill.unlocked = this.isSkillUnlocked(skill);
        }
    }

    /**
     * Get total points earned
     */
    getTotalPoints() {
        return Array.from(this.skills.values())
            .filter(skill => skill.completed)
            .reduce((total, skill) => total + skill.points, 0);
    }

    /**
     * Get points by category
     */
    getPointsByCategory(categoryId) {
        return this.getSkillsByCategory(categoryId)
            .filter(skill => skill.completed)
            .reduce((total, skill) => total + skill.points, 0);
    }

    /**
     * Get completion percentage by category
     */
    getCategoryCompletion(categoryId) {
        const categorySkills = this.getSkillsByCategory(categoryId);
        if (categorySkills.length === 0) return 0;

        const completedCount = categorySkills.filter(skill => skill.completed).length;
        return Math.round((completedCount / categorySkills.length) * 100);
    }

    /**
     * Export skill tree data for saving
     */
    exportData() {
        const skillData = {};
        for (const [id, skill] of this.skills) {
            skillData[id] = {
                completed: skill.completed,
                dateCompleted: skill.dateCompleted
            };
        }

        return {
            version: this.schema_version,
            exportDate: new Date().toISOString(),
            skills: skillData,
            totalPoints: this.getTotalPoints()
        };
    }

    /**
     * Import skill tree data
     */
    importData(importedData) {
        try {
            // Validate import data structure
            if (!importedData.skills || !importedData.version) {
                throw new Error('Invalid import data structure');
            }

            // Apply imported progress
            for (const [skillId, progress] of Object.entries(importedData.skills)) {
                const skill = this.skills.get(skillId);
                if (skill) {
                    skill.completed = progress.completed;
                    skill.dateCompleted = progress.dateCompleted;
                }
            }

            // Update unlocked skills based on new completion state
            this.updateUnlockedSkills();

            console.log('Successfully imported skill tree data');
            return true;

        } catch (error) {
            console.error('Error importing skill tree data:', error);
            return false;
        }
    }

    /**
     * Reset all skill progress
     */
    resetProgress() {
        for (const skill of this.skills.values()) {
            skill.completed = false;
            skill.dateCompleted = null;
        }
        this.updateUnlockedSkills();
    }

    /**
     * Get skills that were recently completed
     */
    getRecentlyCompleted(days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return Array.from(this.skills.values())
            .filter(skill => {
                if (!skill.completed || !skill.dateCompleted) return false;
                return new Date(skill.dateCompleted) >= cutoffDate;
            })
            .sort((a, b) => new Date(b.dateCompleted) - new Date(a.dateCompleted));
    }
}

// Export for use in other modules
window.SkillData = SkillData;