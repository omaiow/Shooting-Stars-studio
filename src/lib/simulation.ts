import { faker } from '@faker-js/faker';
import { supabase } from './supabase';
import type { User, Skill } from './types';

// Constants for simulation
const SKILLS_LIST = [
    'Programming', 'Web Development', 'Mobile Development', 'Data Science',
    'Machine Learning', 'UI/UX Design', 'Graphic Design', 'Photography',
    'Video Editing', 'Music Production', 'Guitar', 'Piano', 'Singing',
    'Drawing', 'Painting', 'Writing', 'Public Speaking', 'Marketing',
    'Business', 'Finance', 'Cooking', 'Fitness', 'Yoga', 'Languages',
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Philosophy'
];

export type ScenarioType = 'baseline' | 'scarcity';

export interface SimulationStats {
    totalUsers: number;
    matchRate: number;
    totalSwipes: number;
    totalMatches: number;
}

export const generateUser = (scenario: ScenarioType = 'baseline'): Partial<User> & { password?: string } => {
    // Basic profile
    const user = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: 'password123', // Default password for all sim users
        role: faker.person.jobTitle(),
        school: faker.company.name(), // Using company as school proxy
        bio: faker.person.bio(),
        avatar: faker.image.avatar(),
        offering: [] as { name: string }[],
        seeking: [] as { name: string }[],
    };

    // Skill logic based on scenario
    if (scenario === 'scarcity') {
        // High Scarcity: 90% need Web Dev, 10% offer it
        const isDeveloper = Math.random() < 0.1;

        if (isDeveloper) {
            user.offering.push({ name: 'Web Development' });
            user.seeking.push({ name: faker.helpers.arrayElement(SKILLS_LIST) });
        } else {
            user.offering.push({ name: faker.helpers.arrayElement(SKILLS_LIST) }); // Offer random
            user.seeking.push({ name: 'Web Development' }); // Seek Web Dev
        }
    } else {
        // Baseline: Random distribution
        const offeringCount = faker.number.int({ min: 1, max: 3 });
        const seekingCount = faker.number.int({ min: 1, max: 3 });

        user.offering = faker.helpers.arrayElements(SKILLS_LIST, offeringCount).map(name => ({ name }));
        user.seeking = faker.helpers.arrayElements(SKILLS_LIST, seekingCount).map(name => ({ name }));
    }

    return user;
};

export const seedPopulation = async (count: number, scenario: ScenarioType) => {
    const users = Array.from({ length: count }, () => generateUser(scenario));
    let createdCount = 0;

    for (const user of users) {
        try {
            // 1. Create Auth User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: user.email!,
                password: user.password!,
            });

            if (authError) continue;
            if (!authData.user) continue;

            const userId = authData.user.id;

            // 2. Create Profile
            const { error: profileError } = await supabase.from('profiles').insert({
                id: userId,
                name: user.name,
                email: user.email,
                role: user.role,
                school: user.school,
                bio: user.bio,
                avatar: user.avatar,
            });

            if (profileError) continue;

            // 3. Add Skills
            // Offering
            for (const skill of user.offering!) {
                await supabase.from('skills').insert({
                    user_id: userId,
                    name: skill.name,
                    is_offering: true
                });
            }

            // Seeking
            for (const skill of user.seeking!) {
                await supabase.from('skills').insert({
                    user_id: userId,
                    name: skill.name,
                    is_offering: false
                });
            }

            createdCount++;
        } catch (error) {
            console.error('Error seeding user:', error);
        }
    }

    return createdCount;
};

export const clearSimulationData = async () => {
    // This is risky in prod, but fine for this specific simulation scope
    // Ideally we'd delete only simulation users, but we don't have a flag for that yet.
    // For now, we will NOT implement full delete to avoid wiping real data accidentally.
    // We'll just return a warning for now.
    console.warn("Bulk delete not implemented for safety.");
};
