export const MODEL_DISPLAY_NAME_KEYS = {
  "text-passthrough": "inputText",
  "image-passthrough": "inputImage",
  "video-passthrough": "inputVideo",
  "audio-passthrough": "inputAudio",
  "prompt-concatenator": "promptConcatenator",
  "video-combiner": "videoCombiner",
  "api-node": "apiNode",
  "utility-node": "utilityNode",
  "any-llm": "anyLlm",
  "openrouter-vision": "openrouterVision",
  "gpt-5-nano": "gpt5Nano",
  "gpt-5-mini": "gpt5Mini",
  "wavespeed": "wavespeedApi",
  "straico": "straicoApi",
  "runware": "runwareApi",
  "genvr": "genvrApi",
};

const MODEL_NAME_PHRASE_KEYS = [
  ["Start/End", "modelPhraseStartEnd"],
  ["Remove Background", "optionRemoveBackground"],
  ["TextToVideo", "modelPhraseTextToVideo"],
  ["ImageToVideo", "modelPhraseImageToVideo"],
  ["Reference to Image", "modelPhraseReferenceToImage"],
  ["Reference to Video", "modelPhraseReferenceToVideo"],
  ["Motion Control", "modelPhraseMotionControl"],
  ["Video Extend", "modelPhraseVideoExtend"],
  ["Reference Image", "modelPhraseReferenceImage"],
  ["Omni Reference", "modelPhraseOmniReference"],
  ["Style Reference", "modelPhraseStyleReference"],
  ["Image to Image", "modelPhraseImageToImage"],
  ["Text to Image", "modelPhraseTextToImage"],
  ["Image to Video", "modelPhraseImageToVideo"],
  ["Text to Video", "modelPhraseTextToVideo"],
  ["Image Edit", "modelPhraseImageEdit"],
  ["Video Edit", "modelPhraseVideoEdit"],
  ["Edit Video", "modelPhraseVideoEdit"],
  ["Image Generation", "modelPhraseImageGeneration"],
  ["Video Generation", "modelPhraseVideoGeneration"],
  ["Audio Generation", "modelPhraseAudioGeneration"],
  ["Text Generation", "modelPhraseTextGeneration"],
  ["Create Music", "modelPhraseCreateMusic"],
  ["Extend Music", "modelPhraseExtendMusic"],
  ["Remix Music", "modelPhraseRemixMusic"],
  ["Text to Speech", "modelPhraseTextToSpeech"],
  ["Speech to Text", "modelPhraseSpeechToText"],
  ["Voice Clone", "modelPhraseVoiceClone"],
  ["Input Text", "inputText"],
  ["Input Image", "inputImage"],
  ["Input Video", "inputVideo"],
  ["Input Audio", "inputAudio"],
  ["Background Removal", "modelPhraseBackgroundRemoval"],
  ["Generate Image", "modelPhraseGenerateImage"],
  ["Generate Video", "modelPhraseGenerateVideo"],
  ["Generate Audio", "modelPhraseGenerateAudio"],
  ["Generate Text", "modelPhraseGenerateText"],
  ["Speech", "modelPhraseSpeech"],
  ["Reference", "modelPhraseReference"],
  ["Caption", "modelPhraseCaption"],
  ["Captioning", "modelPhraseCaptioning"],
  ["Modify Video", "modelPhraseModifyVideo"],
  ["Flash", "modelPhraseFlash"],
  ["Reframe", "modelPhraseReframe"],
  ["Upscale", "optionUpscale"],
  ["Image", "image"],
  ["Video", "video"],
  ["Audio", "audio"],
  ["Text", "text"],
  ["I2V", "modelPhraseImageToVideoAbbrev"],
  ["T2V", "modelPhraseTextToVideoAbbrev"],
  ["Std", "modelPhraseStandardAbbrev"],
  ["Lite", "modelPhraseLite"],
  ["Ultra", "modelPhraseUltra"],
  ["Plus", "modelPhrasePlus"],
  ["Dev", "modelPhraseDev"],
  ["Flex", "modelPhraseFlex"],
  ["HD", "modelPhraseHd"],
  ["Animate", "modelPhraseAnimate"],
  ["Extend", "modelPhraseExtend"],
  ["Spicy", "modelPhraseSpicy"],
  ["Fast", "modelPhraseFast"],
  ["Standard", "modelPhraseStandard"],
  ["Turbo", "modelPhraseTurbo"],
  ["Pro", "modelPhrasePro"],
  ["Edit", "modelPhraseEdit"],
];

const getTranslation = (t, key, defaultValue) => {
  if (typeof t !== "function") return defaultValue;
  return t(key, { defaultValue });
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const localizeModelNamePhrases = (name, t) => {
  if (!name) return name;

  return MODEL_NAME_PHRASE_KEYS.reduce((localizedName, [phrase, key]) => {
    return localizedName.replace(
      new RegExp(escapeRegExp(phrase), "gi"),
      getTranslation(t, key, phrase)
    );
  }, name);
};

export const displayModelName = (model, t) => {
  const nameKey = model?.displayNameKey || MODEL_DISPLAY_NAME_KEYS[model?.id];
  if (nameKey) {
    return t(nameKey, { defaultValue: model?.name });
  }

  return localizeModelNamePhrases(model?.name, t);
};
