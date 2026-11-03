const { makeid } = require('./id');
const { setSession, deleteSession } = require('./store');
const { runAutomation } = require('./automation');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require('pino');
const logLevel = process.env.LOG_LEVEL || 'fatal';
let baileysModulePromise;

function loadBaileys() {
    baileysModulePromise ||= import('@whiskeysockets/baileys');
    return baileysModulePromise;
}

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    if (!num) {
        return res.json({ code: 'Please provide a phone number' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    const tempDir = process.env.VERCEL ? '/tmp' : './temp';

    async function xhypher_MD_PAIR_CODE() {
        const {
            default: xhypher_Tech,
            useMultiFileAuthState,
            delay,
            makeCacheableSignalKeyStore,
            Browsers,
            fetchLatestBaileysVersion
        } = await loadBaileys();
        const { version } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState(tempDir + '/' + id);
        try {
            let Pair_Code_By_xhypher_Tech = xhypher_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: logLevel }).child({ level: logLevel })),
                },
                printQRInTerminal: false,
                logger: pino({ level: logLevel }).child({ level: logLevel }),
                browser: Browsers.ubuntu('Chrome'),
                version,
            });

            setSession(id, { status: 'waiting' });

            Pair_Code_By_xhypher_Tech.ev.on('creds.update', saveCreds);
            Pair_Code_By_xhypher_Tech.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === 'open') {
                    try {
                        await delay(3000);
                        await runAutomation(Pair_Code_By_xhypher_Tech);
                        let b64data = Buffer.from(JSON.stringify(state.creds)).toString('base64');
                        let sessionId = 'CYNTRON-X:~' + b64data;

                        setSession(id, { status: 'connected', sessionId });

                        let session = await Pair_Code_By_xhypher_Tech.sendMessage(Pair_Code_By_xhypher_Tech.user.id, { text: sessionId });

                        let xhypher_MD_TEXT = `
╔════════════════════
║ 🟢 SESSION CONNECTED ◇
║ ✓ BOT: CYNTRON-X
║ ✓ TYPE: BASE64
║ ✓ OWNER: COURTNEY 🦅 
║ ✓SUPPORT: https://t.me/Courtney254
╚════════════════════`;

                        await Pair_Code_By_xhypher_Tech.sendMessage(Pair_Code_By_xhypher_Tech.user.id, { text: xhypher_MD_TEXT }, { quoted: session });

                        send('session', { sessionId });
                    } catch (e) {
                        console.log('Error sending session:', e.message);
                        send('error', { message: e.message });
                        setSession(id, { status: 'error', error: e.message });
                    }

                    setTimeout(() => { deleteSession(id); }, 300000);

                    await delay(100);
                    res.end();
                    await Pair_Code_By_xhypher_Tech.ws.close();
                    return await removeFile(tempDir + '/' + id);
                } else if (connection === 'close') {
                    const closeError = lastDisconnect?.error;
                    console.error('WhatsApp connection closed:', closeError?.message || closeError || 'unknown reason');
                    const statusCode = closeError?.output?.statusCode;
                    if (statusCode && statusCode !== 401) {
                        await delay(10000);
                        xhypher_MD_PAIR_CODE();
                    }
                }
            });

            if (!Pair_Code_By_xhypher_Tech.authState.creds.registered) {
                await delay(5000);
                num = num.replace(/[^0-9]/g, '');
                let code;
                let lastError;
                for (let attempt = 1; attempt <= 3; attempt += 1) {
                    try {
                        code = await Pair_Code_By_xhypher_Tech.requestPairingCode(num);
                        break;
                    } catch (error) {
                        lastError = error;
                        if (error?.output?.statusCode !== 428 || attempt === 3) throw error;
                        await delay(3000);
                    }
                }
                if (!code) throw lastError || new Error('Pairing code was not generated');
                const formatted = code.match(/.{1,4}/g)?.join('-') || code;
                send('code', { code: formatted });
            }
        } catch (err) {
            console.log('Pairing error:', err.message || err);
            console.error(err);
            await removeFile(tempDir + '/' + id);
            send('error', { message: 'Service Currently Unavailable' });
            res.end();
        }
    }

    return await xhypher_MD_PAIR_CODE();
});

module.exports = router;
