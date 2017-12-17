var res = {
  "id": "a4aff819-33a4-4c9c-a4d0-b00479fe3c42",
  "timestamp": "2017-12-16T15:05:25.463Z",
  "lang": "en",
  "result": {
    "source": "agent",
    "resolvedQuery": "today",
    "action": "log",
    "actionIncomplete": false,
    "parameters": {
      "date": "2017-12-16"
    },
    "contexts": [],
    "metadata": {
      "intentId": "600e19a3-9945-49ad-91b2-282d3d6b8618",
      "webhookUsed": "true",
      "webhookForSlotFillingUsed": "false",
      "webhookResponseTime": 414,
      "intentName": "log"
    },
    "fulfillment": {
      "speech": "Hello, Welcome to my Dialogflow agent!",
      "displayText": "Hello, Welcome to my Dialogflow agent!",
      "messages": [
        {
          "type": 0,
          "speech": "Hello, Welcome to my Dialogflow agent!"
        }
      ]
    },
    "score": 1
  },
  "status": {
    "code": 200,
    "errorType": "success",
    "webhookTimedOut": false
  },
  "sessionId": "28bde2a8-0c3e-4cba-9b56-caaa774771b7"
};

module.exports = {res};

