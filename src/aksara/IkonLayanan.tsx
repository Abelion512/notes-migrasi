import React from 'react';
import {
    Key, Mail, Github, Chrome, Shield, Globe,
    Lock, User, Database, Smartphone, Laptop,
    Layout, Cpu, Cloud, Ghost, Boxes, Bot
} from 'lucide-react';

export const getIconForService = (name: string, size: number = 20) => {
    if (!name) return null;
    const lowerName = name.toLowerCase();

    // Tech & AI
    if (lowerName.includes('google') || lowerName.includes('gmail')) return <Mail size={size} className="text-[#ea4335]" />;
    if (lowerName.includes('github')) return <Github size={size} className="text-gray-900 dark:text-white" />;
    if (lowerName.includes('gemini')) return <Bot size={size} className="text-[#4285f4]" />;
    if (lowerName.includes('claude') || lowerName.includes('anthropic')) return <Cpu size={size} className="text-[#d97757]" />;
    if (lowerName.includes('openai') || lowerName.includes('chatgpt')) return <Boxes size={size} className="text-[#10a37f]" />;

    // Cloud & Platforms
    if (lowerName.includes('vercel')) return <Layout size={size} className="text-black dark:text-white" />;
    if (lowerName.includes('apple') || lowerName.includes('icloud')) return <Laptop size={size} className="text-gray-500" />;
    if (lowerName.includes('facebook') || lowerName.includes('meta')) return <Globe size={size} className="text-[#1877f2]" />;
    if (lowerName.includes('amazon') || lowerName.includes('aws')) return <Cloud size={size} className="text-[#ff9900]" />;

    // Developers & Tools
    if (lowerName.includes('jules')) return <Ghost size={size} className="text-indigo-500" />;
    if (lowerName.includes('supabase')) return <Database size={size} className="text-[#3ecf8e]" />;
    if (lowerName.includes('stripe')) return <Globe size={size} className="text-[#635bff]" />;

    // Generic Credentials
    if (lowerName.includes('credentials') || lowerName.includes('login') || lowerName.includes('password') || lowerName.includes('akun')) return <Key size={size} className="text-yellow-600" />;

    return null;
};
