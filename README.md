# Discord Delete Messages

Discord 上の特定のキーワードを含むチャットをまとめて削除するツール

## 実行するには？

NodeJS (16.x) と Yarn が必要です

```bash
git clone https://github.com/mc-nekoneko/disdelme.git
cd disdelme && yarn install
yarn run dev -t <token> -g <guildId> -c <channelId> -k <keywords>
```
