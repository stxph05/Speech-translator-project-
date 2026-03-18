import React, { useState } from "react";
import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  SpeechSynthesizer,
} from "microsoft-cognitiveservices-speech-sdk";

const TranslatorApp = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("zh-CN"); // Default to Chinese for output
  const [inputLanguage, setInputLanguage] = useState("en-SG"); // Default to English for input
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // State for recording status

  // Azure Keys (to edit)
  const speechKey = "key";
  const speechRegion = "eastus";
  const translatorKey = "key";
  const translatorEndpoint = "https://api.cognitive.microsofttranslator.com/";

  let recognizer; // Store recognizer instance to stop recording

  // Start Recording
  const handleStartRecording = async () => {
    setIsRecording(true);
    const speechConfig = SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechRecognitionLanguage = inputLanguage; // Dynamically set the input language

    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    recognizer = new SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync(
      (result) => {
        setInputText(result.text);
        recognizer.close();
        handleTranslation(result.text);
        setIsRecording(false);
      },
      (error) => {
        console.error("Error in speech recognition:", error);
        setIsRecording(false);
      }
    );
  };

  // Stop Recording
  const handleStopRecording = () => {
    if (recognizer) {
      recognizer.stopContinuousRecognitionAsync(
        () => {
          console.log("Recording stopped.");
          setIsRecording(false);
        },
        (error) => {
          console.error("Error stopping recording:", error);
          setIsRecording(false);
        }
      );
    }
  };

  // Translate Text
  const handleTranslation = async (text) => {
    try {
      const response = await fetch(
        `${translatorEndpoint}/translate?api-version=3.0&to=${targetLanguage}`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": translatorKey,
            "Ocp-Apim-Subscription-Region": speechRegion,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([{ Text: text }]),
        }
      );
      const data = await response.json();
      const translated = data[0].translations[0].text;
      setTranslatedText(translated);
    } catch (error) {
      console.error("Translation Error:", error);
    }
  };

  // Play the translated text as speech
  const handlePlaySpeech = () => {
    if (!translatedText) {
      console.error("No translation available to speak.");
      return;
    }

    const speechConfig = SpeechConfig.fromSubscription(speechKey, speechRegion);
    const audioConfig = AudioConfig.fromDefaultSpeakerOutput(); // Direct to speakers

    speechConfig.speechSynthesisLanguage = targetLanguage; // Set target language for TTS
    const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

    synthesizer.speakTextAsync(
      translatedText,
      (result) => {
        console.log("Speech synthesis succeeded:", result);
        synthesizer.close();
      },
      (error) => {
        console.error("Speech synthesis error:", error);
        synthesizer.close();
      }
    );
  };

  return (
    <div class="box1" style={{ padding: "0px", fontFamily: "Arial" }}>
      <a href="https://www.apexharmony.org.sg/" target="_blank">
        <header>
          <p class="font1">
            <b class="font2">Speech Translation Application</b>
            <br />
            <span class="font3">
              supported languages: english | chinese | tamil | malay | cantonese | hokkien
            </span>
          </p>
        </header>
      </a>

      {/* Input Language Dropdown */}
      <div class="mainbox">
          <div>
            <label>Input Language: </label>
            <select
              value={inputLanguage}
              onChange={(e) => setInputLanguage(e.target.value)}
            >
              <option value="en-SG">English</option>
              <option value="zh-CN">Chinese (Simplified)</option>
              <option value="ta-IN">Tamil</option>
              <option value="ms-MY">Malay</option>
              <option value="zh-HK">Cantonese</option>
              <option value="hi-IN">Hindi</option>
            </select>
          </div>

          {/* Start Recording Section */}
          <div class="box3"
            style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "20px" }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: isRecording ? "red" : "green",
              }}
            ></div>
            <button class="button1" onClick={handleStartRecording} disabled={isRecording}>
              {isRecording ? "Recording..." : "Start Recording"}
            </button>
            {isRecording && (
              <button onClick={handleStopRecording} style={{ marginLeft: "10px" }}>
                Stop Recording
              </button>
            )}
          </div>

          <div style={{ margin: "20px 0" }}>
            <h3>Original Text:</h3>
            <p>{inputText || "No input yet"}</p>
          </div>
          <div style={{ margin: "20px 0" }}>
            <h3>Translated Text:</h3>
            <p>{translatedText || "No translation yet"}</p>
          </div>

          {/* Output Language Dropdown */}
          <div>
            <label>Target Language: </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              <option value="zh-CN">Chinese (Simplified)</option>
              <option value="en-SG">English</option>
              <option value="ta-IN">Tamil</option>
              <option value="ms-MY">Malay</option>
              <option value="zh-HK">Cantonese</option>
              <option value="hi-IN">Hindi</option>
            </select>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button
              onClick={handlePlaySpeech}
              disabled={!translatedText} // Disable if there's no translation
              style={{
                backgroundColor: "green",
                color: "white",
                padding: "10px 20px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Play Translation
            </button>
          </div>
          <div class="box2">

            <a href="" target="_blank">
              <button
              style={{
                backgroundColor: "#A7C7E7	",
                color: "white",
                padding: "10px 20px",
                border: "none",
                cursor: "pointer",
              }}
              >Click to access Hokkien Translator

              </button>
            </a>

          </div>

      </div>
      
    </div>


  );
};

export default TranslatorApp;
