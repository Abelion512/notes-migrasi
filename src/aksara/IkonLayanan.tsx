'use client';

import React, { useState } from 'react';
import {
    Key, Mail, Github, Globe,
    Laptop, Layout, Cpu, Cloud, Ghost, Boxes, Bot, ShieldCheck,
    FileText, Calendar, Play
} from 'lucide-react';

/**
 * Common mappings for services to their official domains or abbreviations
 */
export const MAP_LAYANAN: Record<string, string> = {
    "google": "google.com",
    "gmail": "gmail.com",
    "gsheet": "sheets.google.com",
    "sheet": "sheets.google.com",
    "gdocs": "docs.google.com",
    "doc": "docs.google.com",
    "gdrive": "drive.google.com",
    "drive": "drive.google.com",
    "google drive": "drive.google.com",
    "google translate": "translate.google.com",
    "gtask": "tasks.google.com",
    "calendar": "calendar.google.com",
    "facebook": "facebook.com",
    "instagram": "instagram.com",
    "github": "github.com",
    "vercel": "vercel.com",
    "supabase": "supabase.com",
    "amazon": "amazon.com",
    "aws": "aws.amazon.com",
    "lambda": "aws.amazon.com/lambda",
    "apple": "apple.com",
    "icloud": "icloud.com",
    "openai": "openai.com",
    "chatgpt": "chatgpt.com",
    "gemini": "gemini.google.com",
    "claude": "anthropic.com",
    "anthropic": "anthropic.com",
    "deepseek": "deepseek.com",
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
    "onedrive": "onedrive.live.com",
    "excel": "excel.office.com",
    "microsoft sql": "microsoft.com/sql-server",
    "mssql": "microsoft.com/sql-server",
    "todo": "todo.microsoft.com",
    "mailchimp": "mailchimp.com",
    "mailchip": "mailchimp.com",
    "sendgrid": "sendgrid.com",
    "mailgun": "mailgun.com",
    "brevo": "brevo.com",
    "activecampaign": "activecampaign.com",
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
    "postgres": "postgresql.org",
    "mysql": "mysql.com",
    "mongodb": "mongodb.com",
    "redis": "redis.io",
    "redis.io": "redis.io",
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
    "x": "x.com",
    "yt": "youtube.com",
    "youtube": "youtube.com",
    "linkedin": "linkedin.com",
    "meta": "meta.com",
    "linear": "linear.app",
    "tinybird": "tinybird.co",
    "neon": "neon.tech",
    "stitch": "stitch.dev",
    "context7": "context7.com",
    "v0": "v0.dev",
    "openweathermap": "openweathermap.org",
    "hubspot": "hubspot.com",
    "firebase": "firebase.google.com",
    "reddit": "reddit.com",
    "kafka": "kafka.apache.org",
    "wordpress": "wordpress.org",
    "pipedrive": "pipedrive.com",
    "antigravity": "antigravity.id",
    "nasa": "nasa.gov",
    "odoo": "odoo.com",
    "bubble": "bubble.io",
    "seatable": "seatable.io",
    "n8n": "n8n.io",
    "make": "make.com",
    "zapier": "zapier.com",
    "ifttt": "ifttt.com",
    "pabbly": "pabbly.com",
    "pabbly connect": "pabbly.com/connect",
    "retool": "retool.com",
    "appwrite": "appwrite.io",
    "railway": "railway.app",
    "render": "render.com",
    "digitalocean": "digitalocean.com",
    "heroku": "heroku.com"
};

/**
 * Extract a probable domain from a service name or abbreviation
 */
const extractDomain = (input: string) => {
    if (!input) return null;
    const lower = input.toLowerCase().trim();

    // 1. If it's already a URL
    if (lower.startsWith('http')) {
        try {
            return new URL(lower).hostname;
        } catch (e) {
            return null;
        }
    }

    // 2. Exact match in mapping
    if (MAP_LAYANAN[lower]) return MAP_LAYANAN[lower];

    // 3. Partial match (starts with) - Priority to exact match above
    for (const key in MAP_LAYANAN) {
        if (lower.startsWith(key) || key.startsWith(lower)) {
            if (lower.length >= 2) return MAP_LAYANAN[key];
        }
    }

    // 4. Fallback: try to see if it's like "example.com"
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
    const lowerName = name.toLowerCase();

    const getFallback = (searchString: string) => {
        const s = searchString.toLowerCase();
        // Specific brand detection keywords (prioritize Lucide icons for better dark mode consistency)
        if (s.includes('gmail')) return <Mail size={size} className="text-[#ea4335]" />;
        if (s.includes('mail')) return <Mail size={size} className="text-[#ea4335]" />;
        if (s.includes('drive')) return <Cloud size={size} className="text-[#34a853]" />;
        if (s.includes('docs') || s.includes('sheet') || s.includes('excel')) return <FileText size={size} className="text-[#4285f4]" />;
        if (s.includes('calendar')) return <Calendar size={size} className="text-[#ea4335]" />;
        if (s.includes('youtube') || s.includes('yt')) return <Play size={size} className="text-[#ff0000]" />;
        if (s.includes('stitch')) return <Layout size={size} className="text-purple-500" />;
        if (s.includes('antigravity')) return <Cpu size={size} className="text-orange-500 shadow-sm" />;
        if (s.includes('github')) return <Github size={size} className="text-gray-900 dark:text-white" />;
        if (s.includes('bot') || s.includes('ai')) return <Bot size={size} className="text-[#4285f4]" />;
        if (s.includes('credentials') || s.includes('login')) return <Key size={size} className="text-yellow-600" />;

        return <ShieldCheck size={size} className="text-blue-500 opacity-20" />;
    };

    // Determine if we should use fallback based on either the name or the derived domain
    const searchContext = `${lowerName} ${domain || ''}`;
    const needsSpecificIcon =
        searchContext.includes('gmail') ||
        searchContext.includes('drive') ||
        searchContext.includes('doc') ||
        searchContext.includes('sheet') ||
        searchContext.includes('calendar') ||
        searchContext.includes('stitch') ||
        searchContext.includes('antigravity');

    if (needsSpecificIcon) {
        return getFallback(searchContext);
    }

    if (domain && !imgError && domain !== 'google.com') {
        return (
            <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                alt={name}
                width={size}
                height={size}
                key={domain}
                className="rounded-sm object-contain"
                onError={() => setImgError(true)}
            />
        );
    }

    return getFallback(lowerName);
};
