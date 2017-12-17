'use strict';

const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const DialogflowApp = require('actions-on-google').DialogflowApp; // Google Assistant helper library
const admin = require('firebase-admin');

const fourteen = 14 * 24 * 60 * 60 * 1000;
const fourDays = 4 * 24 * 60 * 60 * 1000;

const serviceAccount = {
	"type": "service_account",
	"project_id": "practo-sandbox",
	"private_key_id": "464fc55f95bad527a543cb13cd3896253c9a8c69",
	"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDYxZnQX6BQ43VF\nksAGHhpA47DEUGqWuM45KcmFFb8oIS+M2i5ZMqZrke5elh89Xx2sTgI10FDPwmB/\nzlUX4s+WMYthWGZYwiCUggiOROPIL/2aGYT3M7YMBcVIWPszJxzuoivFQL3epwxo\nOLoNVycLT0BqbAba0t0mRwQv68EtdOAZCpfnIazalaIMKEMyfGLdzVKekIC7vuyV\nrun2rCy8ccL7sVqK/IcD9zQA9qJMZFDjuC4pap6NCFvu5Gp19bwkQ8vc7eFYHu05\n1gdC/Qa5ypML2immqoL+Z5otJJqFAYtPd8Bi/FYt0ii9sDpiVFDMnTyQr9K7QcQ6\nvmSj0ECzAgMBAAECggEAYkcgJ7UbGWEua2cPkRZ3v6CbJT3yPTg3Ivp7h09nNZnq\nFXlblwwcIFvujsqQCkKD0PkjDmPOJ4tQNdGFiclGZSk8MFukNyx4GexkVaANB1ce\nqo1UV8EFkajSGy1gYf4jI1u57XmfO4FP4jaJv3+aT4nUQguNBgugwPhkgRdpIyJq\nUr7zZVLlMm1TwnloV0yoavTyGs971obSHWkI8wTopElJltodYxcdrSaSDby2YuSR\niP6oL9Q16KXNHSkGh5SitdtjUi2/gc7XjswnSAAJ62zW6R2LXnr02kfi5aT/Bc1m\nIPLvOGD4i6zkTjk8NXtmp3K2NY+QEvY2GqPRHPZCKQKBgQD8gbMCDCmGPaJc/0Vr\nL6JveryQDhFm7DN93K7694oKJrE++emVxVjowKoNBdteIEwYgpvTYk5rH3gSGr42\nIxj9BOzVIhVvNcfg9VswdPo4WEpc/ex0WpdCBVW171lgEqMZmQwtOl6OGedVaSXT\nx4kZmYT2Id9qCrWJ1VaDEGLgmwKBgQDbxVcO/zN1TbxG8XgHnLoid7Oko6LNyK5D\n8DsOnu3s925dNVYNzHRMISeIkhA9vm6KDaEvNRAZCefucK6HIm9og/N4Wep+muzZ\ndm7aiu7zlsVNsUlUb93+/GpEhP8hCkoceye6OqS6A/CL8BiZJeI5JM53NIQ9KFc/\nlHHqn96lyQKBgFDwBgAfA+RqtzOWA5ti7m9LaUvHpp5WEf9DELeTRyUP1/q2wr/m\nPSSGNTvtZ66ZLashmm88cKR3ttYeyl+yCl14Ca4bucEm/QXHv84dgOM0scly/ysg\nqqFX8mxZ500bTDp1S2jn780e0n8XMC/dIr4Y7nyyyNlFy4D96DgktX0HAoGBAKLO\nkG31tIND8SSFIaxR+Lor/xMKfkMAVcjSoI12Qz/3FPVL29IhEk6LiSPtQMbc2jq/\nWhcEskY6Rm0nYMOPSQUeKzGPOt5LmwaGbBzOK7KckNG7cl1w+f45s+fKts4dN0Xe\nHlIhu4JqBLtGRJK/s9UtZR598zDzP59EMxfjEyexAoGAEccsMGt69cvzeQPYb0pd\nkKXwufcQgHgL4KN1qQUyktj+R6qlPlDdoVVK0UYCJ4rWxBMJ9KPZ9lbVoahbraFs\nXFxNcosNeKr+eb9m4o8fmYpPKwqvDFg43jXrhlT243TdnX2CAnvX5CVkJE3cVPvE\n5OXPGXSVGdBlIE6bcKMCY5c=\n-----END PRIVATE KEY-----\n",
	"client_email": "firebase-adminsdk-ow09n@practo-sandbox.iam.gserviceaccount.com",
	"client_id": "104030062603051347247",
	"auth_uri": "https://accounts.google.com/o/oauth2/auth",
	"token_uri": "https://accounts.google.com/o/oauth2/token",
	"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
	"client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ow09n%40practo-sandbox.iam.gserviceaccount.com"
};
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://practo-sandbox.firebaseio.com'
});
const db = admin.database();
const user = db.ref('123');

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  if (request.body.result) {
    processV1Request(request, response);
  } else if (request.body.queryResult) {
    processV2Request(request, response);
  } else {
    console.log('Invalid Request');
    return response.status(400).end('Invalid Webhook Request (expecting v1 or v2 webhook request)');
  }
});
/*
* Function to handle v1 webhook requests from Dialogflow
*/
function processV1Request (request, response) {
  let action = request.body.result.action; // https://dialogflow.com/docs/actions-and-parameters
  let parameters = request.body.result.parameters; // https://dialogflow.com/docs/actions-and-parameters
  let inputContexts = request.body.result.contexts; // https://dialogflow.com/docs/contexts
  let requestSource = (request.body.originalRequest) ? request.body.originalRequest.source : undefined;
  const googleAssistantRequest = 'google'; // Constant to identify Google Assistant requests
  const app = new DialogflowApp({request: request, response: response});
  // Create handlers for Dialogflow actions as well as a 'default' handler
  const actionHandlers = {
    // The default welcome intent has been matched, welcome the user (https://dialogflow.com/docs/events#default_welcome_intent)
    'input.welcome': () => {
      // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
      if (requestSource === googleAssistantRequest) {
        sendGoogleResponse('Hello, Welcome to my Dialogflow agent!'); // Send simple response to user
      } else {
        sendResponse('Hello, Welcome to my Dialogflow agent!'); // Send simple response to user
      }
    },
    'log-start': () => {
      // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
      let response = `Date is ${parameters.date}`
      if (requestSource === googleAssistantRequest) {
        sendGoogleResponse(response); // Send simple response to user
      } else {
        sendResponse(response); // Send simple response to user
      }
    },
    'get-cycle': () => {
    	let cycle_average = 0, period_average = 0;
    	user.on('value', function (snapshot) {
    		cycle_average = snapshot.val().cycle_average;
    		period_average = snapshot.val().period_average;

    		let response = `Your average menstruation cycle is for ${cycle_average} days.
    		And your periods usually last for ${period_average} days`
    		if (requestSource === googleAssistantRequest) {
    		  sendGoogleResponse(response); // Send simple response to user
    		} else {
    		  sendResponse(response); // Send simple response to user
    		}
    	});
      // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
    },
    'next-cycle': () => {
    	let cycleAverage = 0;
    	user.on('value', function (snapshot) {
    		cycleAverage = snapshot.val().cycle_average;
    		cycleAverage *= 24*60*60*1000;
    		let today = Date.now();
    		let timestamps = snapshot.val().timestamp;
    		let lastCycle = timestamps[timestamps.length - 1];
    		let lastCycleStartDate = Date.parse(lastCycle.period_date);
    		let nextCycleDate = lastCycleStartDate + cycleAverage;
    		let diff = nextCycleDate - Date.now();
    		diff = diff/(1000*24*60*60);
    		console.log('diff is: ', diff);
    		let response = `Based on your average period cycle, your next cycle is ${Math.floor(diff)} days away`
    		if (requestSource === googleAssistantRequest) {
    		  sendGoogleResponse(response); // Send simple response to user
    		} else {
    		  sendResponse(response); // Send simple response to user
    		}
    	});
      // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
    },
    'order': () => {
    	let cycleAverage = 0;
    	user.on('value', function (snapshot) {
    		cycleAverage = snapshot.val().cycle_average;
    		cycleAverage *= 24*60*60*1000;
    		let today = Date.now();
    		let timestamps = snapshot.val().timestamp;
    		let lastCycle = timestamps[timestamps.length - 1];
    		let lastCycleStartDate = Date.parse(lastCycle.period_date);
    		let nextCycleDate = lastCycleStartDate + cycleAverage;
    		let diff = nextCycleDate - Date.now();
    		diff = diff/(1000*24*60*60);
    		console.log('diff is: ', diff);
    		let response = `Based on your average period cycle, your next cycle is ${Math.floor(diff)} days away`
    		if (requestSource === googleAssistantRequest) {
    		  sendGoogleResponse(response); // Send simple response to user
    		} else {
    		  sendResponse(response); // Send simple response to user
    		}
    	});
      // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
    },
    'right-time': () => {
    	let cycleAverage = 0;
    	user.on('value', function (snapshot) {
    		cycleAverage = snapshot.val().cycle_average;
    		cycleAverage *= 24*60*60*1000;
    		let timestamps = snapshot.val().timestamp;
    		let lastCycle = timestamps[timestamps.length - 1];
    		console.log('last cycle: ', lastCycle);
    		let lastCycleStartDate = Date.parse(lastCycle.period_date);
    		let nextCycleDate = lastCycleStartDate + cycleAverage;
    		console.log('next cycle: ', new Date(nextCycleDate));
    		let ovulation = nextCycleDate - fourteen;
    		ovulation = new Date(ovulation);
    		console.log('ovulation is: ', ovulation.toDateString());
    		let ovulationFormatted = `${ovulation.getDate()}-${ovulation.getMonth() + 1}`
    		console.log('ovulation is: ', ovulation);
    		let hasHappened = Date.now() > ovulation;
    		let response = '';
    		if (hasHappened) {
    			response = `<speak>Based on your past cycles, you ovulated around 
    			<say-as interpret-as="date" format="dm">${ovulationFormatted}.</say-as><break time="1s"/>`
    		} else {
    			response = `<speak>Based on your past cycles, you will ovulate around 
    			<say-as interpret-as="date" format="dm">${ovulationFormatted}.</say-as><break time="1s"/>`
    		}
    		let maxDate = ovulation + fourDays;
    		let opportunityLost = Date.now() - maxDate;
    		if (parameters.pregnancy == 'true') {
    			if (opportunityLost) {
    				response += 'This is not the right time for intercourse if you intend to conceive.'
    			} else {
    				response += 'This is right time for intercourse if you intend to conceive.'
    			}
    		} else {
    			if (opportunityLost) {
    				response += 'This is right time for intercourse if you do not intend to conceive.'
    			} else {
    				response += 'This is not the right time to have intercourse without protection.<break time="1s"/>You can have that ordered for future though.'
    			}
    		}
    		response += '</speak>'
    		console.log(response);
    		if (requestSource === googleAssistantRequest) {
    		  sendGoogleResponse(response); // Send simple response to user
    		} else {
    		  sendResponse(response); // Send simple response to user
    		}
    	});
      // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
    },
    // The default fallback intent has been matched, try to recover (https://dialogflow.com/docs/intents#fallback_intents)
    'input.unknown': () => {
      // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
      if (requestSource === googleAssistantRequest) {
        sendGoogleResponse('I\'m having trouble, can you try that again?'); // Send simple response to user
      } else {
        sendResponse('I\'m having trouble, can you try that again?'); // Send simple response to user
      }
    },
    // Default handler for unknown or undefined actions
    'default': () => {
      // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
      if (requestSource === googleAssistantRequest) {
        let responseToUser = {
          //googleRichResponse: googleRichResponse, // Optional, uncomment to enable
          //googleOutputContexts: ['weather', 2, { ['city']: 'rome' }], // Optional, uncomment to enable
          speech: 'Blah blah', // spoken response
          text: 'Blah blah' // displayed response
        };
        sendGoogleResponse(responseToUser);
      } else {
        let responseToUser = {
          //data: richResponsesV1, // Optional, uncomment to enable
          //outputContexts: [{'name': 'weather', 'lifespan': 2, 'parameters': {'city': 'Rome'}}], // Optional, uncomment to enable
          speech: 'Blah blah', // spoken response
          text: 'Blah blah' // displayed response
        };
        sendResponse(responseToUser);
      }
    }
  };
  // If undefined or unknown action use the default handler
  if (!actionHandlers[action]) {
    action = 'default';
  }
  // Run the proper handler function to handle the request from Dialogflow
  actionHandlers[action]();
    // Function to send correctly formatted Google Assistant responses to Dialogflow which are then sent to the user
  function sendGoogleResponse (responseToUser) {
    if (typeof responseToUser === 'string') {
      app.ask(responseToUser); // Google Assistant response
    } else {
      // If speech or displayText is defined use it to respond
      let googleResponse = app.buildRichResponse().addSimpleResponse({
        speech: responseToUser.speech || responseToUser.displayText,
        displayText: responseToUser.displayText || responseToUser.speech
      });
      // Optional: Overwrite previous response with rich response
      if (responseToUser.googleRichResponse) {
        googleResponse = responseToUser.googleRichResponse;
      }
      // Optional: add contexts (https://dialogflow.com/docs/contexts)
      if (responseToUser.googleOutputContexts) {
        app.setContext(...responseToUser.googleOutputContexts);
      }
      console.log('Response to Dialogflow (AoG): ' + JSON.stringify(googleResponse));
      app.ask(googleResponse); // Send response to Dialogflow and Google Assistant
    }
  }
  // Function to send correctly formatted responses to Dialogflow which are then sent to the user
  function sendResponse (responseToUser) {
    // if the response is a string send it as a response to the user
    if (typeof responseToUser === 'string') {
      let responseJson = {};
      responseJson.speech = responseToUser; // spoken response
      responseJson.displayText = responseToUser; // displayed response
      response.json(responseJson); // Send response to Dialogflow
    } else {
      // If the response to the user includes rich responses or contexts send them to Dialogflow
      let responseJson = {};
      // If speech or displayText is defined, use it to respond (if one isn't defined use the other's value)
      responseJson.speech = responseToUser.speech || responseToUser.displayText;
      responseJson.displayText = responseToUser.displayText || responseToUser.speech;
      // Optional: add rich messages for integrations (https://dialogflow.com/docs/rich-messages)
      responseJson.data = responseToUser.data;
      // Optional: add contexts (https://dialogflow.com/docs/contexts)
      responseJson.contextOut = responseToUser.outputContexts;
      console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
      response.json(responseJson); // Send response to Dialogflow
    }
  }
}
// Construct rich response for Google Assistant (v1 requests only)
const app = new DialogflowApp();
const googleRichResponse = app.buildRichResponse()
  .addSimpleResponse('This is the first simple response for Google Assistant')
  .addSuggestions(
    ['Suggestion Chip', 'Another Suggestion Chip'])
    // Create a basic card and add it to the rich response
  .addBasicCard(app.buildBasicCard(`This is a basic card.  Text in a
 basic card can include "quotes" and most other unicode characters
 including emoji 📱.  Basic cards also support some markdown
 formatting like *emphasis* or _italics_, **strong** or __bold__,
 and ***bold itallic*** or ___strong emphasis___ as well as other things
 like line  \nbreaks`) // Note the two spaces before '\n' required for a
                        // line break to be rendered in the card
    .setSubtitle('This is a subtitle')
    .setTitle('Title: this is a title')
    .addButton('This is a button', 'https://assistant.google.com/')
    .setImage('https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
      'Image alternate text'))
  .addSimpleResponse({ speech: 'This is another simple response',
    displayText: 'This is the another simple response 💁' });
