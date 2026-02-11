import React from 'react';
import {
    Key, Mail, Github, Chrome, Shield, Globe,
    Lock, User, Database, Smartphone, Laptop,
    Layout, Cpu, Cloud, Ghost
} from 'lucide-react';

export const getIconForService = (name: string, size: number = 20) => {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('google') || lowerName.includes('gmail')) return <Mail size={size} className="text-red-500" />;
    if (lowerName.includes('github')) return <Github size={size} className="text-gray-900 dark:text-white" />;
    if (lowerName.includes('anthropic') || lowerName.includes('claude')) return <Cpu size={size} className="text-orange-600" />;
    if (lowerName.includes('openai') || lowerName.includes('chatgpt')) return <Database size={size} className="text-green-600" />;
    if (lowerName.includes('vercel')) return <Layout size={size} className="text-black dark:text-white" />;
    if (lowerName.includes('apple') || lowerName.includes('icloud')) return <Laptop size={size} className="text-gray-500" />;
    if (lowerName.includes('facebook') || lowerName.includes('meta')) return <Globe size={size} className="text-blue-600" />;
    if (lowerName.includes('jules')) return <Ghost size={size} className="text-indigo-500" />;
    if (lowerName.includes('credentials') || lowerName.includes('login') || lowerName.includes('password')) return <Key size={size} className="text-yellow-600" />;

    return null;
};
