'use client';

import React, { useState } from 'react';
import {
    Key, Mail, Github,
    Layout, Cpu, Cloud, Bot, ShieldCheck,
    FileText, Calendar, Play
} from 'lucide-react';

/**
 * Common mappings for services to their official domains or abbreviations
 */
export const MAP_LAYANAN: Record<string, string> = {
    "activecampaign": "activecampaign.com",
    "airtable": "airtable.com",
    "amazon": "amazon.com",
    "anthropic": "anthropic.com",
    "antigravity": "antigravity.id",
    "apple": "apple.com",
    "appwrite": "appwrite.io",
    "asana": "asana.com",
    "aws": "aws.amazon.com",
    "bca": "bca.co.id",
    "bigcommerce": "bigcommerce.com",
    "bitbucket": "bitbucket.org",
    "brevo": "brevo.com",
    "bubble": "bubble.io",
    "calendar": "calendar.google.com",
    "chatgpt": "chatgpt.com",
    "claude": "anthropic.com",
    "claude.ai": "claude.ai",
    "clickup": "clickup.com",
    "context7": "context7.com",
    "dana": "dana.id",
    "deepseek": "deepseek.com",
    "dibimbing": "dibimbing.id",
    "dicoding": "dicoding.com",
    "digitalocean": "digitalocean.com",
    "discord": "discord.com",
    "doc": "docs.google.com",
    "docker": "docker.com",
    "drive": "drive.google.com",
    "dropbox": "dropbox.com",
    "excel": "excel.office.com",
    "facebook": "facebook.com",
    "firebase": "firebase.google.com",
    "gdocs": "docs.google.com",
    "gdrive": "drive.google.com",
    "gemini": "gemini.google.com",
    "ghost": "ghost.org",
    "github": "github.com",
    "gitlab": "gitlab.com",
    "gmail": "gmail.com",
    "gojek": "gojek.com",
    "google": "google.com",
    "google docs": "docs.google.com",
    "google drive": "drive.google.com",
    "google mail": "mail.google.com",
    "google sheet": "sheets.google.com",
    "google translate": "translate.google.com",
    "grab": "grab.com",
    "groq": "groq.com",
    "gsheet": "sheets.google.com",
    "gtask": "tasks.google.com",
    "heroku": "heroku.com",
    "hubspot": "hubspot.com",
    "icloud": "icloud.com",
    "ifttt": "ifttt.com",
    "instagram": "instagram.com",
    "jenkins": "jenkins.io",
    "jina": "jina.ai",
    "jira": "atlassian.com",
    "kafka": "kafka.apache.org",
    "lambda": "aws.amazon.com/lambda",
    "line": "line.me",
    "linear": "linear.app",
    "linkedin": "linkedin.com",
    "magento": "magento.com",
    "mailchimp": "mailchimp.com",
    "mailgun": "mailgun.com",
    "make": "make.com",
    "mandiri": "bankmandiri.co.id",
    "mattermost": "mattermost.com",
    "medium": "medium.com",
    "meta": "meta.com",
    "microsoft sql": "microsoft.com/sql-server",
    "midtrans": "midtrans.com",
    "mistral": "mistral.ai",
    "monday": "monday.com",
    "mongodb": "mongodb.com",
    "mssql": "microsoft.com/sql-server",
    "mysql": "mysql.com",
    "n8n": "n8n.io",
    "nasa": "nasa.gov",
    "neon": "neon.tech",
    "netflix": "netflix.com",
    "notion": "notion.so",
    "odoo": "odoo.com",
    "onedrive": "onedrive.live.com",
    "openai": "openai.com",
    "openrouter": "openrouter.ai",
    "openweathermap": "openweathermap.org",
    "outlook": "outlook.com",
    "ovo": "ovo.id",
    "pabbly": "pabbly.com",
    "paypal": "paypal.com",
    "perplexity": "perplexity.ai",
    "pipedrive": "pipedrive.com",
    "postgres": "postgresql.org",
    "postgresql": "postgresql.org",
    "pushcut": "pushcut.io",
    "pushover": "pushover.net",
    "quickbooks": "intuit.com",
    "qwen": "qwenlm.ai",
    "railway": "railway.app",
    "reddit": "reddit.com",
    "redis": "redis.io",
    "render": "render.com",
    "retool": "retool.com",
    "s3": "aws.amazon.com/s3",
    "salesforce": "salesforce.com",
    "seatable": "seatable.io",
    "sendgrid": "sendgrid.com",
    "sheet": "sheets.google.com",
    "shopee": "shopee.co.id",
    "shopify": "shopify.com",
    "slack": "slack.com",
    "spotify": "spotify.com",
    "stitch": "stitch.dev",
    "stripe": "stripe.com",
    "supabase": "supabase.com",
    "surveymonkey": "surveymonkey.com",
    "telegram": "telegram.org",
    "tiktok": "tiktok.com",
    "tinybird": "tinybird.co",
    "todo": "todo.microsoft.com",
    "tokopedia": "tokopedia.com",
    "traveloka": "traveloka.com",
    "trello": "trello.com",
    "twilio": "twilio.com",
    "twitter": "x.com",
    "typeform": "typeform.com",
    "v0": "v0.dev",
    "vercel": "vercel.com",
    "webflow": "webflow.com",
    "wechat": "wechat.com",
    "whatsapp": "whatsapp.com",
    "woocommerce": "woocommerce.com",
    "wordpress": "wordpress.org",
    "x": "x.com",
    "xero": "xero.com",
    "youtube": "youtube.com",
    "yt": "youtube.com",
    "zapier": "zapier.com",
    "zendesk": "zendesk.com",
};

