# MaxieBot

## Installation
Go to the [discord developers site](https://discordapp.com/developers/applications/) and create your app and bot.
You will need your client ID from the general information tab and your bot token from the bot tab.

Auth your bot to your discord server. You must have manage server permissions.
You can do it through the following link. Insert your Client ID into the url.

`https://discordapp.com/oauth2/authorize?&client_id=CLIENT_ID&scope=bot&permissions=2048`

Clone/fork repo and `npm install`

Add a .env file in the root directory containing your bot token like so.

`TOKEN=YOUR_BOT_TOKEN`

Run the index.js to start the bot `node index.js`
