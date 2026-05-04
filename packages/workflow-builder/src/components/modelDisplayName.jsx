export const displayModelName = (model, t) => {
  const nameKeyById = {
    "text-passthrough": "inputText",
    "image-passthrough": "inputImage",
    "video-passthrough": "inputVideo",
    "audio-passthrough": "inputAudio",
    "prompt-concatenator": "promptConcatenator",
    "video-combiner": "videoCombiner",
  };

  const nameKey = nameKeyById[model?.id];
  if (nameKey) {
    return t(nameKey, { defaultValue: model?.name });
  }

  return model?.name;
};
