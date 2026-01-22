import { Code, PenTool, Camera, BookOpen, Music, Video, Megaphone, Smartphone } from "lucide-react";

export interface Skill {
  id: string;
  name: string;
  icon: any;
  category: "Tech" | "Creative" | "Academic" | "Lifestyle";
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  school: string;
  offering: Skill[];
  seeking: Skill[];
  bio: string;
}

export const skills: Skill[] = [
  { id: "1", name: "Web Development", icon: Code, category: "Tech" },
  { id: "2", name: "Graphic Design", icon: PenTool, category: "Creative" },
  { id: "3", name: "Photography", icon: Camera, category: "Creative" },
  { id: "4", name: "Content Writing", icon: BookOpen, category: "Creative" },
  { id: "5", name: "App Development", icon: Smartphone, category: "Tech" },
  { id: "6", name: "Video Editing", icon: Video, category: "Creative" },
  { id: "7", name: "Marketing", icon: Megaphone, category: "Lifestyle" },
  { id: "8", name: "Music Production", icon: Music, category: "Creative" },
];

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Alex Chen",
    avatar: "https://images.unsplash.com/photo-1759884248009-92c5e957708e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMHNjaWVuY2UlMjBzdHVkZW50JTIwY29kaW5nfGVufDF8fHx8MTc2Nzk1Mzk3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    role: "CS Student",
    school: "Tech University",
    offering: [skills[0], skills[4]], // Web Dev, App Dev
    seeking: [skills[1]], // Graphic Design
    bio: "Building the next big thing. Need a killer logo to go with my spaghetti code.",
  },
  {
    id: "2",
    name: "Sarah Miller",
    avatar: "https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGNyZWF0aXZlJTIwZGVzaWduZXIlMjBzdHVkZW50fGVufDF8fHx8MTc2Nzk1Mzk3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    role: "Design Major",
    school: "Art Institute",
    offering: [skills[1], skills[2]], // Graphic Design, Photography
    seeking: [skills[0]], // Web Dev
    bio: "I make things look good. Need a portfolio site to showcase my work.",
  },
  {
    id: "3",
    name: "Jordan Smith",
    avatar: "https://images.unsplash.com/photo-1550592704-6c76defa9985?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwd3JpdGluZyUyMG5vdGVib29rfGVufDF8fHx8MTc2Nzk1Mzk3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    role: "English Lit",
    school: "State College",
    offering: [skills[3]], // Content Writing
    seeking: [skills[2], skills[6]], // Photography, Marketing
    bio: "Wordsmith looking for someone to take headshots for my upcoming book launch.",
  },
  {
    id: "4",
    name: "Emily Davis",
    avatar: "https://images.unsplash.com/photo-1622179986499-fa3dfabc8ef3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwc3R1ZGVudCUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwxfHx8fDE3Njc5NTM5Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    role: "Film Student",
    school: "Cinema Academy",
    offering: [skills[5]], // Video Editing
    seeking: [skills[7]], // Music
    bio: "Need custom beats for my short film. I can edit your vlogs in return!",
  },
];
