const fs = require('fs');
let code = fs.readFileSync('src/pages/shared/CommunicationHub.tsx', 'utf8');

code = code.replace(
  `const res = await api.getChatChannels();`,
  `const [res, users] = await Promise.all([api.getChatChannels(), api.getUsers()]);\n        const userChannels = (Array.isArray(users) ? users : []).filter((u: any) => u.id !== user?.id).map((u: any) => ({\n          id: \`dm_\${u.id}\`,\n          name: u.name,\n          type: 'private' as const,\n          description: \`Direct message with \${u.role}\`,\n          members: [user?.id, u.id]\n        }));`
);

code = code.replace(
  `const data = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];`,
  `const apiData = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];\n        const data = [...apiData, ...userChannels];`
);

// We should fix the `getChannelMessages` logic if it's a DM. But if we just rely on `sendChannelMessage` to handle any string id, it might work if the backend just saves messages by channel id (even fake ones like `dm_u1`).
// Actually, `Messages.tsx` used `api.getMessages(user.id)` and `api.sendMessage(from, to, text)`.
// We can intercept the send logic if the channel id starts with `dm_`.
code = code.replace(
  `const res = await api.getChannelMessages(selectedChannel);`,
  `let res: any;
        if (selectedChannel.startsWith('dm_')) {
          const targetId = selectedChannel.replace('dm_', '');
          const msgs = await api.getMessages(user?.id || '').catch(() => []);
          res = (Array.isArray(msgs) ? msgs : []).filter((m: any) => 
            (m.from === user?.id && m.to === targetId) || 
            (m.from === targetId && m.to === user?.id)
          ).map((m: any) => ({
            id: m.id,
            senderId: m.from,
            senderName: m.from === user?.id ? user?.name : channels.find(c => c.id === selectedChannel)?.name || 'User',
            content: m.content,
            timestamp: m.timestamp,
            type: 'text'
          }));
        } else {
          res = await api.getChannelMessages(selectedChannel);
        }`
);

code = code.replace(
  `await api.sendChannelMessage(selectedChannel, msg);`,
  `if (selectedChannel.startsWith('dm_')) {
        const targetId = selectedChannel.replace('dm_', '');
        await api.sendMessage(user?.id || '', targetId, msg.content);
      } else {
        await api.sendChannelMessage(selectedChannel, msg);
      }`
);

fs.writeFileSync('src/pages/shared/CommunicationHub.tsx', code);