/**
 * Extract a probable domain from a service name or abbreviation
 */

/**
 * Simple Levenshtein distance for fuzzy matching
 */
const getLevenshteinDistance = (a: string, b: string): number => {
    const matrix = Array.from({ length: a.length + 1 }, () =>
        Array.from({ length: b.length + 1 }, (_, i) => i)
    );
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    return matrix[a.length][b.length];
};

const extractDomain = (input: string) => {
    if (!input) return null;
    const lower = input.toLowerCase().trim();

    // 1. If it's already a URL
    if (lower.startsWith('http')) {
        try {
            return new URL(lower).hostname;
        } catch (_e) {
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

    // 4. Smart Detection: Fuzzy match for typos
    let bestMatch = null;
    let minDistance = 3; // Max distance allowed

    for (const key in MAP_LAYANAN) {
        // Only check for strings of similar length to avoid weird matches
        if (Math.abs(lower.length - key.length) > 2) continue;

        const distance = getLevenshteinDistance(lower, key);
        if (distance < minDistance) {
            minDistance = distance;
            bestMatch = MAP_LAYANAN[key];
        }
    }
    if (bestMatch) return bestMatch;

    // 5. Fallback: try to see if it is like "example.com"
    if (lower.includes(".") && !lower.includes(" ")) return lower;

    return null;
};


const GmailIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" fill="#EA4335"/>
        <path d="M22 6V18C22 19.1 21.1 20 20 20H18V9L12 13L6 9V20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4H4.5L12 10L19.5 4H20C21.1 4 22 4.9 22 6Z" fill="#EA4335"/>
        <path d="M12 13L22 6V4H20L12 10L4 4H2V6L12 13Z" fill="#FBBC05"/>
        <path d="M2 18V6L12 13L22 6V18C22 19.1 21.1 20 20 20H18V9L12 13L6 9V20H4C2.9 20 2 19.1 2 18Z" fill="#34A853"/>
        <path d="M22 6V4H20L12 10L4 4H2V6L22 13" fill="#4285F4"/>
    </svg>
);

const DriveIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.429 2.4L2.4 14.571L5.829 20.571L12.857 8.4L9.429 2.4Z" fill="#FFD04B"/>
        <path d="M21.6 14.571L18.171 8.4L11.143 20.571L14.571 26.571L21.6 14.571Z" fill="#4285F4"/>
        <path d="M12.857 8.4L5.829 20.571L18.171 20.571L25.2 8.4L12.857 8.4Z" fill="#34A853"/>
    </svg>
);

const OneDriveIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.5 19C15.01 19 13 16.99 13 14.5C13 14.36 13.01 14.22 13.02 14.09C12.38 14.35 11.69 14.5 10.97 14.5C8.78 14.5 7 12.72 7 10.53C7 10.42 7 10.32 7.01 10.22C5.3 10.61 4 12.15 4 14C4 16.21 5.79 18 8 18H17.5C19.43 18 21 16.43 21 14.5C21 12.57 19.43 11 17.5 11C17.34 11 17.18 11.01 17.03 11.04C16.54 8.73 14.48 7 12 7C10.74 7 9.61 7.46 8.74 8.21C8.19 8.07 7.6 8 7 8C4.79 8 3 9.79 3 12C3 14.21 4.79 16 7 16H17.5C18.33 16 19 15.33 19 14.5C19 13.67 18.33 13 17.5 13C17.42 13 17.34 13.01 17.27 13.02C17.11 11.31 15.7 10 14 10C13.43 10 12.91 10.16 12.47 10.44C11.66 9.58 10.5 9.04 9.21 9.04C6.89 9.04 5 10.93 5 13.25C5 13.36 5.01 13.47 5.02 13.57C3.86 14.07 3.04 15.22 3.04 16.57C3.04 18.47 4.58 20.01 6.47 20.01H17.5C20 20.01 22.04 17.97 22.04 15.47C22.04 12.97 20 10.93 17.5 10.93" fill="#0078D4"/>
    </svg>
);

const SheetsIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#0F9D58"/>
        <path d="M3 8H21M8 3V21M15 3V21" stroke="white" strokeWidth="1"/>
    </svg>
);

const DocsIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#4285F4"/>
        <path d="M7 8H17M7 12H17M7 16H13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

const ClaudeIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#D97757"/>
        <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="#D97757" opacity="0.8"/>
    </svg>
);

const AntigravityIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#F97316" strokeWidth="2"/>
        <path d="M12 6V18M6 12H18" stroke="#F97316" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="3" fill="#F97316"/>
    </svg>
);

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
        if (s.includes("gmail") || s.includes("google mail")) return <GmailIcon size={size} />;
        if (s.includes("mail")) return <Mail size={size} className="text-[#ea4335]" />;
        if (s.includes("drive")) return <DriveIcon size={size} />;
        if (s.includes("sheet") || s.includes("excel")) return <SheetsIcon size={size} />;
        if (s.includes("docs") || s.includes("doc")) return <DocsIcon size={size} />;
        if (s.includes("onedrive")) return <OneDriveIcon size={size} />;
        if (s.includes("claude")) return <ClaudeIcon size={size} />;
        if (s.includes("anthropic")) return <Bot size={size} className="text-[#d97757]" />;
        if (s.includes("calendar")) return <Calendar size={size} className="text-[#ea4335]" />;
        if (s.includes("youtube") || s.includes("yt")) return <Play size={size} className="text-[#ff0000]" />;
        if (s.includes("stitch")) return <Layout size={size} className="text-purple-500" />;
        if (s.includes("antigravity")) return <AntigravityIcon size={size} />;
        if (s.includes("github")) return <Github size={size} className="text-gray-900 dark:text-white" />;
        if (s.includes("bot") || s.includes("ai")) return <Bot size={size} className="text-[#4285f4]" />;
        if (s.includes("credentials") || s.includes("login")) return <Key size={size} className="text-yellow-600" />;

        return <ShieldCheck size={size} className="text-blue-500 opacity-20" />;
    };

    // Determine if we should use fallback based on either the name or the derived domain
    const searchContext = `${lowerName} ${domain || ''}`;
    const needsSpecificIcon =
        searchContext.includes("gmail") ||
        searchContext.includes("drive") ||
        searchContext.includes("doc") ||
        searchContext.includes("sheet") ||
        searchContext.includes("calendar") ||
        searchContext.includes("stitch") ||
        searchContext.includes("onedrive") ||
        searchContext.includes("claude") ||
        searchContext.includes("antigravity");

    if (needsSpecificIcon) {
        return getFallback(searchContext);
    }

    if (domain && !imgError && domain !== 'google.com') {
        return (
            /* eslint-disable-next-line @next/next/no-img-element */
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
