import { Code, PenTool, Camera, BookOpen, Music, Video, Megaphone, Smartphone } from "lucide-react";

export const skills = [
  { id: "1", name: "Web Development", icon: Code, category: "Tech" },
  { id: "2", name: "Graphic Design", icon: PenTool, category: "Creative" },
  { id: "3", name: "Photography", icon: Camera, category: "Creative" },
  { id: "4", name: "Content Writing", icon: BookOpen, category: "Creative" },
  { id: "5", name: "App Development", icon: Smartphone, category: "Tech" },
  { id: "6", name: "Video Editing", icon: Video, category: "Creative" },
  { id: "7", name: "Marketing", icon: Megaphone, category: "Lifestyle" },
  { id: "8", name: "Music Production", icon: Music, category: "Creative" },
];

export const CURRENT_USER = {
  id: "current-user-id",
  name: "Alex Explorer",
  email: "alex@space.com",
  avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&auto=format&fit=crop&q=60",
  bio: "Full-stack developer looking to learn guitar. I love space and coding!",
  school: "Cosmos University",
  role: "Explorer",
  offering: [skills[0], skills[4]], // React is Web Dev (0), Node.js (mapped to App Dev for now or similar)
  seeking: [skills[7]], // Guitar -> Music Production (close enough for mock)
};

export const MOCK_USERS = [
  {
    id: "1",
    name: "Sarah Stellar",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60",
    bio: "Graphic designer wanting to learn to code. I can teach you Photoshop!",
    school: "Nebula Arts",
    role: "Designer",
    offering: [{ id: "1", name: "Graphic Design" }, { id: "2", name: "Photoshop" }],
    seeking: [{ id: "3", name: "React" }, { id: "4", name: "Web Dev" }]
  },
  {
    id: "2",
    name: "Mike Meteor",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60",
    bio: "Guitarist in a band. Looking for someone to help me build a website.",
    school: "Rock Star Academy",
    role: "Musician",
    offering: [{ id: "5", name: "Guitar" }, { id: "6", name: "Music Theory" }],
    seeking: [{ id: "7", name: "HTML/CSS" }, { id: "8", name: "JavaScript" }]
  },
  {
    id: "3",
    name: "Luna Lander",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=60",
    bio: "Chef who wants to learn Spanish. I make the best lasagna in the galaxy.",
    school: "Culinary Institute",
    role: "Chef",
    offering: [{ id: "9", name: "Cooking" }, { id: "10", name: "Italian Cuisine" }],
    seeking: [{ id: "11", name: "Spanish" }, { id: "12", name: "Language" }]
  },
  {
    id: "4",
    name: "Comet Chris",
    avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60",
    bio: "Math tutor looking for piano lessons.",
    school: "Quantum High",
    role: "Tutor",
    offering: [{ id: "13", name: "Calculus" }, { id: "14", name: "Algebra" }],
    seeking: [{ id: "15", name: "Piano" }, { id: "16", name: "Music" }]
  },
  {
    id: "5",
    name: "Venus Violet",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60",
    bio: "Yoga instructor and wellness coach. Want to build a meditation app!",
    school: "Wellness University",
    role: "Yoga Instructor",
    offering: [{ id: "17", name: "Yoga" }, { id: "18", name: "Meditation" }],
    seeking: [{ id: "19", name: "App Development" }, { id: "20", name: "UI Design" }]
  },
  {
    id: "6",
    name: "Nova Knight",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60",
    bio: "Python developer and data science enthusiast. Need help with data visualization.",
    school: "Data Science Academy",
    role: "Developer",
    offering: [{ id: "21", name: "Python" }, { id: "22", name: "Machine Learning" }],
    seeking: [{ id: "23", name: "Data Visualization" }, { id: "24", name: "Tableau" }]
  },
  {
    id: "7",
    name: "Stella Swift",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&auto=format&fit=crop&q=60",
    bio: "Marketing guru looking to learn video editing for social media campaigns.",
    school: "Business College",
    role: "Marketing Specialist",
    offering: [{ id: "25", name: "Social Media Marketing" }, { id: "26", name: "SEO" }],
    seeking: [{ id: "27", name: "Video Editing" }, { id: "28", name: "Adobe Premiere" }]
  },
  {
    id: "8",
    name: "Orion Blake",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60",
    bio: "3D animator working on indie game. Need someone who can compose music!",
    school: "Game Design Institute",
    role: "3D Artist",
    offering: [{ id: "29", name: "3D Modeling" }, { id: "30", name: "Blender" }],
    seeking: [{ id: "31", name: "Music Composition" }, { id: "32", name: "Sound Design" }]
  },
  {
    id: "9",
    name: "Aurora Chen",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60",
    bio: "Photographer specializing in portraits. Want to build my own portfolio website.",
    school: "Visual Arts School",
    role: "Photographer",
    offering: [{ id: "33", name: "Photography" }, { id: "34", name: "Lightroom" }],
    seeking: [{ id: "35", name: "Web Development" }, { id: "36", name: "WordPress" }]
  },
  {
    id: "10",
    name: "Phoenix Rivera",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=60",
    bio: "Blockchain developer. Looking to learn about cybersecurity.",
    school: "Tech Innovation Hub",
    role: "Blockchain Dev",
    offering: [{ id: "37", name: "Blockchain" }, { id: "38", name: "Solidity" }],
    seeking: [{ id: "39", name: "Cybersecurity" }, { id: "40", name: "Ethical Hacking" }]
  }
];

export const MOCK_MATCHES = [
  {
    id: "m1",
    users: ["current-user-id", "5"],
    otherUser: {
      id: "5",
      name: "Venus Violet",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60",
      bio: "Yoga instructor looking for coding help.",
      offering: [{ id: "17", name: "Yoga" }],
      seeking: [{ id: "18", name: "Python" }]
    },
    timestamp: new Date().toISOString()
  }
];
