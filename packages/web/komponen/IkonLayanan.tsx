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
    "claude": "claude.ai",
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
        // Only check for strings of similar length to avoid weird matches
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

// ============================================================================
// HIGH FIDELITY BRAND LOGOS
// ============================================================================

const GmailIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335" />
        <path d="M0 5.457V1.636C0 .732.732 0 1.636 0h3.819v9.091L0 5.457z" fill="#4285F4" />
        <path d="M18.545 0h3.82C23.268 0 24 .732 24 1.636v3.82l-5.455 3.637V0z" fill="#34A853" />
        <path d="M5.455 9.091L0 5.458V19.364c0 .904.732 1.636 1.636 1.636h3.82V9.091z" fill="#FBBC05" />
    </svg>
);

const DriveIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.09 4.536L3.273 15H0l5.818-10.464z" fill="#4285F4" />
        <path d="M14.91 4.536L20.727 15H24l-5.818-10.464z" fill="#FBBC05" />
        <path d="M9.09 4.536h5.82L20.727 15H3.273z" fill="#34A853" />
        <path d="M3.273 15l2.909 5.036L12 24l5.818-3.964L20.727 15z" fill="#4285F4" opacity="0.6" />
    </svg>
);

const SheetsIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" fill="#0F9D58" />
        <path d="M7 7h10v3H7zm0 4h10v3H7zm0 4h10v3H7z" fill="#0B8043" />
        <rect x="7" y="7" width="5" height="3" fill="white" opacity="0.3" />
        <rect x="12" y="7" width="5" height="3" fill="white" opacity="0.3" />
        <rect x="7" y="11" width="5" height="3" fill="white" opacity="0.3" />
        <rect x="12" y="11" width="5" height="3" fill="white" opacity="0.3" />
        <rect x="7" y="15" width="5" height="3" fill="white" opacity="0.3" />
        <rect x="12" y="15" width="5" height="3" fill="white" opacity="0.3" />
    </svg>
);

const DocsIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#4285F4" />
        <path d="M14 2v6h6" fill="#1967D2" />
        <path d="M8 12h8v1H8v-1zm0 2h8v1H8v-1zm0 2h5v1H8v-1z" fill="white" />
    </svg>
);

const OneDriveIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 9a6.5 6.5 0 0 0-6.42 5.42A4 4 0 0 0 4 22h13a5 5 0 0 0 1.5-9.78A6.5 6.5 0 0 0 9.5 9z" fill="#0364B8" />
        <path d="M16.5 12.22A6.5 6.5 0 0 0 9.5 9a6.47 6.47 0 0 0-3.84 1.28 5.98 5.98 0 0 1 10.84 1.94z" fill="#0078D4" opacity="0.7" />
    </svg>
);

const ClaudeIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#DA7756" />
        <path d="M8 7h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" fill="white" />
        <path d="M10 10h4v1h-4v-1zm0 2h4v1h-4v-1zm0 2h3v1h-3v-1z" fill="#DA7756" />
    </svg>
);

const TikTokIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" fill="#25F4EE" transform="translate(-0.5, -0.5)" />
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" fill="#FE2C55" transform="translate(0.5, 0.5)" />
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" fill="#000000" />
    </svg>
);

const WeChatIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z" fill="#1AAD19" />
        <path d="M17.065 8.86c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.86z" fill="#1AAD19" opacity="0.8" />
    </svg>
);

const QwenIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#6495ED" />
        <path d="M6 8h4v8H6zm0 0h4l4-4h4v12h-4l-4-4H6z" fill="white" />
        <path d="M14 4h4v12h-4z" fill="#C9C0D3" />
    </svg>
);

const N8NIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L19.82 8 12 11.82 4.18 8 12 4.18zM4 9.48l7 3.5v7.84l-7-3.5V9.48zm16 0v7.84l-7 3.5v-7.84l7-3.5z" fill="#EA4B71" />
        <circle cx="12" cy="8" r="1.5" fill="#040506" />
        <circle cx="6" cy="12" r="1.5" fill="#040506" />
        <circle cx="18" cy="12" r="1.5" fill="#040506" />
        <circle cx="12" cy="16" r="1.5" fill="#040506" />
    </svg>
);

const AntigravityIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#F97316" strokeWidth="2"/>
        <path d="M12 6V18M6 12H18" stroke="#F97316" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="3" fill="#F97316"/>
    </svg>
);

const MidtransIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" fill="#00AAD2" />
        <path d="M7 6h10l-5 12z" fill="#00558D" opacity="0.5" />
    </svg>
);

const DicodingIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#FE173A" />
        <path d="M8 8l8 4-8 4V8z" fill="white" />
    </svg>
);

const DibimbingIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#2D5F9F" />
        <path d="M6 8h12v2H6zm0 3h12v2H6zm0 3h8v2H6z" fill="white" />
        <circle cx="17" cy="16" r="2" fill="#FF6B35" />
    </svg>
);

const OpenRouterIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#7C3AED" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const GroqIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 4c3.314 0 6 2.686 6 6s-2.686 6-6 6-6-2.686-6-6 2.686-6 6-6z" fill="#F55036" />
    </svg>
);

const AnthropicIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" fill="#FAF9F5" />
        <path d="M8 4l4 16M12 4l4 16M6 12h12" stroke="#141413" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="4" r="1" fill="#D97757" />
        <circle cx="12" cy="4" r="1" fill="#6A9BCC" />
        <circle cx="16" cy="4" r="1" fill="#788C5D" />
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

        // Exact brand match first
        if (s.includes("gmail") || s.includes("google mail")) return <GmailIcon size={size} />;
        if (s.includes("google drive") || s.includes("gdrive")) return <DriveIcon size={size} />;
        if (s.includes("google sheet") || s.includes("gsheet")) return <SheetsIcon size={size} />;
        if (s.includes("google docs") || s.includes("gdoc")) return <DocsIcon size={size} />;
        if (s.includes("onedrive")) return <OneDriveIcon size={size} />;
        if (s.includes("tiktok")) return <TikTokIcon size={size} />;
        if (s.includes("wechat")) return <WeChatIcon size={size} />;
        if (s.includes("qwen")) return <QwenIcon size={size} />;
        if (s.includes("n8n")) return <N8NIcon size={size} />;
        if (s.includes("claude.ai")) return <ClaudeIcon size={size} />;
        if (s.includes("anthropic")) return <AnthropicIcon size={size} />;
        if (s.includes("midtrans")) return <MidtransIcon size={size} />;
        if (s.includes("dicoding")) return <DicodingIcon size={size} />;
        if (s.includes("dibimbing")) return <DibimbingIcon size={size} />;
        if (s.includes("openrouter")) return <OpenRouterIcon size={size} />;
        if (s.includes("groq")) return <GroqIcon size={size} />;
        if (s.includes("antigravity")) return <AntigravityIcon size={size} />;

        // Category/Broad match fallback
        if (s.includes("mail")) return <Mail size={size} className="text-[#ea4335]" />;
        if (s.includes("drive")) return <DriveIcon size={size} />;
        if (s.includes("sheet") || s.includes("excel")) return <SheetsIcon size={size} />;
        if (s.includes("doc")) return <DocsIcon size={size} />;
        if (s.includes("calendar")) return <Calendar size={size} className="text-[#ea4335]" />;
        if (s.includes("youtube") || s.includes("yt")) return <Play size={size} className="text-[#ff0000]" />;
        if (s.includes("stitch")) return <Layout size={size} className="text-purple-500" />;
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
        searchContext.includes("onedrive") ||
        searchContext.includes("claude") ||
        searchContext.includes("anthropic") ||
        searchContext.includes("tiktok") ||
        searchContext.includes("wechat") ||
        searchContext.includes("qwen") ||
        searchContext.includes("n8n") ||
        searchContext.includes("midtrans") ||
        searchContext.includes("dicoding") ||
        searchContext.includes("dibimbing") ||
        searchContext.includes("openrouter") ||
        searchContext.includes("groq") ||
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
