const { delay } = require('@whiskeysockets/baileys');

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
    return match ? match[1] : target;
}

function inviteCode(target) {
    const match = target.match(/chat\.whatsapp\.com\/([^/?#]+)/i);
    return match ? match[1] : target;
}

async function followChannel(sock, target) {
    const key = channelKey(target);
    const jid = key.endsWith('@newsletter') ? key : `${key}@newsletter`;
    let resolvedJid = jid;

    // A channel URL contains an invite key rather than the newsletter JID.
    if (!key.endsWith('@newsletter')) {
        const metadata = await sock.newsletterMetadata('invite', key);
        resolvedJid = metadata?.id || metadata?.jid;
    }

    if (!resolvedJid) throw new Error('Channel metadata did not include a newsletter JID');
    await sock.newsletterFollow(resolvedJid);
    return resolvedJid;
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
            console.error(`[automation] unable to follow channel ${target}: ${error.message}`);
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
