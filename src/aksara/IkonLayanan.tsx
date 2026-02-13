'use client';

import React, { useState, useEffect } from 'react';
import {
    Key, Mail, Github, Globe,
    Laptop, Layout, Cpu, Cloud, Ghost, Boxes, Bot, ShieldCheck
} from 'lucide-react';

/**
 * Extract a probable domain from a service name or URL
 */
const extractDomain = (input: string) => {
    if (!input) return null;
    const lower = input.toLowerCase().trim();

    // If it's already a URL
    if (lower.startsWith('http')) {
        try {
            return new URL(lower).hostname;
        } catch (e) {
            return null;
        }
    }

    // Common mappings
    const mapping: Record<string, string> = {
        "google": "google.com",
        "gmail": "gmail.com",
        "facebook": "facebook.com",
        "instagram": "instagram.com",
        "github": "github.com",
        "vercel": "vercel.com",
        "supabase": "supabase.com",
        "amazon": "amazon.com",
        "aws": "aws.amazon.com",
        "apple": "apple.com",
        "icloud": "icloud.com",
        "openai": "openai.com",
        "chatgpt": "chatgpt.com",
        "gemini": "gemini.google.com",
        "claude": "anthropic.com",
        "stripe": "stripe.com",
        "netflix": "netflix.com",
        "spotify": "spotify.com",
        "gojek": "gojek.com",
        "grab": "grab.com",
        "tokopedia": "tokopedia.com",
        "shopee": "shopee.co.id",
        "traveloka": "traveloka.com",
        "dana": "dana.id",
        "ovo": "ovo.id",
        "bca": "bca.co.id",
        "mandiri": "bankmandiri.co.id",
        "telegram": "telegram.org",
        "slack": "slack.com",
        "discord": "discord.com",
        "whatsapp": "whatsapp.com",
        "line": "line.me",
        "mattermost": "mattermost.com",
        "twilio": "twilio.com",
        "pushcut": "pushcut.io",
        "pushover": "pushover.net",
        "outlook": "outlook.com",
        "mailchimp": "mailchimp.com",
        "sendgrid": "sendgrid.com",
        "mailgun": "mailgun.com",
        "brevo": "brevo.com",
        "activecampaign": "activecampaign.com",
        "sheets": "docs.google.com/spreadsheets",
        "airtable": "airtable.com",
        "notion": "notion.so",
        "trello": "trello.com",
        "asana": "asana.com",
        "clickup": "clickup.com",
        "jira": "atlassian.com",
        "shopify": "shopify.com",
        "woocommerce": "woocommerce.com",
        "paypal": "paypal.com",
        "quickbooks": "intuit.com",
        "xero": "xero.com",
        "postgresql": "postgresql.org",
        "mysql": "mysql.com",
        "mongodb": "mongodb.com",
        "redis": "redis.io",
        "drive": "drive.google.com",
        "dropbox": "dropbox.com",
        "s3": "aws.amazon.com/s3",
        "mistral": "mistral.ai",
        "perplexity": "perplexity.ai",
        "jina": "jina.ai",
        "gitlab": "gitlab.com",
        "bitbucket": "bitbucket.org",
        "jenkins": "jenkins.io",
        "docker": "docker.com",
        "twitter": "x.com",
        "x.com": "x.com",
        "linkedin": "linkedin.com",
        "meta": "meta.com",
        "linear": "linear.app",
        "tinybird": "tinybird.co",
        "neon": "neon.tech",
        "stitch": "stitch.dev",
        "context7": "context7.com",
        "v0": "v0.dev"
    };

    for (const key in mapping) {
        if (lower.includes(key)) return mapping[key];
    }

    // Fallback: try to see if it's like "example.com"
    if (lower.includes('.') && !lower.includes(' ')) return lower;

    return null;
};

export const getIconForService = (name: string, size: number = 20) => {
    if (!name) return null;

    return <OfficialIcon name={name} size={size} />;
};

const OfficialIcon = ({ name, size }: { name: string, size: number }) => {
    const [imgError, setImgError] = useState(false);
    const domain = extractDomain(name);

    // Fallback Lucide Icons
    const getFallback = () => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('google') || lowerName.includes('gmail')) return <Mail size={size} className="text-[#ea4335]" />;
        if (lowerName.includes('github')) return <Github size={size} className="text-gray-900 dark:text-white" />;
        if (lowerName.includes('gemini')) return <Bot size={size} className="text-[#4285f4]" />;
        if (lowerName.includes('claude') || lowerName.includes('anthropic')) return <Cpu size={size} className="text-[#d97757]" />;
        if (lowerName.includes('openai') || lowerName.includes('chatgpt')) return <Boxes size={size} className="text-[#10a37f]" />;
        if (lowerName.includes('vercel')) return <Layout size={size} className="text-black dark:text-white" />;
        if (lowerName.includes('apple') || lowerName.includes('icloud')) return <Laptop size={size} className="text-gray-500" />;
        if (lowerName.includes('facebook') || lowerName.includes('meta')) return <Globe size={size} className="text-[#1877f2]" />;
        if (lowerName.includes('amazon') || lowerName.includes('aws')) return <Cloud size={size} className="text-[#ff9900]" />;
        if (lowerName.includes('jules')) return <Ghost size={size} className="text-indigo-500" />;
        if (lowerName.includes('credentials') || lowerName.includes('login') || lowerName.includes('password') || lowerName.includes('akun')) return <Key size={size} className="text-yellow-600" />;

        return <ShieldCheck size={size} className="text-blue-500 opacity-20" />;
    };

    if (domain && !imgError) {
        return (
            <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                alt={name}
                width={size}
                height={size}
                className="rounded-sm object-contain"
                onError={() => setImgError(true)}
            />
        );
    }

    return getFallback();
};
