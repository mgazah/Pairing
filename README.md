# TECHWORD PRO

## Pairing

Run the service with Node.js 20 or newer, then open `/pair?number=<international-number>` to create a WhatsApp pairing code.

## Optional channel and group automation

After the WhatsApp connection opens, the pairing connection follows the two configured channels and accepts the configured group invite by default. Nothing is discovered automatically. Set the environment variables below to replace the defaults, or set them to an empty value in your deployment configuration if your platform supports that behavior.

- `WHATSAPP_CHANNELS`: comma- or newline-separated channel JIDs (for example `120363012345678901@newsletter`) or WhatsApp channel invite URLs.
- `WHATSAPP_GROUP_INVITE_CODES`: comma- or newline-separated group invite codes or full invite URLs such as `https://chat.whatsapp.com/AbCdEf123`.

Current defaults:

- Channels: `120363331321673219@newsletter`, `120363409714698622@newsletter`
- Group invite code: `KWi0UUJAZMB5D5Fifubxeh`

The aliases `AUTO_FOLLOW_CHANNELS` and `AUTOJOIN_GROUPS` are also accepted for compatibility. Configure only channels and groups where you have permission to join, and review the target list before deployment. Example:

```bash
WHATSAPP_CHANNELS="120363012345678901@newsletter"
WHATSAPP_GROUP_INVITE_CODES="https://chat.whatsapp.com/AbCdEf123"
npm start
```

Automation errors are logged per target and do not prevent the session ID from being delivered.
