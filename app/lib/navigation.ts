import { 
  LayoutDashboard, 
  BookOpen, 
  MessageCircle, 
  Languages, 
  Mic, 
  BarChart, 
  Users, 
  Settings,
  CalendarCheck,
  Brain,
  GraduationCap
} from 'lucide-react';

export const sidebarItems = [
  { name: 'dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['student', 'teacher', 'admin'] },
  { name: 'lessons', href: '/lesson', icon: BookOpen, roles: ['student', 'teacher', 'admin'] },
  { name: 'conversation', href: '/conversation', icon: MessageCircle, roles: ['student', 'teacher', 'admin'] },
  { name: 'pronunciation', href: '/pronunciation', icon: Mic, roles: ['student', 'teacher', 'admin'] },
  { name: 'vocabulary', href: '/vocabulary', icon: Languages, roles: ['student', 'teacher', 'admin'] },
  { name: 'flashcards', href: '/flashcards', icon: Brain, roles: ['student', 'teacher', 'admin'] },
  { name: 'progress', href: '/plan', icon: BarChart, roles: ['student', 'teacher', 'admin'] },
  { name: 'community', href: '/community', icon: Users, roles: ['student', 'teacher', 'admin'] },
  { name: 'teacherPanel', href: '/teacher', icon: GraduationCap, roles: ['teacher', 'admin'] },
  { name: 'analytics', href: '/analytics', icon: BarChart, roles: ['admin'] },
  { name: 'settings', href: '/settings', icon: Settings, roles: ['student', 'teacher', 'admin'] },
];
