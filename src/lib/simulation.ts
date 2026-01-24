import { faker } from '@faker-js/faker';
import type { User, Skill } from './types';

// Constants for simulation
export const SKILLS_LIST = [
    'Programming', 'Web Development', 'Mobile Development', 'Data Science',
    'Machine Learning', 'UI/UX Design', 'Graphic Design', 'Photography',
    'Video Editing', 'Music Production', 'Guitar', 'Piano', 'Singing',
    'Drawing', 'Painting', 'Writing', 'Public Speaking', 'Marketing',
    'Business', 'Finance', 'Cooking', 'Fitness', 'Yoga', 'Languages',
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Philosophy'
];

export type ScenarioType = 'baseline' | 'scarcity' | 'custom';

export const generateUser = (scenario: ScenarioType = 'baseline', idPrefix: string = 'sim'): User => {
    const id = `${idPrefix}-${faker.string.uuid()}`;
    const name = faker.person.fullName();
    const role = faker.person.jobTitle();
    const school = faker.company.name();
    const bio = faker.person.bio();
    const avatar = faker.image.avatar();

    let offering: Skill[] = [];
    let seeking: Skill[] = [];

    // Skill logic based on scenario
    if (scenario === 'scarcity') {
        // High Scarcity: 90% need Web Dev, 10% offer it
        const isDeveloper = Math.random() < 0.1;

        if (isDeveloper) {
            offering.push({ id: `skill-${faker.string.uuid()}`, name: 'Web Development' });
            seeking.push({ id: `skill-${faker.string.uuid()}`, name: faker.helpers.arrayElement(SKILLS_LIST) });
        } else {
            offering.push({ id: `skill-${faker.string.uuid()}`, name: faker.helpers.arrayElement(SKILLS_LIST) });
            seeking.push({ id: `skill-${faker.string.uuid()}`, name: 'Web Development' });
        }
    } else {
        // Baseline: Random distribution
        const offeringCount = faker.number.int({ min: 1, max: 3 });
        const seekingCount = faker.number.int({ min: 1, max: 3 });

        offering = faker.helpers.arrayElements(SKILLS_LIST, offeringCount).map(name => ({
            id: `skill-${faker.string.uuid()}`,
            name
        }));

        seeking = faker.helpers.arrayElements(SKILLS_LIST, seekingCount).map(name => ({
            id: `skill-${faker.string.uuid()}`,
            name
        }));
    }

    return {
        id,
        name,
        email: faker.internet.email(), // Optional but good for realism
        role,
        school,
        bio,
        avatar,
        offering,
        seeking,
        created_at: new Date().toISOString()
    };
};

export const generatePopulation = (count: number, scenario: ScenarioType): User[] => {
    return Array.from({ length: count }, () => generateUser(scenario));
};
