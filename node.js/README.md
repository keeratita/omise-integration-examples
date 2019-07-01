# Installation & usage

```
npm i
npm start
```

Default port is `3000`.

# Where to get a public key and secret key?
You can find your public key and secret key on Omise Dashboard if you've already registered. [https://dashboard.omise.co/test/keys](https://dashboard.omise.co/test/keys)

# How to test a WebHooks?
1. Install `ngrok`
```
brew cask install ngrok
```

2. Run `ngrok`
```
ngrok http 3000
```

3. Copy an HTTPS url and paste it [here](https://dashboard.omise.co/test/webhooks/edit)
e.g. ` https://6c5c4fe3.ngrok.io` -> ` https://6c5c4fe3.ngrok.io/webhook`