// Rich responses for Slack and Facebook for v1 webhook requests
const richResponsesV1 = {
  'slack': {
    'text': 'This is a text response for Slack.',
    'attachments': [
      {
        'title': 'Title: this is a title',
        'title_link': 'https://assistant.google.com/',
        'text': 'This is an attachment.  Text in attachments can include \'quotes\' and most other unicode characters including emoji 📱.  Attachments also upport line\nbreaks.',
        'image_url': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
        'fallback': 'This is a fallback.'
      }
    ]
  },
  'facebook': {
    'attachment': {
      'type': 'template',
      'payload': {
        'template_type': 'generic',
        'elements': [
          {
            'title': 'Title: this is a title',
            'image_url': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
            'subtitle': 'This is a subtitle',
            'default_action': {
              'type': 'web_url',
              'url': 'https://assistant.google.com/'
            },
            'buttons': [
              {
                'type': 'web_url',
                'url': 'https://assistant.google.com/',
                'title': 'This is a button'
              }
            ]
          }
        ]
      }
    }
  }
};
/*
* Function to handle v2 webhook requests from Dialogflow
*/
function processV2Request (request, response) {
  // An action is a string used to identify what needs to be done in fulfillment
  let action = (request.body.queryResult.action) ? request.body.queryResult.action : 'default';
  // Parameters are any entites that Dialogflow has extracted from the request.
  let parameters = request.body.queryResult.parameters || {}; // https://dialogflow.com/docs/actions-and-parameters
  // Contexts are objects used to track and store conversation state
  let inputContexts = request.body.queryResult.contexts; // https://dialogflow.com/docs/contexts
  // Get the request source (Google Assistant, Slack, API, etc)
  let requestSource = (request.body.originalDetectIntentRequest) ? request.body.originalDetectIntentRequest.source : undefined;
  // Get the session ID to differentiate calls from different users
  let session = (request.body.session) ? request.body.session : undefined;
  // Create handlers for Dialogflow actions as well as a 'default' handler
  const actionHandlers = {
    // The default welcome intent has been matched, welcome the user (https://dialogflow.com/docs/events#default_welcome_intent)
    'input.welcome': () => {
      sendResponse('Hello, Welcome to my Dialogflow agent!'); // Send simple response to user
    },
    // The default fallback intent has been matched, try to recover (https://dialogflow.com/docs/intents#fallback_intents)
    'input.unknown': () => {
      // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
      sendResponse('I\'m having trouble, can you try that again?'); // Send simple response to user
    },
    // 'input.log': () => {
    //   // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
    //   sendResponse('Log intent triggered!'); // Send simple response to user
    // },
    // Default handler for unknown or undefined actions
    'default': () => {
      let responseToUser = {
        //fulfillmentMessages: richResponsesV2, // Optional, uncomment to enable
        //outputContexts: [{ 'name': `${session}/contexts/weather`, 'lifespanCount': 2, 'parameters': {'city': 'Rome'} }], // Optional, uncomment to enable
        fulfillmentText: 'This is from Dialogflow\'s Cloud Functions for Firebase editor! :-)' // displayed response
      };
      sendResponse(responseToUser);
    }
  };
  // If undefined or unknown action use the default handler
  if (!actionHandlers[action]) {
    action = 'default';
  }
  // Run the proper handler function to handle the request from Dialogflow
  actionHandlers[action]();
  // Function to send correctly formatted responses to Dialogflow which are then sent to the user
  function sendResponse (responseToUser) {
    // if the response is a string send it as a response to the user
    if (typeof responseToUser === 'string') {
      let responseJson = {fulfillmentText: responseToUser}; // displayed response
      response.json(responseJson); // Send response to Dialogflow
    } else {
      // If the response to the user includes rich responses or contexts send them to Dialogflow
      let responseJson = {};
      // Define the text response
      responseJson.fulfillmentText = responseToUser.fulfillmentText;
      // Optional: add rich messages for integrations (https://dialogflow.com/docs/rich-messages)
      if (responseToUser.fulfillmentMessages) {
        responseJson.fulfillmentMessages = responseToUser.fulfillmentMessages;
      }
      // Optional: add contexts (https://dialogflow.com/docs/contexts)
      if (responseToUser.outputContexts) {
        responseJson.outputContexts = responseToUser.outputContexts;
      }
      // Send the response to Dialogflow
      console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
      response.json(responseJson);
    }
  }
}
const richResponseV2Card = {
  'title': 'Title: this is a title',
  'subtitle': 'This is an subtitle.  Text can include unicode characters including emoji 📱.',
  'imageUri': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  'buttons': [
    {
      'text': 'This is a button',
      'postback': 'https://assistant.google.com/'
    }
  ]
};
const richResponsesV2 = [
  {
    'platform': 'ACTIONS_ON_GOOGLE',
    'simple_responses': {
      'simple_responses': [
        {
          'text_to_speech': 'Spoken simple response',
          'display_text': 'Displayed simple response'
        }
      ]
    }
  },
  {
    'platform': 'ACTIONS_ON_GOOGLE',
    'basic_card': {
      'title': 'Title: this is a title',
      'subtitle': 'This is an subtitle.',
      'formatted_text': 'Body text can include unicode characters including emoji 📱.',
      'image': {
        'image_uri': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png'
      },
      'buttons': [
        {
          'title': 'This is a button',
          'open_uri_action': {
            'uri': 'https://assistant.google.com/'
          }
        }
      ]
    }
  },
  {
    'platform': 'FACEBOOK',
    'card': richResponseV2Card
  },
  {
    'platform': 'SLACK',
    'card': richResponseV2Card
  }
];
