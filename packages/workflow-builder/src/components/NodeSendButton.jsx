import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "../i18n";

const HANDLE_LABEL_KEYS = {
  textInput: "prompt",
  textInput2: "imageUrl",
  textInput3: "images",
  textInput4: "system",
  imageInput: "prompt",
  imageInput2: "images",
  imageInput3: "imageUrl",
  videoInput: "prompt",
  videoInput2: "imageUrl",
  videoInput3: "lastFrame",
  videoInput4: "videoUrl",
  videoInput5: "audioUrl",
  videoInput6: "images",
  videoInput7: "videos",
  videoInput8: "audios",
  audioInput: "audioUrl",
  audioInput2: "prompt",
  audioInput3: "imageUrl",
  audioInput4: "videoUrl",
  apiInput: "prompt",
  apiInput2: "images",
  apiInput3: "image",
  concatInput: "prompt",
  prompt_text: "prompt",
  promptText: "prompt",
  text_prompt: "prompt",
  textPrompt: "prompt",
  input_text: "inputText",
  inputText: "inputText",
  image: "image",
  input_image: "inputImage",
  inputImage: "inputImage",
  source_image: "sourceImage",
  sourceImage: "sourceImage",
  reference_image: "referenceImage",
  referenceImage: "referenceImage",
  reference_images: "referenceImages",
  referenceImages: "referenceImages",
  images: "images",
  image_url: "imageUrl",
  imageUrl: "imageUrl",
  image_urls: "imageUrls",
  imageUrls: "imageUrls",
  images_list: "images",
  imagesList: "images",
  video: "video",
  input_video: "inputVideo",
  inputVideo: "inputVideo",
  source_video: "sourceVideo",
  sourceVideo: "sourceVideo",
  reference_video: "referenceVideo",
  referenceVideo: "referenceVideo",
  videos: "videos",
  video_url: "videoUrl",
  videoUrl: "videoUrl",
  videos_list: "videos",
  videosList: "videos",
  video_files: "videoFiles",
  videoFiles: "videoFiles",
  audio: "audio",
  input_audio: "inputAudio",
  inputAudio: "inputAudio",
  source_audio: "sourceAudio",
  sourceAudio: "sourceAudio",
  audios: "audios",
  audio_url: "audioUrl",
  audioUrl: "audioUrl",
  audios_list: "audios",
  audiosList: "audios",
  audio_files: "audioFiles",
  audioFiles: "audioFiles",
  prompt: "prompt",
  system_prompt: "system",
  systemPrompt: "system",
  negative_prompt: "negativePrompt",
  negativePrompt: "negativePrompt",
  last_image: "lastFrame",
  lastImage: "lastFrame",
  first_frame: "firstFrame",
  firstFrame: "firstFrame",
  first_image: "firstFrame",
  firstImage: "firstFrame",
  start_image: "firstFrame",
  startImage: "firstFrame",
  end_image: "lastFrame",
  endImage: "lastFrame",
  aspect_ratio: "aspectRatio",
  aspectRatio: "aspectRatio",
  model_name: "modelName",
  modelName: "modelName",
  model_type: "modelType",
  modelType: "modelType",
  model_url: "modelUrl",
  modelUrl: "modelUrl",
  model_id: "modelId",
  modelId: "modelId",
  task_type: "taskType",
  taskType: "taskType",
  air_model_id: "airModelId",
  airModelId: "airModelId",
  api_key: "apiKey",
  apiKey: "apiKey",
  uid: "userId",
  user_id: "userId",
  userId: "userId",
  category: "category",
  model_category: "category",
  modelCategory: "category",
  subcategory: "subcategory",
  model_identifier: "modelIdentifier",
  modelIdentifier: "modelIdentifier",
  seed: "seed",
  width: "width",
  height: "height",
  duration: "duration",
  resolution: "resolution",
  quality: "quality",
  style: "style",
};

const toReadableHandleName = (handle) => (
  String(handle || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
);

const getHandleLabel = (t, handle, index, language = "") => {
  if (!handle) return "";
  const labelKey = HANDLE_LABEL_KEYS[handle];
  if (labelKey) return t(labelKey);
  if (language.toLowerCase().startsWith("zh")) {
    return t("sendHandleFallback", { index });
  }
  return t("fieldLabelFallback", { field: toReadableHandleName(handle), defaultValue: t("sendHandleFallback", { index }) });
};

const getNodeLabel = (t, nodeId) => {
  if (!nodeId) return "";
  const number = nodeId.match(/\d+$/)?.[0];
  const prefix = nodeId.replace(/\d+$/, "");
  const typeKeyMap = {
    text: "nodeTypeText",
    image: "nodeTypeImage",
    video: "nodeTypeVideo",
    audio: "nodeTypeAudio",
    concat: "nodeTypeConcat",
    vidConcat: "nodeTypeVideoCombiner",
    api: "nodeTypeApi",
  };
  const label = t(typeKeyMap[prefix] || "nodeTypeNode");
  return number ? `${label} ${number}` : label;
};

const NodeSendButton = ({ id, data, outputHistory, currentHistoryIndex, currentOutputIndex = 0 }) => {
  const [showMenu, setShowMenu] = useState(false);
  const connectedEdges = data.connectedEdges || [];
  const { t, i18n } = useTranslation("nodes");
  const activeLanguage = i18n.resolvedLanguage || i18n.language || "";
  if (connectedEdges.length === 0) return null;

  const handleSend = (targetId) => {
    const latest = outputHistory[currentHistoryIndex];
    const outputs = latest?.result?.outputs;
    if (outputs) {
      const specificOutput = outputs[currentOutputIndex]?.value || outputs[0]?.value;
      data.onDataChange(id, { outputs, resultUrl: specificOutput }, targetId);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        suppressHydrationWarning={true}
        onClick={(e) => {
          e.stopPropagation();
          if (connectedEdges.length === 1) {
            handleSend(connectedEdges[0].target);
          } else {
            setShowMenu(!showMenu);
          }
        }}
        className={`group/btn relative flex items-center justify-center w-5 h-5 rounded-full transition-all duration-300 bg-blue-600 hover:bg-blue-500 text-white shadow-lg`}
        title={t("sendToConnectedNode")}
        aria-label={t("sendToConnectedNode")}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-current" />
      </button>

      {showMenu && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1a1b1e] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 min-w-max">
          {(() => {
            const targetCounts = connectedEdges.reduce((acc, edge) => {
              acc[edge.target] = (acc[edge.target] || 0) + 1;
              return acc;
            }, {});

            const targetIndexes = {};

            return connectedEdges.map((edge) => {
              targetIndexes[edge.target] = (targetIndexes[edge.target] || 0) + 1;
              const handleLabel = targetCounts[edge.target] > 1
                ? getHandleLabel(t, edge.targetHandle, targetIndexes[edge.target], activeLanguage)
                : "";
              const sendLabel = t("sendToNode", { node: getNodeLabel(t, edge.target), handle: handleLabel ? ` (${handleLabel})` : "" });

              return (
                <button
                  type="button"
                  suppressHydrationWarning={true}
                  key={edge.id}
                  title={sendLabel}
                  aria-label={sendLabel}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors truncate capitalize cursor-pointer block"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSend(edge.target);
                    setShowMenu(false);
                  }}
                >
                  {sendLabel}
                </button>
              );
            });
          })()}
        </div>
      )}

      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }} 
        />
      )}
    </div>
  );
};

export default NodeSendButton;
