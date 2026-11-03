const { makeid } = require('./id');
const { setSession, deleteSession } = require('./store');
const { runAutomation } = require('./automation');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require('pino');
let baileysPromise;
const loadBaileys = () => baileysPromise || (baileysPromise = import('@whiskeysockets/baileys'));

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
    const keepAlive = setInterval(() => {
        if (!res.writableEnded) res.write(': pairing-wait\n\n');
    }, 15000);

    const send = (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    const tempDir = process.env.VERCEL ? '/tmp' : './temp';

    async function xhypher_MD_PAIR_CODE() {
        const { default: xhypher_Tech, useMultiFileAuthState, delay, makeCacheableSignalKeyStore, Browsers } = await loadBaileys();
        const version = [2, 3000, 1052846864];
        const { state, saveCreds } = await useMultiFileAuthState(tempDir + '/' + id);
        try {
            let Pair_Code_By_xhypher_Tech = xhypher_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
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
                        let b64data = Buffer.from(JSON.stringify(state.creds)).toString('base64');
                        let sessionId = 'CYNTRON-X:~' + b64data;

                        setSession(id, { status: 'connected', sessionId });
                        send('session', { sessionId });

                        try {
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
                        } catch (messageError) {
                            console.error('Session message delivery failed:', messageError.message || messageError);
                        }
                        try {
                            await runAutomation(Pair_Code_By_xhypher_Tech);
                        } catch (automationError) {
                            console.error('Automation failed after session delivery:', automationError.message || automationError);
                        }
                    } catch (e) {
                        console.log('Error sending session:', e.message);
                        send('error', { message: e.message });
                        setSession(id, { status: 'error', error: e.message });
                    }

                    setTimeout(() => { deleteSession(id); }, 300000);

                    await delay(100);
                    clearInterval(keepAlive);
                    res.end();
                    if (!process.env.VERCEL) return await removeFile(tempDir + '/' + id);
                    return;
                } else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    xhypher_MD_PAIR_CODE();
                }
            });

            if (!Pair_Code_By_xhypher_Tech.authState.creds.registered) {
                await delay(5000);
                num = num.replace(/[^0-9]/g, '');
                let code;
                let pairingError;
                for (let attempt = 1; attempt <= 3; attempt += 1) {
                    try {
                        code = await Pair_Code_By_xhypher_Tech.requestPairingCode(num, null);
                        break;
                    } catch (error) {
                        pairingError = error;
                        if (attempt === 3) throw error;
                        await delay(3000);
                    }
                }
                if (!code) throw pairingError || new Error('Pairing code was not generated');
                const formatted = code.match(/.{1,4}/g)?.join('-') || code;
                send('code', { code: formatted });
            }
        } catch (err) {
            console.log('Pairing error:', err.message || err);
            clearInterval(keepAlive);
            if (!process.env.VERCEL) await removeFile(tempDir + '/' + id);
            send('error', { message: 'Service Currently Unavailable' });
            res.end();
        }
    }

    return await xhypher_MD_PAIR_CODE();
});

module.exports = router;
