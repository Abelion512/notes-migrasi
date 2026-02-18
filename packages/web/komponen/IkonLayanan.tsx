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
    "docker": "docker.com",
    "doc": "docs.google.com",
    "docs": "docs.google.com",
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
    "pabbly connect": "pabbly.com/connect",
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
    "redis.io": "redis.io",
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
        if (Math.abs(lower.length - key.length) > 2) continue;

        const distance = getLevenshteinDistance(lower, key);
        if (distance < minDistance) {
            minDistance = distance;
            bestMatch = MAP_LAYANAN[key];
        }
    }
    if (bestMatch) return bestMatch;

    if (lower.includes(".") && !lower.includes(" ")) return lower;

    return null;
};

const GmailIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M45 16.2V38C45 39.6569 43.6569 41 42 41H35V16.2L24 24.5L13 16.2V41H6C4.34315 41 3 39.6569 3 38V16.2L24 32L45 16.2Z" fill="#EA4335"/>
        <path d="M45 16.2V38C45 39.6569 43.6569 41 42 41H35V16.2L24 24.5L13 16.2V41H6C4.34315 41 3 39.6569 3 38V16.2L24 32L45 16.2Z" fill="url(#paint0_linear)"/>
        <path d="M42 7H39V16.2L45 11.7V10C45 8.34315 43.6569 7 42 7Z" fill="#FBBC04"/>
        <path d="M9 7H6C4.34315 7 3 8.34315 3 10V11.7L9 16.2V7Z" fill="#4285F4"/>
        <path d="M35 7H13V16.2L24 24.5L35 16.2V7Z" fill="#EA4335"/>
        <path d="M35 7H13V16.2L24 24.5L35 16.2V7Z" fill="url(#paint1_linear)"/>
        <defs>
            <linearGradient id="paint0_linear" x1="24" y1="16.2" x2="24" y2="41" gradientUnits="userSpaceOnUse">
                <stop stopColor="white" stopOpacity="0.1"/>
                <stop offset="1" stopColor="black" stopOpacity="0.1"/>
            </linearGradient>
            <linearGradient id="paint1_linear" x1="24" y1="7" x2="24" y2="24.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="white" stopOpacity="0.1"/>
                <stop offset="1" stopColor="black" stopOpacity="0.1"/>
            </linearGradient>
        </defs>
    </svg>
);

const DriveIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
        <path d="m6.6 66.85 15.45 26.83 15.45-26.83z" fill="#0066da" transform="translate(-6.6 -22.38)"/>
        <path d="m43.7 66.85 15.45 26.83 54.8-93.68-15.45-26.83z" fill="#00ac47" transform="translate(-6.6 -22.38)"/>
        <path d="m43.7 66.85-26.35-45.51-15.45 26.83 26.35 45.51z" fill="#ea4335" transform="translate(-6.6 -22.38)"/>
        <path d="m74.35 21.34-54.8 0 15.45 26.83 54.8 0z" fill="#ffba00" transform="translate(-6.6 -22.38)"/>
    </svg>
);

const OneDriveIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.5 19C15.01 19 13 16.99 13 14.5C13 14.36 13.01 14.22 13.02 14.09C12.38 14.35 11.69 14.5 10.97 14.5C8.78 14.5 7 12.72 7 10.53C7 10.42 7 10.32 7.01 10.22C5.3 10.61 4 12.15 4 14C4 16.21 5.79 18 8 18H17.5C19.43 18 21 16.43 21 14.5C21 12.57 19.43 11 17.5 11C17.34 11 17.18 11.01 17.03 11.04C16.54 8.73 14.48 7 12 7C10.74 7 9.61 7.46 8.74 8.21C8.19 8.07 7.6 8 7 8C4.79 8 3 9.79 3 12C3 14.21 4.79 16 7 16H17.5C18.33 16 19 15.33 19 14.5C19 13.67 18.33 13 17.5 13C17.42 13 17.34 13.01 17.27 13.02C17.11 11.31 15.7 10 14 10C13.43 10 12.91 10.16 12.47 10.44C11.66 9.58 10.5 9.04 9.21 9.04C6.89 9.04 5 10.93 5 13.25C5 13.36 5.01 13.47 5.02 13.57C3.86 14.07 3.04 15.22 3.04 16.57C3.04 18.47 4.58 20.01 6.47 20.01H17.5C20 20.01 22.04 17.97 22.04 15.47C22.04 12.97 20 10.93 17.5 10.93" fill="#0078D4"/>
    </svg>
);

const SheetsIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M42 22H26V6H42V22ZM22 22H6V6H22V22ZM42 42H26V26H42V42ZM22 42H6V26H22V42Z" fill="#0F9D58"/>
        <path d="M42 22H26V6M22 22H6M42 42H26V26M22 42H6" stroke="white" strokeWidth="2"/>
    </svg>
);

const DocsIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M37 45H11C9.34315 45 8 43.6569 8 42V6C8 4.34315 9.34315 3 11 3H29L40 14V42C40 43.6569 38.6569 45 37 45Z" fill="#4285F4"/>
        <path d="M29 3V14H40L29 3Z" fill="#A1C2FA"/>
        <path d="M16 21H32V23H16V21ZM16 27H32V29H16V27ZM16 33H26V35H16V33Z" fill="white"/>
    </svg>
);

const ClaudeIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L4 12L12 22L20 12L12 2Z" fill="#D97757"/>
        <circle cx="12" cy="12" r="3" fill="white" opacity="0.2"/>
    </svg>
);

const TikTokIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4V14.5C16 16.99 13.99 19 11.5 19C9.01 19 7 16.99 7 14.5C7 12.01 9.01 10 11.5 10C11.67 10 11.84 10.01 12 10.03V6.01C11.84 6 11.67 6 11.5 6C6.81 6 3 9.81 3 14.5C3 19.19 6.81 23 11.5 23C16.19 23 20 19.19 20 14.5V4H16Z" fill="#25F4EE"/>
        <path d="M21 2H17V12.5C17 14.99 14.99 17 12.5 17C10.01 17 8 14.99 8 12.5C8 10.01 10.01 8 12.5 8C12.67 8 12.84 8.01 13 8.03V4.01C12.84 4 12.67 4 12.5 4C7.81 4 4 7.81 4 12.5C4 17.19 7.81 21 12.5 21C17.19 21 21 17.19 21 12.5V2Z" fill="#FE2C55"/>
    </svg>
);

const WeChatIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.5 2C4.36 2 1 4.91 1 8.5C1 10.5 2.1 12.3 3.8 13.5L3.2 16L5.8 14.7C6.6 14.9 7.5 15 8.5 15C12.64 15 16 12.09 16 8.5C16 4.91 12.64 2 8.5 2Z" fill="#7BB32E"/>
        <path d="M16.5 8C13.46 8 11 10.01 11 12.5C11 13.88 11.76 15.11 12.93 15.94L12.5 17.67L14.3 16.77C15 16.92 15.73 17 16.5 17C19.54 17 22 14.99 22 12.5C22 10.01 19.54 8 16.5 8Z" fill="#7BB32E" opacity="0.8"/>
    </svg>
);

const AntigravityIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#4285F4" strokeWidth="2"/>
        <path d="M12 6V18M6 12H18" stroke="#EA4335" strokeWidth="2"/>
        <circle cx="12" cy="12" r="3" fill="#FBBC05"/>
    </svg>
);

const QwenIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" fill="#4F46E5"/>
        <path d="M12 6L8 10V14L12 18L16 14V10L12 6Z" fill="white" opacity="0.5"/>
    </svg>
);

const N8nIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="#FF6D5B"/>
        <circle cx="12" cy="12" r="4" fill="white"/>
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
        if (s.includes("gmail") || s.includes("google mail")) return <GmailIcon size={size} />;
        if (s.includes("mail")) return <Mail size={size} className="text-[#ea4335]" />;
        if (s.includes("drive")) return <DriveIcon size={size} />;
        if (s.includes("sheet") || s.includes("excel")) return <SheetsIcon size={size} />;
        if (s.includes("docs") || s.includes("doc")) return <DocsIcon size={size} />;
        if (s.includes("onedrive")) return <OneDriveIcon size={size} />;
        if (s.includes("tiktok")) return <TikTokIcon size={size} />;
        if (s.includes("wechat")) return <WeChatIcon size={size} />;
        if (s.includes("qwen")) return <QwenIcon size={size} />;
        if (s.includes("n8n")) return <N8nIcon size={size} />;
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
        searchContext.includes("tiktok") ||
        searchContext.includes("wechat") ||
        searchContext.includes("qwen") ||
        searchContext.includes("n8n") ||
        searchContext.includes("antigravity");

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
