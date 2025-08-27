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

        // Additional Family Skills to reach 20+
        this.addSkill({
            skill_id: 'family_leadership_001',
            name: 'Family Leadership',
            description: 'Take initiative in family decision-making and planning.',
            category: 'family',
            points: 6,
            timeRequired: '25 hours',
            prerequisites: ['family_communication_002'],
            unlocks: ['family_planning_001'],
            position: { x: 150, y: 250 },
            achievements: [
                'Lead family meetings for 3 consecutive months',
                'Organize a successful family event or vacation',
                'Facilitate family goal-setting session'
            ]
        });

        this.addSkill({
            skill_id: 'family_planning_001',
            name: 'Family Planning & Organization',
            description: 'Coordinate schedules, activities, and family logistics.',
            category: 'family',
            points: 5,
            timeRequired: '20 hours',
            prerequisites: ['family_leadership_001'],
            unlocks: ['family_budgeting_001'],
            position: { x: 100, y: 300 },
            achievements: [
                'Maintain a shared family calendar for 2 months',
                'Plan and coordinate family meal schedules',
                'Organize household responsibilities chart'
            ]
        });

        this.addSkill({
            skill_id: 'family_budgeting_001',
            name: 'Family Financial Management',
            description: 'Manage family finances and teach financial literacy.',
            category: 'family',
            points: 7,
            timeRequired: '30 hours',
            prerequisites: ['family_planning_001'],
            unlocks: ['family_traditions_001'],
            position: { x: 200, y: 300 },
            achievements: [
                'Create and maintain family budget for 3 months',
                'Teach children about money and savings',
                'Plan and save for a family financial goal'
            ]
        });

        this.addSkill({
            skill_id: 'family_traditions_001',
            name: 'Family Traditions & Rituals',
            description: 'Create and maintain meaningful family traditions.',
            category: 'family',
            points: 4,
            timeRequired: '15 hours',
            prerequisites: ['family_budgeting_001'],
            unlocks: ['family_support_001'],
            position: { x: 300, y: 200 },
            achievements: [
                'Establish a new meaningful family tradition',
                'Document family history and stories',
                'Create annual family celebration rituals'
            ]
        });

        this.addSkill({
            skill_id: 'family_support_001',
            name: 'Emotional Support System',
            description: 'Provide and facilitate emotional support within the family.',
            category: 'family',
            points: 6,
            timeRequired: '25 hours',
            prerequisites: ['family_traditions_001'],
            unlocks: ['family_discipline_001'],
            position: { x: 350, y: 150 },
            achievements: [
                'Be available for family members during difficult times',
                'Celebrate individual family member achievements',
                'Create safe spaces for sharing emotions'
            ]
        });

        this.addSkill({
            skill_id: 'family_discipline_001',
            name: 'Positive Discipline',
            description: 'Implement fair and constructive discipline strategies.',
            category: 'family',
            points: 5,
            timeRequired: '20 hours',
            prerequisites: ['family_support_001'],
            unlocks: ['family_education_001'],
            position: { x: 400, y: 200 },
            achievements: [
                'Use positive reinforcement strategies consistently',
                'Set clear, fair household rules and boundaries',
                'Implement natural consequence approaches'
            ]
        });

        this.addSkill({
            skill_id: 'family_education_001',
            name: 'Family Learning & Growth',
            description: 'Support educational and personal development within the family.',
            category: 'family',
            points: 6,
            timeRequired: '25 hours',
            prerequisites: ['family_discipline_001'],
            unlocks: ['family_health_001'],
            position: { x: 450, y: 150 },
            achievements: [
                'Help with homework and learning activities regularly',
                'Encourage skill development and hobbies',
                'Read together as a family weekly'
            ]
        });

        this.addSkill({
            skill_id: 'family_health_001',
            name: 'Family Health & Wellness',
            description: 'Promote healthy lifestyle choices for the entire family.',
            category: 'family',
            points: 5,
            timeRequired: '20 hours',
            prerequisites: ['family_education_001'],
            unlocks: ['family_adventure_001'],
            position: { x: 500, y: 200 },
            achievements: [
                'Plan and prepare healthy family meals',
                'Organize regular family physical activities',
                'Monitor and support family mental health'
            ]
        });

        this.addSkill({
            skill_id: 'family_adventure_001',
            name: 'Family Adventures & Exploration',
            description: 'Create memorable experiences and adventures together.',
            category: 'family',
            points: 4,
            timeRequired: '15 hours',
            prerequisites: ['family_health_001'],
            unlocks: ['family_community_001'],
            position: { x: 550, y: 150 },
            achievements: [
                'Plan and execute family outdoor adventures',
                'Explore new places and activities together',
                'Document and share family adventure stories'
            ]
        });

        this.addSkill({
            skill_id: 'family_community_001',
            name: 'Community Engagement',
            description: 'Engage with the broader community as a family unit.',
            category: 'family',
            points: 5,
            timeRequired: '20 hours',
            prerequisites: ['family_adventure_001'],
            unlocks: ['family_legacy_001'],
            position: { x: 600, y: 200 },
            achievements: [
                'Volunteer as a family in community service',
                'Participate in neighborhood or school events',
                'Build relationships with other families'
            ]
        });

        this.addSkill({
            skill_id: 'family_legacy_001',
            name: 'Family Legacy Building',
            description: 'Create lasting impact and values for future generations.',
            category: 'family',
            points: 8,
            timeRequired: '35 hours',
            prerequisites: ['family_community_001'],
            unlocks: ['family_storytelling_001'],
            position: { x: 650, y: 150 },
            achievements: [
                'Write family mission statement and values',
                'Create family time capsule or legacy project',
                'Establish traditions that will continue for generations'
            ]
        });

        this.addSkill({
            skill_id: 'family_storytelling_001',
            name: 'Family Storytelling',
            description: 'Share and preserve family stories and memories.',
            category: 'family',
            points: 3,
            timeRequired: '12 hours',
            prerequisites: ['family_legacy_001'],
            unlocks: ['family_creativity_001'],
            position: { x: 250, y: 350 },
            achievements: [
                'Record family stories and oral histories',
                'Share family memories during gatherings',
                'Create family photo albums and scrapbooks'
            ]
        });

        this.addSkill({
            skill_id: 'family_creativity_001',
            name: 'Family Creativity & Arts',
            description: 'Encourage and participate in creative activities together.',
            category: 'family',
            points: 4,
            timeRequired: '15 hours',
            prerequisites: ['family_storytelling_001'],
            unlocks: ['family_technology_001'],
            position: { x: 350, y: 350 },
            achievements: [
                'Engage in arts and crafts projects together',
                'Encourage musical or artistic expression',
                'Create family art displays or performances'
            ]
        });

        this.addSkill({
            skill_id: 'family_technology_001',
            name: 'Family Technology Balance',
            description: 'Manage healthy technology use within the family.',
            category: 'family',
            points: 5,
            timeRequired: '18 hours',
            prerequisites: ['family_creativity_001'],
            unlocks: ['family_celebrations_001'],
            position: { x: 450, y: 350 },
            achievements: [
                'Establish family technology usage rules',
                'Create tech-free zones and times',
                'Use technology to enhance family connection'
            ]
        });

        this.addSkill({
            skill_id: 'family_celebrations_001',
            name: 'Family Celebrations & Milestones',
            description: 'Celebrate important family moments and milestones.',
            category: 'family',
            points: 4,
            timeRequired: '15 hours',
            prerequisites: ['family_technology_001'],
            unlocks: ['family_resilience_001'],
            position: { x: 550, y: 350 },
            achievements: [
                'Plan and execute meaningful birthday celebrations',
                'Mark family milestones and achievements',
                'Create special celebration traditions'
            ]
        });

        this.addSkill({
            skill_id: 'family_resilience_001',
            name: 'Family Resilience Building',
            description: 'Build family strength to handle challenges and adversity.',
            category: 'family',
            points: 7,
            timeRequired: '30 hours',
            prerequisites: ['family_celebrations_001'],
            unlocks: ['family_forgiveness_001'],
            position: { x: 100, y: 400 },
            achievements: [
                'Develop family crisis management strategies',
                'Build emotional resilience skills in family members',
                'Create support systems for difficult times'
            ]
        });

        this.addSkill({
            skill_id: 'family_forgiveness_001',
            name: 'Forgiveness & Reconciliation',
            description: 'Practice and teach forgiveness within family relationships.',
            category: 'family',
            points: 6,
            timeRequired: '25 hours',
            prerequisites: ['family_resilience_001'],
            unlocks: ['family_gratitude_001'],
            position: { x: 200, y: 400 },
            achievements: [
                'Model forgiveness in family conflicts',
                'Teach and practice apology skills',
                'Help family members heal from hurt feelings'
            ]
        });

        this.addSkill({
            skill_id: 'family_gratitude_001',
            name: 'Family Gratitude Practice',
            description: 'Cultivate appreciation and thankfulness within the family.',
            category: 'family',
            points: 4,
            timeRequired: '15 hours',
            prerequisites: ['family_forgiveness_001'],
            unlocks: ['family_service_001'],
            position: { x: 300, y: 400 },
            achievements: [
                'Establish daily family gratitude practices',
                'Express appreciation for each family member regularly',
                'Create family gratitude rituals and traditions'
            ]
        });

        this.addSkill({
            skill_id: 'family_service_001',
            name: 'Family Service & Giving',
            description: 'Engage in service and giving back as a family unit.',
            category: 'family',
            points: 5,
            timeRequired: '20 hours',
            prerequisites: ['family_gratitude_001'],
            unlocks: [],
            position: { x: 400, y: 400 },
            achievements: [
                'Volunteer together in community service projects',
                'Support charitable causes as a family',
                'Teach children about helping others in need'
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

        // Additional Business Skills to reach 20+
        this.addSkill({
            skill_id: 'business_strategy_001',
            name: 'Strategic Planning',
            description: 'Develop and implement long-term business strategies.',
            category: 'business',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['business_projectmgmt_001'],
            unlocks: ['business_communication_001'],
            position: { x: 550, y: 250 },
            achievements: [
                'Create a comprehensive business strategy plan',
                'Conduct market analysis and competitive research',
                'Set and track strategic KPIs and goals'
            ]
        });

        this.addSkill({
            skill_id: 'business_communication_001',
            name: 'Professional Communication',
            description: 'Master effective communication in business environments.',
            category: 'business',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['business_strategy_001', 'relationships_networking_001'],
            unlocks: ['business_negotiation_001'],
            position: { x: 700, y: 200 },
            achievements: [
                'Deliver compelling presentations to leadership',
                'Write clear and persuasive business documents',
                'Facilitate effective team meetings'
            ]
        });

        this.addSkill({
            skill_id: 'business_negotiation_001',
            name: 'Negotiation Skills',
            description: 'Develop advanced negotiation and deal-making abilities.',
            category: 'business',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['business_communication_001'],
            unlocks: ['business_innovation_001'],
            position: { x: 750, y: 150 },
            achievements: [
                'Successfully negotiate win-win business deals',
                'Resolve conflicts through skilled negotiation',
                'Master various negotiation strategies and tactics'
            ]
        });

        this.addSkill({
            skill_id: 'business_innovation_001',
            name: 'Innovation & Creativity',
            description: 'Foster innovation and creative problem-solving in business.',
            category: 'business',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['business_negotiation_001'],
            unlocks: ['business_analytics_001'],
            position: { x: 800, y: 200 },
            achievements: [
                'Lead successful innovation initiatives',
                'Implement creative solutions to business challenges',
                'Foster innovation culture within teams'
            ]
        });

        this.addSkill({
            skill_id: 'business_analytics_001',
            name: 'Data Analytics & Insights',
            description: 'Use data analysis to drive business decision-making.',
            category: 'business',
            points: 9,
            timeRequired: '45 hours',
            prerequisites: ['business_innovation_001'],
            unlocks: ['business_finance_001'],
            position: { x: 850, y: 150 },
            achievements: [
                'Create comprehensive data analysis reports',
                'Use analytics tools to identify business trends',
                'Make data-driven strategic recommendations'
            ]
        });

        this.addSkill({
            skill_id: 'business_finance_001',
            name: 'Financial Management',
            description: 'Understand and manage business finances effectively.',
            category: 'business',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['business_analytics_001'],
            unlocks: ['business_sales_001'],
            position: { x: 500, y: 300 },
            achievements: [
                'Analyze financial statements and performance metrics',
                'Create and manage business budgets',
                'Understand investment and funding strategies'
            ]
        });

        this.addSkill({
            skill_id: 'business_sales_001',
            name: 'Sales & Revenue Generation',
            description: 'Master sales techniques and revenue generation strategies.',
            category: 'business',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['business_finance_001'],
            unlocks: ['business_marketing_001'],
            position: { x: 600, y: 300 },
            achievements: [
                'Consistently meet or exceed sales targets',
                'Build and maintain strong client relationships',
                'Develop effective sales processes and systems'
            ]
        });

        this.addSkill({
            skill_id: 'business_marketing_001',
            name: 'Marketing & Brand Management',
            description: 'Develop marketing strategies and build strong brands.',
            category: 'business',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['business_sales_001'],
            unlocks: ['business_operations_001'],
            position: { x: 700, y: 300 },
            achievements: [
                'Create comprehensive marketing campaigns',
                'Build and manage brand identity and reputation',
                'Measure and optimize marketing ROI'
            ]
        });

        this.addSkill({
            skill_id: 'business_operations_001',
            name: 'Operations Management',
            description: 'Optimize business operations and processes for efficiency.',
            category: 'business',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['business_marketing_001'],
            unlocks: ['business_technology_001'],
            position: { x: 800, y: 300 },
            achievements: [
                'Streamline business processes and workflows',
                'Implement quality management systems',
                'Optimize resource allocation and utilization'
            ]
        });

        this.addSkill({
            skill_id: 'business_technology_001',
            name: 'Technology & Digital Transformation',
            description: 'Lead technology adoption and digital transformation initiatives.',
            category: 'business',
            points: 9,
            timeRequired: '45 hours',
            prerequisites: ['business_operations_001'],
            unlocks: ['business_ethics_001'],
            position: { x: 550, y: 350 },
            achievements: [
                'Successfully implement new technology solutions',
                'Lead digital transformation projects',
                'Stay current with emerging business technologies'
            ]
        });

        this.addSkill({
            skill_id: 'business_ethics_001',
            name: 'Business Ethics & Compliance',
            description: 'Maintain high ethical standards and ensure compliance.',
            category: 'business',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['business_technology_001'],
            unlocks: ['business_entrepreneurship_001'],
            position: { x: 650, y: 350 },
            achievements: [
                'Establish and enforce ethical business practices',
                'Ensure compliance with regulations and standards',
                'Lead by example in ethical decision-making'
            ]
        });

        this.addSkill({
            skill_id: 'business_entrepreneurship_001',
            name: 'Entrepreneurship & Innovation',
            description: 'Develop entrepreneurial mindset and start new ventures.',
            category: 'business',
            points: 10,
            timeRequired: '50 hours',
            prerequisites: ['business_ethics_001'],
            unlocks: ['business_networking_001'],
            position: { x: 750, y: 350 },
            achievements: [
                'Launch a successful business or side venture',
                'Identify and capitalize on market opportunities',
                'Build innovative business models'
            ]
        });

        this.addSkill({
            skill_id: 'business_networking_001',
            name: 'Professional Networking',
            description: 'Build and maintain valuable professional networks.',
            category: 'business',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['business_entrepreneurship_001'],
            unlocks: ['business_mentoring_001'],
            position: { x: 500, y: 400 },
            achievements: [
                'Build a network of 50+ meaningful professional contacts',
                'Attend industry events and conferences regularly',
                'Provide value to network connections consistently'
            ]
        });

        this.addSkill({
            skill_id: 'business_mentoring_001',
            name: 'Mentoring & Coaching',
            description: 'Mentor others and develop coaching skills.',
            category: 'business',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['business_networking_001'],
            unlocks: ['business_change_001'],
            position: { x: 600, y: 400 },
            achievements: [
                'Successfully mentor junior colleagues',
                'Develop coaching skills and techniques',
                'Help others achieve their professional goals'
            ]
        });

        this.addSkill({
            skill_id: 'business_change_001',
            name: 'Change Management',
            description: 'Lead organizational change and transformation initiatives.',
            category: 'business',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['business_mentoring_001'],
            unlocks: ['business_globalization_001'],
            position: { x: 700, y: 400 },
            achievements: [
                'Successfully lead major organizational changes',
                'Build change management strategies and plans',
                'Help teams adapt to new processes and systems'
            ]
        });

        this.addSkill({
            skill_id: 'business_globalization_001',
            name: 'Global Business & Culture',
            description: 'Navigate international business and cultural differences.',
            category: 'business',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['business_change_001'],
            unlocks: ['business_sustainability_001'],
            position: { x: 800, y: 400 },
            achievements: [
                'Successfully manage international business relationships',
                'Understand and adapt to different business cultures',
                'Navigate global market challenges and opportunities'
            ]
        });

        this.addSkill({
            skill_id: 'business_sustainability_001',
            name: 'Sustainable Business Practices',
            description: 'Implement environmentally and socially responsible business practices.',
            category: 'business',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['business_globalization_001'],
            unlocks: ['business_crisis_001'],
            position: { x: 550, y: 450 },
            achievements: [
                'Implement sustainable business initiatives',
                'Measure and report on sustainability metrics',
                'Balance profit with environmental and social responsibility'
            ]
        });

        this.addSkill({
            skill_id: 'business_crisis_001',
            name: 'Crisis Management',
            description: 'Manage business crises and emergency situations effectively.',
            category: 'business',
            points: 9,
            timeRequired: '45 hours',
            prerequisites: ['business_sustainability_001'],
            unlocks: [],
            position: { x: 650, y: 450 },
            achievements: [
                'Successfully navigate business crises and emergencies',
                'Develop crisis management and contingency plans',
                'Communicate effectively during crisis situations'
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

        // Additional Relationships Skills to reach 20+
        this.addSkill({
            skill_id: 'relationships_communication_001',
            name: 'Interpersonal Communication',
            description: 'Master effective communication in personal relationships.',
            category: 'relationships',
            points: 5,
            timeRequired: '25 hours',
            prerequisites: ['relationships_empathy_001'],
            unlocks: ['relationships_boundaries_001'],
            position: { x: 1100, y: 150 },
            achievements: [
                'Practice active listening in all conversations',
                'Express needs and feelings clearly and respectfully',
                'Resolve misunderstandings effectively'
            ]
        });

        this.addSkill({
            skill_id: 'relationships_boundaries_001',
            name: 'Healthy Boundaries',
            description: 'Set and maintain healthy boundaries in all relationships.',
            category: 'relationships',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['relationships_communication_001'],
            unlocks: ['relationships_trust_001'],
            position: { x: 1150, y: 200 },
            achievements: [
                'Clearly communicate personal boundaries',
                'Say no when necessary without guilt',
                'Respect others\' boundaries consistently'
            ]
        });

        this.addSkill({
            skill_id: 'relationships_trust_001',
            name: 'Trust Building',
            description: 'Build and maintain trust in personal and professional relationships.',
            category: 'relationships',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['relationships_boundaries_001'],
            unlocks: ['relationships_conflict_001'],
            position: { x: 1200, y: 150 },
            achievements: [
                'Be consistently reliable and trustworthy',
                'Rebuild trust after it has been damaged',
                'Create environments where others feel safe to trust'
            ]
        });

        this.addSkill({
            skill_id: 'relationships_conflict_001',
            name: 'Conflict Resolution',
            description: 'Navigate and resolve conflicts in relationships constructively.',
            category: 'relationships',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['relationships_trust_001'],
            unlocks: ['relationships_intimacy_001'],
            position: { x: 950, y: 250 },
            achievements: [
                'Mediate conflicts between others successfully',
                'Address personal conflicts directly and respectfully',
                'Find win-win solutions to relationship disagreements'
            ]
        });

        this.addSkill({
            skill_id: 'relationships_intimacy_001',
            name: 'Emotional Intimacy',
            description: 'Develop deeper emotional connections in close relationships.',
            category: 'relationships',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['relationships_conflict_001'],
            unlocks: ['relationships_support_001'],
            position: { x: 1050, y: 250 },
            achievements: [
                'Share vulnerabilities and deep emotions appropriately',
                'Create safe spaces for emotional expression',
                'Deepen intimacy through regular meaningful conversations'
            ]
        });

        this.addSkill({
            skill_id: 'relationships_support_001',
            name: 'Supportive Relationships',
            description: 'Provide and receive support effectively in relationships.',
            category: 'relationships',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['relationships_intimacy_001'],
            unlocks: ['relationships_social_001'],
            position: { x: 1150, y: 250 },
            achievements: [
                'Offer appropriate support during difficult times',
                'Ask for and accept help when needed',
                'Be present and available for important people'
            ]
        });

        this.addSkill({
            skill_id: 'relationships_social_001',
            name: 'Social Skills & Charisma',
            description: 'Develop magnetic social presence and interpersonal skills.',
            category: 'relationships',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['relationships_support_001'],
            unlocks: ['relationships_leadership_001'],
            position: { x: 1250, y: 200 },
            achievements: [
                'Make others feel comfortable and valued in social settings',
                'Navigate social situations with confidence and grace',
                'Build rapport quickly with new people'
            ]
        });

        this.addSkill({
            skill_id: 'relationships_leadership_001',
            name: 'Relationship Leadership',
            description: 'Take initiative in building and maintaining relationship networks.',
            category: 'relationships',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['relationships_social_001'],
            unlocks: ['relationships_mentorship_001'],
            position: { x: 950, y: 300 },
            achievements: [
                'Organize social gatherings and relationship-building events',
                'Connect others and facilitate new relationships',
                'Lead by example in relationship building'
            ]
        });

        this.addSkill({
            skill_id: 'relationships_mentorship_001',
            name: 'Mentoring & Guidance',
            description: 'Guide and mentor others in their personal and professional growth.',
            category: 'relationships',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['relationships_leadership_001'],
            unlocks: ['relationships_diversity_001'],
            position: { x: 1050, y: 300 },
            achievements: [
                'Successfully mentor someone to achieve their goals',
                'Provide valuable guidance and wisdom to others',
                'Create mentoring relationships that benefit both parties'
            ]
        });

        this.addSkill({
            skill_id: 'relationships_diversity_001',
            name: 'Cultural Competency & Inclusion',
            description: 'Build relationships across cultural and demographic differences.',
            category: 'relationships',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['relationships_mentorship_001'],
            unlocks: ['relationships_forgiveness_001'],
            position: { x: 1150, y: 300 },
            achievements: [
                'Build meaningful relationships with people from different backgrounds',
                'Learn about and respect cultural differences',
                'Create inclusive environments in social and work settings'
            ]
        });

        this.addSkill({
            skill_id: 'relationships_forgiveness_001',
            name: 'Forgiveness & Healing',
            description: 'Practice forgiveness and help heal damaged relationships.',
            category: 'relationships',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['relationships_diversity_001'],
            unlocks: ['relationships_romance_001'],
            position: { x: 1250, y: 250 },
            achievements: [
                'Forgive others who have hurt you genuinely',
                'Make amends for your own relationship mistakes',
                'Help facilitate reconciliation between others'
            ]
        });

        this.addSkill({
            skill_id: 'relationships_romance_001',
            name: 'Romantic Relationships',
            description: 'Build and maintain healthy romantic partnerships.',
            category: 'relationships',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['relationships_forgiveness_001'],
            unlocks: ['relationships_parenting_001'],
            position: { x: 950, y: 350 },
            achievements: [
                'Maintain a healthy long-term romantic relationship',
                'Balance independence and togetherness effectively',
                'Navigate romantic challenges with wisdom and care'
            ]
        });

        this.addSkill({
            skill_id: 'relationships_parenting_001',
            name: 'Parenting Relationships',
            description: 'Build strong, healthy relationships with children as a parent.',
            category: 'relationships',
            points: 9,
            timeRequired: '45 hours',
            prerequisites: ['relationships_romance_001'],
            unlocks: ['relationships_friendship_001'],
            position: { x: 1050, y: 350 },
            achievements: [
                'Maintain open communication with children at all ages',
                'Balance authority with emotional connection',
                'Support children\'s independence while staying connected'
            ]
        });

        this.addSkill({
            skill_id: 'relationships_friendship_001',
            name: 'Deep Friendships',
            description: 'Cultivate and maintain meaningful, long-lasting friendships.',
            category: 'relationships',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['relationships_parenting_001'],
            unlocks: ['relationships_community_001'],
            position: { x: 1150, y: 350 },
            achievements: [
                'Maintain deep friendships over many years',
                'Be the kind of friend others can depend on',
                'Make new friends as an adult'
            ]
        });

        this.addSkill({
            skill_id: 'relationships_community_001',
            name: 'Community Building',
            description: 'Build and strengthen communities and group relationships.',
            category: 'relationships',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['relationships_friendship_001'],
            unlocks: ['relationships_networking_advanced_001'],
            position: { x: 1250, y: 300 },
            achievements: [
                'Organize community events and gatherings',
                'Strengthen existing community connections',
                'Bridge divides and bring people together'
            ]
        });

        this.addSkill({
            skill_id: 'relationships_networking_advanced_001',
            name: 'Strategic Network Building',
            description: 'Build strategic networks for mutual benefit and growth.',
            category: 'relationships',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['relationships_community_001'],
            unlocks: ['relationships_influence_001'],
            position: { x: 950, y: 400 },
            achievements: [
                'Build a network of 100+ valuable professional connections',
                'Create mutually beneficial strategic partnerships',
                'Leverage network for career and business growth'
            ]
        });

        this.addSkill({
            skill_id: 'relationships_influence_001',
            name: 'Positive Influence',
            description: 'Use relationships to create positive influence and impact.',
            category: 'relationships',
            points: 9,
            timeRequired: '45 hours',
            prerequisites: ['relationships_networking_advanced_001'],
            unlocks: ['relationships_legacy_001'],
            position: { x: 1050, y: 400 },
            achievements: [
                'Inspire positive change in others through relationships',
                'Use influence ethically and for mutual benefit',
                'Build reputation as someone who adds value to others\' lives'
            ]
        });

        this.addSkill({
            skill_id: 'relationships_legacy_001',
            name: 'Relationship Legacy',
            description: 'Create lasting positive impact through relationships.',
            category: 'relationships',
            points: 10,
            timeRequired: '50 hours',
            prerequisites: ['relationships_influence_001'],
            unlocks: [],
            position: { x: 1150, y: 400 },
            achievements: [
                'Leave a positive legacy in all significant relationships',
                'Impact others\' lives in ways that continue after you\'re gone',
                'Model relationship excellence for future generations'
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

        // Additional Health Skills to reach 20+
        this.addSkill({
            skill_id: 'health_mental_001',
            name: 'Mental Health & Wellness',
            description: 'Maintain and improve mental health and emotional well-being.',
            category: 'health',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['health_nutrition_001'],
            unlocks: ['health_sleep_001'],
            position: { x: 150, y: 500 },
            achievements: [
                'Practice stress management techniques daily',
                'Seek professional mental health support when needed',
                'Maintain positive mental health habits for 90 days'
            ]
        });

        this.addSkill({
            skill_id: 'health_sleep_001',
            name: 'Sleep Optimization',
            description: 'Optimize sleep quality and establish healthy sleep habits.',
            category: 'health',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['health_mental_001'],
            unlocks: ['health_hydration_001'],
            position: { x: 300, y: 500 },
            achievements: [
                'Maintain consistent sleep schedule for 30 days',
                'Achieve 7-9 hours of quality sleep nightly',
                'Create and maintain optimal sleep environment'
            ]
        });

        this.addSkill({
            skill_id: 'health_hydration_001',
            name: 'Proper Hydration',
            description: 'Maintain optimal hydration for health and performance.',
            category: 'health',
            points: 3,
            timeRequired: '15 hours',
            prerequisites: ['health_sleep_001'],
            unlocks: ['health_strength_001'],
            position: { x: 400, y: 450 },
            achievements: [
                'Drink adequate water daily for 30 consecutive days',
                'Monitor and track hydration levels',
                'Understand hydration needs for different activities'
            ]
        });

        this.addSkill({
            skill_id: 'health_strength_001',
            name: 'Strength Training',
            description: 'Build and maintain muscular strength and endurance.',
            category: 'health',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['health_hydration_001'],
            unlocks: ['health_flexibility_001'],
            position: { x: 350, y: 400 },
            achievements: [
                'Follow structured strength training program for 12 weeks',
                'Increase strength benchmarks measurably',
                'Learn proper form for major compound movements'
            ]
        });

        this.addSkill({
            skill_id: 'health_flexibility_001',
            name: 'Flexibility & Mobility',
            description: 'Improve flexibility, mobility, and movement quality.',
            category: 'health',
            points: 5,
            timeRequired: '25 hours',
            prerequisites: ['health_strength_001'],
            unlocks: ['health_cardio_001'],
            position: { x: 100, y: 400 },
            achievements: [
                'Perform daily flexibility and mobility routine',
                'Improve range of motion in major joints',
                'Learn and practice yoga or stretching techniques'
            ]
        });

        this.addSkill({
            skill_id: 'health_cardio_001',
            name: 'Cardiovascular Fitness',
            description: 'Develop and maintain cardiovascular health and endurance.',
            category: 'health',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['health_flexibility_001'],
            unlocks: ['health_injury_prevention_001'],
            position: { x: 50, y: 450 },
            achievements: [
                'Engage in cardio exercise 4+ times per week',
                'Improve cardiovascular endurance measurably',
                'Try multiple forms of cardiovascular exercise'
            ]
        });

        this.addSkill({
            skill_id: 'health_injury_prevention_001',
            name: 'Injury Prevention',
            description: 'Prevent injuries through proper movement and care.',
            category: 'health',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['health_cardio_001'],
            unlocks: ['health_recovery_001'],
            position: { x: 450, y: 500 },
            achievements: [
                'Learn and practice proper movement patterns',
                'Implement injury prevention protocols',
                'Maintain injury-free active lifestyle for 6 months'
            ]
        });

        this.addSkill({
            skill_id: 'health_recovery_001',
            name: 'Recovery & Regeneration',
            description: 'Master recovery techniques for optimal health and performance.',
            category: 'health',
            points: 5,
            timeRequired: '25 hours',
            prerequisites: ['health_injury_prevention_001'],
            unlocks: ['health_supplements_001'],
            position: { x: 500, y: 450 },
            achievements: [
                'Implement daily recovery and regeneration practices',
                'Use massage, foam rolling, or other recovery tools',
                'Balance training stress with adequate recovery'
            ]
        });

        this.addSkill({
            skill_id: 'health_supplements_001',
            name: 'Nutritional Supplements',
            description: 'Understand and use nutritional supplements effectively.',
            category: 'health',
            points: 4,
            timeRequired: '20 hours',
            prerequisites: ['health_recovery_001'],
            unlocks: ['health_preventive_001'],
            position: { x: 550, y: 400 },
            achievements: [
                'Research and understand supplement science',
                'Use supplements strategically to fill nutritional gaps',
                'Track supplement effectiveness and adjust as needed'
            ]
        });

        this.addSkill({
            skill_id: 'health_preventive_001',
            name: 'Preventive Health Care',
            description: 'Take proactive steps to prevent health problems.',
            category: 'health',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['health_supplements_001'],
            unlocks: ['health_chronic_disease_001'],
            position: { x: 50, y: 350 },
            achievements: [
                'Complete annual health screenings and checkups',
                'Implement preventive health measures consistently',
                'Stay current with recommended health screenings'
            ]
        });

        this.addSkill({
            skill_id: 'health_chronic_disease_001',
            name: 'Chronic Disease Prevention',
            description: 'Prevent and manage chronic diseases through lifestyle.',
            category: 'health',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['health_preventive_001'],
            unlocks: ['health_aging_001'],
            position: { x: 150, y: 350 },
            achievements: [
                'Implement lifestyle changes to prevent chronic disease',
                'Understand family health history and risk factors',
                'Maintain healthy biomarkers and health indicators'
            ]
        });

        this.addSkill({
            skill_id: 'health_aging_001',
            name: 'Healthy Aging',
            description: 'Optimize health and vitality throughout the aging process.',
            category: 'health',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['health_chronic_disease_001'],
            unlocks: ['health_functional_001'],
            position: { x: 250, y: 350 },
            achievements: [
                'Implement anti-aging lifestyle strategies',
                'Maintain physical and cognitive function with age',
                'Plan for healthy aging and longevity'
            ]
        });

        this.addSkill({
            skill_id: 'health_functional_001',
            name: 'Functional Fitness',
            description: 'Develop fitness that supports daily life activities.',
            category: 'health',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['health_aging_001'],
            unlocks: ['health_stress_management_001'],
            position: { x: 350, y: 350 },
            achievements: [
                'Perform functional movement patterns correctly',
                'Maintain strength for daily activities',
                'Improve balance, coordination, and stability'
            ]
        });

        this.addSkill({
            skill_id: 'health_stress_management_001',
            name: 'Advanced Stress Management',
            description: 'Master advanced techniques for managing life stress.',
            category: 'health',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['health_functional_001'],
            unlocks: ['health_energy_001'],
            position: { x: 450, y: 350 },
            achievements: [
                'Use multiple stress management techniques effectively',
                'Maintain calm and composure in stressful situations',
                'Help others manage their stress effectively'
            ]
        });

        this.addSkill({
            skill_id: 'health_energy_001',
            name: 'Energy Optimization',
            description: 'Optimize energy levels and combat fatigue.',
            category: 'health',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['health_stress_management_001'],
            unlocks: ['health_immune_001'],
            position: { x: 550, y: 350 },
            achievements: [
                'Maintain stable energy levels throughout the day',
                'Identify and eliminate energy drains',
                'Optimize nutrition and lifestyle for energy'
            ]
        });

        this.addSkill({
            skill_id: 'health_immune_001',
            name: 'Immune System Support',
            description: 'Support and strengthen immune system function.',
            category: 'health',
            points: 5,
            timeRequired: '25 hours',
            prerequisites: ['health_energy_001'],
            unlocks: ['health_longevity_001'],
            position: { x: 100, y: 550 },
            achievements: [
                'Implement immune-supporting lifestyle practices',
                'Reduce frequency of illness and infections',
                'Understand factors that support immune function'
            ]
        });

        this.addSkill({
            skill_id: 'health_longevity_001',
            name: 'Longevity & Life Extension',
            description: 'Implement evidence-based longevity and life extension practices.',
            category: 'health',
            points: 10,
            timeRequired: '50 hours',
            prerequisites: ['health_immune_001'],
            unlocks: ['health_biohacking_001'],
            position: { x: 200, y: 550 },
            achievements: [
                'Implement comprehensive longevity protocol',
                'Track and optimize health biomarkers',
                'Stay current with longevity research and practices'
            ]
        });

        this.addSkill({
            skill_id: 'health_biohacking_001',
            name: 'Health Optimization & Biohacking',
            description: 'Use advanced techniques to optimize health and performance.',
            category: 'health',
            points: 9,
            timeRequired: '45 hours',
            prerequisites: ['health_longevity_001'],
            unlocks: [],
            position: { x: 300, y: 550 },
            achievements: [
                'Experiment with safe biohacking techniques',
                'Track and measure health optimization results',
                'Integrate technology and science for health improvement'
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

        // Additional Finance Skills to reach 20+
        this.addSkill({
            skill_id: 'finances_saving_001',
            name: 'Emergency Fund & Savings',
            description: 'Build and maintain emergency fund and savings goals.',
            category: 'finances',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['finances_budgeting_001'],
            unlocks: ['finances_debt_001'],
            position: { x: 700, y: 400 },
            achievements: [
                'Build emergency fund covering 6 months of expenses',
                'Save consistently toward financial goals',
                'Automate savings and emergency fund contributions'
            ]
        });

        this.addSkill({
            skill_id: 'finances_debt_001',
            name: 'Debt Management',
            description: 'Effectively manage and eliminate debt.',
            category: 'finances',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['finances_saving_001'],
            unlocks: ['finances_credit_001'],
            position: { x: 750, y: 450 },
            achievements: [
                'Create and follow a debt elimination plan',
                'Reduce total debt by 50% or eliminate completely',
                'Avoid taking on new unnecessary debt'
            ]
        });

        this.addSkill({
            skill_id: 'finances_credit_001',
            name: 'Credit Management',
            description: 'Build and maintain excellent credit score and history.',
            category: 'finances',
            points: 5,
            timeRequired: '25 hours',
            prerequisites: ['finances_debt_001'],
            unlocks: ['finances_planning_001'],
            position: { x: 800, y: 400 },
            achievements: [
                'Achieve and maintain credit score above 750',
                'Understand factors that impact credit score',
                'Use credit strategically and responsibly'
            ]
        });

        this.addSkill({
            skill_id: 'finances_planning_001',
            name: 'Financial Planning',
            description: 'Create comprehensive long-term financial plans.',
            category: 'finances',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['finances_investing_001', 'finances_credit_001'],
            unlocks: ['finances_retirement_001'],
            position: { x: 650, y: 500 },
            achievements: [
                'Create 10, 20, and 30-year financial plans',
                'Set and track progress toward financial goals',
                'Adjust financial plans based on life changes'
            ]
        });

        this.addSkill({
            skill_id: 'finances_retirement_001',
            name: 'Retirement Planning',
            description: 'Plan and save for a secure retirement.',
            category: 'finances',
            points: 9,
            timeRequired: '45 hours',
            prerequisites: ['finances_planning_001'],
            unlocks: ['finances_insurance_001'],
            position: { x: 550, y: 500 },
            achievements: [
                'Calculate retirement savings needs accurately',
                'Maximize employer retirement plan contributions',
                'Diversify retirement savings across multiple accounts'
            ]
        });

        this.addSkill({
            skill_id: 'finances_insurance_001',
            name: 'Insurance & Risk Management',
            description: 'Protect assets and income through appropriate insurance.',
            category: 'finances',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['finances_retirement_001'],
            unlocks: ['finances_taxes_001'],
            position: { x: 750, y: 500 },
            achievements: [
                'Assess and purchase appropriate insurance coverage',
                'Understand different types of insurance and their purposes',
                'Review and optimize insurance coverage annually'
            ]
        });

        this.addSkill({
            skill_id: 'finances_taxes_001',
            name: 'Tax Optimization',
            description: 'Optimize tax strategies and minimize tax liability legally.',
            category: 'finances',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['finances_insurance_001'],
            unlocks: ['finances_real_estate_001'],
            position: { x: 850, y: 450 },
            achievements: [
                'Implement tax-advantaged savings strategies',
                'Understand tax implications of financial decisions',
                'Use tax software or professional help effectively'
            ]
        });

        this.addSkill({
            skill_id: 'finances_real_estate_001',
            name: 'Real Estate Investment',
            description: 'Understand and invest in real estate effectively.',
            category: 'finances',
            points: 9,
            timeRequired: '45 hours',
            prerequisites: ['finances_taxes_001'],
            unlocks: ['finances_business_001'],
            position: { x: 500, y: 550 },
            achievements: [
                'Research and analyze real estate investment opportunities',
                'Purchase and manage rental property successfully',
                'Understand real estate market trends and cycles'
            ]
        });

        this.addSkill({
            skill_id: 'finances_business_001',
            name: 'Business Finance',
            description: 'Understand business finances and investment opportunities.',
            category: 'finances',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['finances_real_estate_001'],
            unlocks: ['finances_advanced_investing_001'],
            position: { x: 600, y: 550 },
            achievements: [
                'Analyze business financial statements',
                'Invest in or start a profitable business',
                'Understand business valuation principles'
            ]
        });

        this.addSkill({
            skill_id: 'finances_advanced_investing_001',
            name: 'Advanced Investment Strategies',
            description: 'Master advanced investment techniques and strategies.',
            category: 'finances',
            points: 10,
            timeRequired: '50 hours',
            prerequisites: ['finances_business_001'],
            unlocks: ['finances_wealth_building_001'],
            position: { x: 700, y: 550 },
            achievements: [
                'Use advanced investment strategies successfully',
                'Understand options, derivatives, and complex investments',
                'Achieve above-average investment returns consistently'
            ]
        });

        this.addSkill({
            skill_id: 'finances_wealth_building_001',
            name: 'Wealth Building & Accumulation',
            description: 'Build significant wealth through systematic strategies.',
            category: 'finances',
            points: 10,
            timeRequired: '50 hours',
            prerequisites: ['finances_advanced_investing_001'],
            unlocks: ['finances_passive_income_001'],
            position: { x: 800, y: 550 },
            achievements: [
                'Achieve net worth of $100,000+ through systematic saving',
                'Build multiple income streams',
                'Implement compound growth strategies effectively'
            ]
        });

        this.addSkill({
            skill_id: 'finances_passive_income_001',
            name: 'Passive Income Generation',
            description: 'Create sustainable passive income streams.',
            category: 'finances',
            points: 9,
            timeRequired: '45 hours',
            prerequisites: ['finances_wealth_building_001'],
            unlocks: ['finances_financial_independence_001'],
            position: { x: 450, y: 600 },
            achievements: [
                'Generate $1,000+ monthly passive income',
                'Create multiple passive income sources',
                'Scale passive income strategies successfully'
            ]
        });

        this.addSkill({
            skill_id: 'finances_financial_independence_001',
            name: 'Financial Independence',
            description: 'Achieve financial independence and freedom.',
            category: 'finances',
            points: 15,
            timeRequired: '75 hours',
            prerequisites: ['finances_passive_income_001'],
            unlocks: ['finances_philanthropy_001'],
            position: { x: 550, y: 600 },
            achievements: [
                'Achieve financial independence (25x annual expenses saved)',
                'Have options to retire early if desired',
                'Live comfortably from investment income'
            ]
        });

        this.addSkill({
            skill_id: 'finances_philanthropy_001',
            name: 'Charitable Giving & Philanthropy',
            description: 'Give back through strategic charitable giving.',
            category: 'finances',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['finances_financial_independence_001'],
            unlocks: ['finances_estate_planning_001'],
            position: { x: 650, y: 600 },
            achievements: [
                'Donate regularly to meaningful causes',
                'Use tax-advantaged giving strategies',
                'Create lasting impact through philanthropic efforts'
            ]
        });

        this.addSkill({
            skill_id: 'finances_estate_planning_001',
            name: 'Estate Planning',
            description: 'Plan for wealth transfer and legacy preservation.',
            category: 'finances',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['finances_philanthropy_001'],
            unlocks: ['finances_international_001'],
            position: { x: 750, y: 600 },
            achievements: [
                'Create comprehensive estate plan with legal help',
                'Set up trusts and beneficiaries appropriately',
                'Plan for wealth transfer to next generation'
            ]
        });

        this.addSkill({
            skill_id: 'finances_international_001',
            name: 'International Finance',
            description: 'Navigate international finance and global investments.',
            category: 'finances',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['finances_estate_planning_001'],
            unlocks: ['finances_financial_literacy_teaching_001'],
            position: { x: 500, y: 650 },
            achievements: [
                'Invest in international markets successfully',
                'Understand currency exchange and international banking',
                'Navigate tax implications of international investments'
            ]
        });

        this.addSkill({
            skill_id: 'finances_financial_literacy_teaching_001',
            name: 'Financial Education & Teaching',
            description: 'Teach financial literacy to others.',
            category: 'finances',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['finances_international_001'],
            unlocks: [],
            position: { x: 600, y: 650 },
            achievements: [
                'Teach financial literacy to family members',
                'Mentor others in financial planning and investing',
                'Share financial knowledge through teaching or writing'
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

        // Additional Spirituality Skills to reach 20+
        this.addSkill({
            skill_id: 'spirituality_gratitude_001',
            name: 'Gratitude Practice',
            description: 'Develop deep appreciation and thankfulness practices.',
            category: 'spirituality',
            points: 4,
            timeRequired: '20 hours',
            prerequisites: ['spirituality_meditation_001'],
            unlocks: ['spirituality_mindfulness_001'],
            position: { x: 1100, y: 400 },
            achievements: [
                'Maintain daily gratitude journal for 90 days',
                'Express gratitude to others regularly',
                'Find appreciation in challenging situations'
            ]
        });

        this.addSkill({
            skill_id: 'spirituality_mindfulness_001',
            name: 'Mindfulness Practice',
            description: 'Cultivate present-moment awareness in daily life.',
            category: 'spirituality',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['spirituality_gratitude_001'],
            unlocks: ['spirituality_contemplation_001'],
            position: { x: 1150, y: 450 },
            achievements: [
                'Practice mindfulness during daily activities',
                'Maintain present-moment awareness for extended periods',
                'Use mindfulness to manage stress and emotions'
            ]
        });

        this.addSkill({
            skill_id: 'spirituality_contemplation_001',
            name: 'Contemplative Practice',
            description: 'Engage in deep reflection and contemplative practices.',
            category: 'spirituality',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['spirituality_mindfulness_001'],
            unlocks: ['spirituality_prayer_001'],
            position: { x: 1200, y: 400 },
            achievements: [
                'Establish regular contemplative practice',
                'Engage in deep reflection on life questions',
                'Use contemplation for personal insight and growth'
            ]
        });

        this.addSkill({
            skill_id: 'spirituality_prayer_001',
            name: 'Prayer & Devotion',
            description: 'Develop meaningful prayer or devotional practices.',
            category: 'spirituality',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['spirituality_contemplation_001'],
            unlocks: ['spirituality_service_001'],
            position: { x: 950, y: 500 },
            achievements: [
                'Establish consistent prayer or devotional routine',
                'Experience deeper connection through prayer',
                'Use prayer for guidance and spiritual strength'
            ]
        });

        this.addSkill({
            skill_id: 'spirituality_service_001',
            name: 'Service & Compassion',
            description: 'Serve others and cultivate compassion as spiritual practice.',
            category: 'spirituality',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['spirituality_prayer_001'],
            unlocks: ['spirituality_forgiveness_001'],
            position: { x: 1050, y: 500 },
            achievements: [
                'Volunteer regularly in service to others',
                'Practice acts of kindness without expectation',
                'Develop genuine compassion for all beings'
            ]
        });

        this.addSkill({
            skill_id: 'spirituality_forgiveness_001',
            name: 'Forgiveness & Letting Go',
            description: 'Practice forgiveness as a spiritual discipline.',
            category: 'spirituality',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['spirituality_service_001'],
            unlocks: ['spirituality_wisdom_001'],
            position: { x: 1150, y: 500 },
            achievements: [
                'Forgive those who have hurt you deeply',
                'Release resentment and anger completely',
                'Practice self-forgiveness and self-compassion'
            ]
        });

        this.addSkill({
            skill_id: 'spirituality_wisdom_001',
            name: 'Wisdom & Discernment',
            description: 'Develop spiritual wisdom and discernment.',
            category: 'spirituality',
            points: 9,
            timeRequired: '45 hours',
            prerequisites: ['spirituality_forgiveness_001'],
            unlocks: ['spirituality_study_001'],
            position: { x: 1250, y: 450 },
            achievements: [
                'Make decisions based on wisdom rather than impulse',
                'Develop discernment in spiritual matters',
                'Share wisdom with others appropriately'
            ]
        });

        this.addSkill({
            skill_id: 'spirituality_study_001',
            name: 'Spiritual Study & Learning',
            description: 'Engage in serious study of spiritual texts and teachings.',
            category: 'spirituality',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['spirituality_wisdom_001'],
            unlocks: ['spirituality_community_001'],
            position: { x: 900, y: 550 },
            achievements: [
                'Study spiritual texts and teachings regularly',
                'Understand multiple spiritual traditions',
                'Apply spiritual teachings to daily life'
            ]
        });

        this.addSkill({
            skill_id: 'spirituality_community_001',
            name: 'Spiritual Community',
            description: 'Participate in spiritual community and fellowship.',
            category: 'spirituality',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['spirituality_study_001'],
            unlocks: ['spirituality_retreat_001'],
            position: { x: 1000, y: 550 },
            achievements: [
                'Participate actively in spiritual community',
                'Build meaningful relationships with fellow seekers',
                'Contribute to spiritual community growth and support'
            ]
        });

        this.addSkill({
            skill_id: 'spirituality_retreat_001',
            name: 'Retreats & Solitude',
            description: 'Use retreats and solitude for spiritual deepening.',
            category: 'spirituality',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['spirituality_community_001'],
            unlocks: ['spirituality_nature_001'],
            position: { x: 1100, y: 550 },
            achievements: [
                'Attend spiritual retreats regularly',
                'Use solitude for spiritual growth and reflection',
                'Create sacred space and time for spiritual practice'
            ]
        });

        this.addSkill({
            skill_id: 'spirituality_nature_001',
            name: 'Nature Spirituality',
            description: 'Connect with the divine through nature and creation.',
            category: 'spirituality',
            points: 5,
            timeRequired: '25 hours',
            prerequisites: ['spirituality_retreat_001'],
            unlocks: ['spirituality_creativity_001'],
            position: { x: 1200, y: 550 },
            achievements: [
                'Spend time in nature for spiritual connection',
                'Practice environmental stewardship as spiritual discipline',
                'Find spiritual meaning in natural cycles and seasons'
            ]
        });

        this.addSkill({
            skill_id: 'spirituality_creativity_001',
            name: 'Creative Spirituality',
            description: 'Express spirituality through creative arts and expression.',
            category: 'spirituality',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['spirituality_nature_001'],
            unlocks: ['spirituality_healing_001'],
            position: { x: 950, y: 600 },
            achievements: [
                'Use creative arts as spiritual practice',
                'Express spiritual insights through creativity',
                'Find the divine in artistic expression'
            ]
        });

        this.addSkill({
            skill_id: 'spirituality_healing_001',
            name: 'Spiritual Healing',
            description: 'Practice spiritual healing for self and others.',
            category: 'spirituality',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['spirituality_creativity_001'],
            unlocks: ['spirituality_mysticism_001'],
            position: { x: 1050, y: 600 },
            achievements: [
                'Practice healing prayer or energy work',
                'Experience spiritual healing in your own life',
                'Help facilitate healing in others'
            ]
        });

        this.addSkill({
            skill_id: 'spirituality_mysticism_001',
            name: 'Mystical Experience',
            description: 'Cultivate and understand mystical and transcendent experiences.',
            category: 'spirituality',
            points: 10,
            timeRequired: '50 hours',
            prerequisites: ['spirituality_healing_001'],
            unlocks: ['spirituality_teaching_001'],
            position: { x: 1150, y: 600 },
            achievements: [
                'Experience transcendent or mystical states',
                'Integrate mystical experiences with daily life',
                'Understand the role of mysticism in spiritual growth'
            ]
        });

        this.addSkill({
            skill_id: 'spirituality_teaching_001',
            name: 'Spiritual Teaching & Guidance',
            description: 'Guide others in their spiritual journey.',
            category: 'spirituality',
            points: 9,
            timeRequired: '45 hours',
            prerequisites: ['spirituality_mysticism_001'],
            unlocks: ['spirituality_leadership_001'],
            position: { x: 900, y: 650 },
            achievements: [
                'Mentor others in spiritual practice and growth',
                'Lead spiritual classes or groups',
                'Share spiritual wisdom through teaching or writing'
            ]
        });

        this.addSkill({
            skill_id: 'spirituality_leadership_001',
            name: 'Spiritual Leadership',
            description: 'Provide spiritual leadership in community and family.',
            category: 'spirituality',
            points: 10,
            timeRequired: '50 hours',
            prerequisites: ['spirituality_teaching_001'],
            unlocks: ['spirituality_interfaith_001'],
            position: { x: 1000, y: 650 },
            achievements: [
                'Lead spiritual community or family in spiritual practices',
                'Provide spiritual guidance during difficult times',
                'Model spiritual maturity and wisdom for others'
            ]
        });

        this.addSkill({
            skill_id: 'spirituality_interfaith_001',
            name: 'Interfaith Understanding',
            description: 'Understand and appreciate diverse spiritual traditions.',
            category: 'spirituality',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['spirituality_leadership_001'],
            unlocks: ['spirituality_legacy_001'],
            position: { x: 1100, y: 650 },
            achievements: [
                'Study and appreciate multiple religious traditions',
                'Build bridges between different spiritual communities',
                'Find common ground in diverse spiritual practices'
            ]
        });

        this.addSkill({
            skill_id: 'spirituality_legacy_001',
            name: 'Spiritual Legacy',
            description: 'Create lasting spiritual impact and legacy.',
            category: 'spirituality',
            points: 12,
            timeRequired: '60 hours',
            prerequisites: ['spirituality_interfaith_001'],
            unlocks: [],
            position: { x: 1200, y: 650 },
            achievements: [
                'Create lasting positive spiritual impact on others',
                'Establish spiritual practices that will continue after you',
                'Leave a legacy of spiritual wisdom and compassion'
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

        // Additional Emotions Skills to reach 20+
        this.addSkill({
            skill_id: 'emotions_regulation_001',
            name: 'Emotional Regulation',
            description: 'Master techniques for managing and regulating emotions.',
            category: 'emotions',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['emotions_selfaware_001'],
            unlocks: ['emotions_resilience_001'],
            position: { x: 700, y: 650 },
            achievements: [
                'Manage intense emotions without being overwhelmed',
                'Use healthy coping strategies consistently',
                'Help others regulate their emotions effectively'
            ]
        });

        this.addSkill({
            skill_id: 'emotions_resilience_001',
            name: 'Emotional Resilience',
            description: 'Build resilience to bounce back from emotional challenges.',
            category: 'emotions',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['emotions_regulation_001'],
            unlocks: ['emotions_empathy_001'],
            position: { x: 750, y: 700 },
            achievements: [
                'Recover quickly from emotional setbacks',
                'Maintain emotional stability during crises',
                'Build emotional strength through challenges'
            ]
        });

        this.addSkill({
            skill_id: 'emotions_empathy_001',
            name: 'Advanced Empathy',
            description: 'Develop deep empathy and emotional understanding of others.',
            category: 'emotions',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['emotions_resilience_001'],
            unlocks: ['emotions_compassion_001'],
            position: { x: 550, y: 750 },
            achievements: [
                'Understand others\' emotions accurately',
                'Provide empathetic support without becoming overwhelmed',
                'Use empathy to build stronger relationships'
            ]
        });

        this.addSkill({
            skill_id: 'emotions_compassion_001',
            name: 'Self-Compassion',
            description: 'Practice kindness and compassion toward yourself.',
            category: 'emotions',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['emotions_empathy_001'],
            unlocks: ['emotions_boundaries_001'],
            position: { x: 650, y: 750 },
            achievements: [
                'Treat yourself with kindness during difficult times',
                'Replace self-criticism with self-compassion',
                'Practice self-forgiveness and acceptance'
            ]
        });

        this.addSkill({
            skill_id: 'emotions_boundaries_001',
            name: 'Emotional Boundaries',
            description: 'Set healthy emotional boundaries with others.',
            category: 'emotions',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['emotions_compassion_001'],
            unlocks: ['emotions_communication_001'],
            position: { x: 750, y: 750 },
            achievements: [
                'Protect your emotional well-being in relationships',
                'Say no to emotional manipulation or abuse',
                'Maintain empathy while protecting your own emotions'
            ]
        });

        this.addSkill({
            skill_id: 'emotions_communication_001',
            name: 'Emotional Communication',
            description: 'Express emotions clearly and constructively.',
            category: 'emotions',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['emotions_boundaries_001'],
            unlocks: ['emotions_conflict_001'],
            position: { x: 500, y: 800 },
            achievements: [
                'Express difficult emotions without attacking others',
                'Use "I" statements to communicate feelings',
                'Help others express their emotions healthily'
            ]
        });

        this.addSkill({
            skill_id: 'emotions_conflict_001',
            name: 'Emotional Conflict Resolution',
            description: 'Navigate emotional conflicts with wisdom and skill.',
            category: 'emotions',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['emotions_communication_001'],
            unlocks: ['emotions_healing_001'],
            position: { x: 600, y: 800 },
            achievements: [
                'Resolve emotional conflicts without damaging relationships',
                'Address underlying emotional issues in conflicts',
                'Mediate emotional disputes between others'
            ]
        });

        this.addSkill({
            skill_id: 'emotions_healing_001',
            name: 'Emotional Healing',
            description: 'Heal from past emotional wounds and trauma.',
            category: 'emotions',
            points: 9,
            timeRequired: '45 hours',
            prerequisites: ['emotions_conflict_001'],
            unlocks: ['emotions_intuition_001'],
            position: { x: 700, y: 800 },
            achievements: [
                'Process and heal from past emotional trauma',
                'Help others in their emotional healing journey',
                'Transform emotional pain into wisdom and strength'
            ]
        });

        this.addSkill({
            skill_id: 'emotions_intuition_001',
            name: 'Emotional Intuition',
            description: 'Develop and trust your emotional intuition.',
            category: 'emotions',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['emotions_healing_001'],
            unlocks: ['emotions_creativity_001'],
            position: { x: 800, y: 750 },
            achievements: [
                'Trust and follow your emotional intuition',
                'Read emotional undercurrents in situations accurately',
                'Use emotional intelligence for decision-making'
            ]
        });

        this.addSkill({
            skill_id: 'emotions_creativity_001',
            name: 'Emotional Creativity',
            description: 'Use emotions as fuel for creative expression.',
            category: 'emotions',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['emotions_intuition_001'],
            unlocks: ['emotions_leadership_001'],
            position: { x: 450, y: 850 },
            achievements: [
                'Channel emotions into creative projects',
                'Use art, writing, or music to express emotions',
                'Help others express emotions creatively'
            ]
        });

        this.addSkill({
            skill_id: 'emotions_leadership_001',
            name: 'Emotional Leadership',
            description: 'Lead others with emotional intelligence and wisdom.',
            category: 'emotions',
            points: 9,
            timeRequired: '45 hours',
            prerequisites: ['emotions_creativity_001'],
            unlocks: ['emotions_motivation_001'],
            position: { x: 550, y: 850 },
            achievements: [
                'Lead teams with high emotional intelligence',
                'Create emotionally healthy environments',
                'Inspire and motivate others through emotional connection'
            ]
        });

        this.addSkill({
            skill_id: 'emotions_motivation_001',
            name: 'Emotional Motivation',
            description: 'Use emotions to fuel motivation and achievement.',
            category: 'emotions',
            points: 7,
            timeRequired: '35 hours',
            prerequisites: ['emotions_leadership_001'],
            unlocks: ['emotions_mindfulness_001'],
            position: { x: 650, y: 850 },
            achievements: [
                'Transform negative emotions into positive motivation',
                'Maintain motivation during difficult periods',
                'Help others find emotional motivation'
            ]
        });

        this.addSkill({
            skill_id: 'emotions_mindfulness_001',
            name: 'Emotional Mindfulness',
            description: 'Practice mindful awareness of emotions without judgment.',
            category: 'emotions',
            points: 6,
            timeRequired: '30 hours',
            prerequisites: ['emotions_motivation_001'],
            unlocks: ['emotions_wisdom_001'],
            position: { x: 750, y: 850 },
            achievements: [
                'Observe emotions without being controlled by them',
                'Practice non-judgmental awareness of emotional states',
                'Use mindfulness to understand emotional patterns'
            ]
        });

        this.addSkill({
            skill_id: 'emotions_wisdom_001',
            name: 'Emotional Wisdom',
            description: 'Develop deep wisdom about emotions and their role in life.',
            category: 'emotions',
            points: 10,
            timeRequired: '50 hours',
            prerequisites: ['emotions_mindfulness_001'],
            unlocks: ['emotions_teaching_001'],
            position: { x: 500, y: 900 },
            achievements: [
                'Understand the deeper purpose and meaning of emotions',
                'Make wise decisions based on emotional intelligence',
                'Share emotional wisdom with others'
            ]
        });

        this.addSkill({
            skill_id: 'emotions_teaching_001',
            name: 'Emotional Education',
            description: 'Teach emotional intelligence and skills to others.',
            category: 'emotions',
            points: 8,
            timeRequired: '40 hours',
            prerequisites: ['emotions_wisdom_001'],
            unlocks: ['emotions_mastery_001'],
            position: { x: 600, y: 900 },
            achievements: [
                'Teach emotional intelligence to children or adults',
                'Create curricula or programs for emotional learning',
                'Help others develop their emotional skills'
            ]
        });

        this.addSkill({
            skill_id: 'emotions_mastery_001',
            name: 'Emotional Mastery',
            description: 'Achieve mastery over your emotional life.',
            category: 'emotions',
            points: 12,
            timeRequired: '60 hours',
            prerequisites: ['emotions_teaching_001'],
            unlocks: ['emotions_transcendence_001'],
            position: { x: 700, y: 900 },
            achievements: [
                'Maintain emotional equilibrium in all situations',
                'Transform any emotion into positive energy',
                'Model emotional mastery for others'
            ]
        });

        this.addSkill({
            skill_id: 'emotions_transcendence_001',
            name: 'Emotional Transcendence',
            description: 'Transcend emotional reactivity and achieve emotional freedom.',
            category: 'emotions',
            points: 15,
            timeRequired: '75 hours',
            prerequisites: ['emotions_mastery_001'],
            unlocks: [],
            position: { x: 800, y: 900 },
            achievements: [
                'Achieve freedom from emotional suffering',
                'Experience emotions fully without being controlled by them',
                'Help others achieve emotional transcendence'
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