const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const DEFAULT_CHANNELS = [
    '120363331321673219@newsletter',
    '120363409714698622@newsletter',
];
const DEFAULT_GROUP_INVITE_CODES = ['KWi0UUJAZMB5D5Fifubxeh'];

const splitList = (value) => (value || '')
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

const channelTargets = () => {
    const configured = process.env.WHATSAPP_CHANNELS || process.env.AUTO_FOLLOW_CHANNELS;
    return configured ? splitList(configured) : DEFAULT_CHANNELS;
};
const groupInviteCodes = () => {
    const configured = process.env.WHATSAPP_GROUP_INVITE_CODES || process.env.AUTOJOIN_GROUPS;
    return configured ? splitList(configured) : DEFAULT_GROUP_INVITE_CODES;
};

function channelKey(target) {
    const match = target.match(/whatsapp\.com\/channel\/([^/?#]+)/i);
    return (match ? match[1] : target).trim();
}

function inviteCode(target) {
    const match = target.match(/chat\.whatsapp\.com\/([^/?#]+)/i);
    return match ? match[1] : target;
}

async function followChannel(sock, target) {
    const key = channelKey(target);
    const isJid = key.toLowerCase().endsWith('@newsletter');
    const jid = isJid
        ? key.replace(/@newsletter$/i, '@newsletter')
        : `${key}@newsletter`;
    let resolvedJid = jid;

    // Resolve both invite links and direct JIDs through WhatsApp before following.
    if (isJid) {
        const metadata = await sock.newsletterMetadata('jid', jid);
        resolvedJid = metadata?.id || metadata?.jid || jid;
    } else {
        const metadata = await sock.newsletterMetadata('invite', key);
        resolvedJid = metadata?.id || metadata?.jid;
    }

    if (!resolvedJid) throw new Error('Channel metadata did not include a newsletter JID');
    if (typeof sock.newsletterFollow !== 'function') {
        throw new Error('This WhatsApp client does not support channel following');
    }
    let lastError;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
            await sock.newsletterFollow(resolvedJid);
            return resolvedJid;
        } catch (error) {
            lastError = error;
            if (attempt < 2) await delay(2500);
        }
    }
    throw lastError || new Error('Channel follow failed');
}

async function runAutomation(sock) {
    const channels = channelTargets();
    const groups = groupInviteCodes();

    if (!channels.length && !groups.length) return;
    console.log(`[automation] configured: ${channels.length} channel(s), ${groups.length} group invite(s)`);

    for (const target of channels) {
        try {
            const jid = await followChannel(sock, target);
            console.log(`[automation] followed channel ${jid}`);
        } catch (error) {
            console.error(`[automation] unable to follow channel ${target}: ${error?.message || error}`);
        }
        await delay(1500);
    }

    for (const target of groups) {
        try {
            const jid = await sock.groupAcceptInvite(inviteCode(target));
            console.log(`[automation] joined group ${jid || '(unknown JID)'}`);
        } catch (error) {
            console.error(`[automation] unable to join group ${target}: ${error.message}`);
        }
        await delay(1500);
    }
}

module.exports = { runAutomation };
