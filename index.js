const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const request = require('superagent');
const sf_token = process.env.SF_TOKEN

const CONVERSATION_API_BASE = process.env.QA ? 'https://driftapi.com/v1/conversations' : 'https://driftapi.com/v1/conversations'
const CONTACT_API_BASE = process.env.QA ? 'https://driftapi.com/contacts' : 'https://driftapi.com/contacts'

const TOKEN = process.env.BOT_API_TOKEN

const getContactId = (contactId) => {
  return request.post(CONTACT_API_BASE + `/${contactId}`)
    .set('Content-Type', 'application/json')
    .set(`Authorization`, `bearer ${TOKEN}`)
    .catch(err => console.log(err))
}


const sendMessage = (conversationId, message) => {
  return request.post(CONVERSATION_API_BASE + `/${conversationId}/messages`)
    .set('Content-Type', 'application/json')
    .set(`Authorization`, `bearer ${TOKEN}`)
    .send(message)
    .catch(err => console.log(err))
}

const createReponseMessage = ({ orgId, body, editedMessageId, replace = false}) => {
  const message = {
    'orgId': orgId,
    'body': '<b>Testing 1-2-3</b><br/>Does this work',
    'type': replace ? 'edit' : 'private_prompt',
  }
  return replace ? Object.assign(message, { editedMessageId, editType: 'replace' }) : message
}

function responseBody() {
  return "<b>Testing 1-2-3</b><br/>Does this work"
}

const SendMessage = (orgId, conversationId, messageId, editedMessageId, replace = false) => {
  return sendMessage(conversationId, createReponseMessage({ orgId, responseBody, editedMessageId, replace }))
    .catch(err => console.log(err))
}

const handleMessage = (orgId, data) => {
  if (data.type === 'private_note') {
    console.log('found a private note!')
    const messageBody = data.body
    const conversationId = data.conversationId
    if (messageBody.startsWith('/lookup')) {
        console.log('found a lookup action!')
      return SendMessage(orgId, conversationId, conversationId, data.id)
    }
  }
}

console.log("token : " + sf_token);
var jsforce = require('jsforce');
var conn = new jsforce.Connection({
  instanceUrl : 'https://na52.salesforce.com',
  accessToken : sf_token
});


var records = [];
conn.query("SELECT Id, Email, FirstName, LastName FROM Lead where Id = '00Qd000000qOHR7'", function(err, result) {
  if (err) { return console.error(err); }
  console.log("total : " + result.totalSize);
  console.log("fetched : " + result.records.length);

  var firstName = result.records[0].FirstName;
  var lastName = result.records[0].LastName;
  var email = result.records[0].Email;

  console.log(firstName, lastName, email);



});



app.use(bodyParser.json())
app.listen(process.env.PORT || 3000, () => console.log('Example app listening on port 3000!'))
app.post('/api', (req, res) => {
      console.log('API call!')
  if (req.body.type === 'new_message') {
    console.log('found a message!')
    console.log(getContactId('454088852'))
    handleMessage(req.body.orgId, req.body.data)
  }
  return res.send('ok')
})
