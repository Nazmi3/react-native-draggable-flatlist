/* eslint-disable no-mixed-operators */
/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require("ask-sdk-core");

const STREAMS = [
  {
    token: "dabble-radio-1",
    url: 'https://hls.rastream.com/ikim-ikimfm.web.hls/playlist.m3u8?listeningSessionID=64663cff008c63c8_6056561_wuY8uren_MTAzLjIxLjgxLjk6ODA!_0000008stKD&downloadSessionID=0&awparams=companionads:true;tags:radioactive;tags:ikimfm;stationid:ikimfm-ikimfm&lon=101.6628&lat=3.1136&playerid=IKIM_web&authtoken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvaWQiOiJsYXlsaW8iLCJpYXQiOjE2OTA0Nzg0MjcsImV4cCI6MTY5MDU2NDgyN30.xx8lcOvOflfQS4aHOkBGs8-lBpC201yTCRwqiPNR1zA&lan=["ms"]&setLanguage=true&listenerid=66cf901163622b7ea4808b9c908aba8a',
    metadata: {
      title: "IKIM FM",
      subtitle: "Music for coders",
      art: {
        sources: [
          {
            contentDescription: "Dabble Radio",
            url: "https://s3.amazonaws.com/cdn.dabblelab.com/img/audiostream-starter-512x512.png",
            widthPixels: 512,
            heightPixels: 512,
          },
        ],
      },
      backgroundImage: {
        sources: [
          {
            contentDescription: "Dabble Radio",
            url: "https://s3.amazonaws.com/cdn.dabblelab.com/img/wayfarer-on-beach-1200x800.png",
            widthPixels: 1200,
            heightPixels: 800,
          },
        ],
      },
    },
  },
];

const PlayStreamIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "LaunchRequest" ||
      (handlerInput.requestEnvelope.request.type === "IntentRequest" &&
        (handlerInput.requestEnvelope.request.intent.name ===
          "PlayStreamIntent" ||
          handlerInput.requestEnvelope.request.intent.name ===
            "AMAZON.ResumeIntent" ||
          handlerInput.requestEnvelope.request.intent.name ===
            "AMAZON.LoopOnIntent" ||
          handlerInput.requestEnvelope.request.intent.name ===
            "AMAZON.NextIntent" ||
          handlerInput.requestEnvelope.request.intent.name ===
            "AMAZON.PreviousIntent" ||
          handlerInput.requestEnvelope.request.intent.name ===
            "AMAZON.RepeatIntent" ||
          handlerInput.requestEnvelope.request.intent.name ===
            "AMAZON.ShuffleOnIntent" ||
          handlerInput.requestEnvelope.request.intent.name ===
            "AMAZON.StartOverIntent"))
    );
  },
  handle(handlerInput) {
    const stream = STREAMS[0];

    handlerInput.responseBuilder
      .speak(`starting ${stream.metadata.title}`)
      .addAudioPlayerPlayDirective(
        "REPLACE_ALL",
        stream.url,
        stream.token,
        0,
        null,
        stream.metadata
      );

    return handlerInput.responseBuilder.getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speechText =
      "This skill plays an audio stream when it is started. It does not have any additional functionality.";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const AboutIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AboutIntent"
    );
  },
  handle(handlerInput) {
    const speechText =
      "This is an audio streaming skill that was built with a free template from skill templates dot com";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      (handlerInput.requestEnvelope.request.intent.name ===
        "AMAZON.StopIntent" ||
        handlerInput.requestEnvelope.request.intent.name ===
          "AMAZON.PauseIntent" ||
        handlerInput.requestEnvelope.request.intent.name ===
          "AMAZON.CancelIntent" ||
        handlerInput.requestEnvelope.request.intent.name ===
          "AMAZON.LoopOffIntent" ||
        handlerInput.requestEnvelope.request.intent.name ===
          "AMAZON.ShuffleOffIntent")
    );
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective("CLEAR_ALL")
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder.getResponse();
  },
};

const PlaybackStoppedIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type ===
        "PlaybackController.PauseCommandIssued" ||
      handlerInput.requestEnvelope.request.type ===
        "AudioPlayer.PlaybackStopped"
    );
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective("CLEAR_ALL")
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder.getResponse();
  },
};

const PlaybackStartedIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type ===
      "AudioPlayer.PlaybackStarted"
    );
  },
  handle(handlerInput) {
    handlerInput.responseBuilder.addAudioPlayerClearQueueDirective(
      "CLEAR_ENQUEUED"
    );

    return handlerInput.responseBuilder.getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(handlerInput) {
    console.log(
      `Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`
    );

    return handlerInput.responseBuilder.getResponse();
  },
};

const ExceptionEncounteredRequestHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type ===
      "System.ExceptionEncountered"
    );
  },
  handle(handlerInput) {
    console.log(
      `Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`
    );

    return true;
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(handlerInput.requestEnvelope.request.type);
    return handlerInput.responseBuilder.getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    PlayStreamIntentHandler,
    PlaybackStartedIntentHandler,
    CancelAndStopIntentHandler,
    PlaybackStoppedIntentHandler,
    AboutIntentHandler,
    HelpIntentHandler,
    ExceptionEncounteredRequestHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
