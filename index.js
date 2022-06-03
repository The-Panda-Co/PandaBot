require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const querystring = require("querystring");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express()
const port = process.env.PORT || 4000

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Welcome to the Pandabot for Zoom!')
})

app.get('/authorize', (req, res) => {
  res.redirect('https://zoom.us/launch/chat?jid=robot_' + process.env.zoom_bot_jid)
})

app.get('/support', (req, res) => {
  res.send('See Zoom Developer Support  for help.')
})

app.get('/privacy', (req, res) => {
  res.send('The Pandabot for Zoom does not store any user data.')
})

app.get('/terms', (req, res) => {
  res.send('By installing the Pandabot for Zoom, you are accept and agree to these terms...')
})

app.get('/zoomverify/verifyzoom.html', (req, res) => {
  res.send(process.env.zoom_verification_code)
})

app.post('/pandabot', (req, res) => {
  getChatbotToken()

function getChatbotToken () {
  request({
    url: `https://zoom.us/oauth/token?grant_type=client_credentials`,
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(process.env.zoom_client_id + ':' + process.env.zoom_client_secret).toString('base64')
    }
  }, (error, httpResponse, body) => {
    if (error) {
      console.log('Error getting chatbot_token from Zoom.', error)
    } else {
      body = JSON.parse(body)
      sendChat(body.access_token)
    }
  })
}

function sendChat (chatbotToken) {
  request({
    url: 'https://api.zoom.us/v2/im/chat/messages',
    method: 'POST',
    json: true,
    body: {
      'robot_jid': process.env.zoom_bot_jid,
      'to_jid': req.body.payload.toJid,
      'account_id': req.body.payload.accountId,
      'content': {
	'head': {
	    'text':'Panda Bot Speaking Here'
	},
        'body': [{
          'type': 'message',
          'text': req.body.payload.cmd
        }]
      }
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + chatbotToken
    }
  }, (error, httpResponse, body) => {
    if (error) {
      console.log('Error sending chat.', error)
    } else {
      console.log(body)
    }
  })
}
})
/*app.post('/sendback', (req, res) => {
  console.log(req.body)
if(req.body.payload.object.channel_name == '6th Grade Chat'){
	const msg = req.body.payload.object.message
	console.log(msg);
	if(msg == "Hey Panda Bot, do you like pandas?"){
fetch('https://inbots.zoom.us/incoming/hook/kumumXcqo1-_QC0kU4WeZENJ', {
    method: 'POST',
    headers: {
        'Authorization': 'LWYm3eeFtAWA23pjC4hQQTUL',
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'Well yes, of course, I am a panda, pandas are the best animal of course!'
});
	}
if(msg == "I hate pandas"){
fetch('https://inbots.zoom.us/incoming/hook/kumumXcqo1-_QC0kU4WeZENJ', {
    method: 'POST',
    headers: {
        'Authorization': 'LWYm3eeFtAWA23pjC4hQQTUL',
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'YOU DARE SAY ANYTHING BAD ABOUT PANDAS. I SHALL KILL YOU'
});
	}
if(msg == "I love pandas"){
fetch('https://inbots.zoom.us/incoming/hook/kumumXcqo1-_QC0kU4WeZENJ', {
    method: 'POST',
    headers: {
        'Authorization': 'LWYm3eeFtAWA23pjC4hQQTUL',
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'Well, of course your just stating a blatantly obvious fact, everyone loves pandas right?'
});
	}

}})
*/
app.post('/deauthorize', (req, res) => {
  if (req.headers.authorization === process.env.zoom_verification_token) {
    res.status(200)
    res.send()
    request({
      url: 'https://api.zoom.us/oauth/data/compliance',
      method: 'POST',
      json: true,
      body: {
        'client_id': req.body.payload.client_id,
        'user_id': req.body.payload.user_id,
        'account_id': req.body.payload.account_id,
        'deauthorization_event_received': req.body.payload,
        'compliance_completed': true
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(process.env.zoom_client_id + ':' + process.env.zoom_client_secret).toString('base64'),
        'cache-control': 'no-cache'
      }
    }, (error, httpResponse, body) => {
      if (error) {
        console.log(error)
      } else {
        console.log(body)
      }
    })
  } else {
    res.status(401)
    res.send('Unauthorized request to Pandabot for Zoom.')
  }
})

app.listen(port, () => console.log(`Pandabot for Zoom listening on port ${port}!`))
