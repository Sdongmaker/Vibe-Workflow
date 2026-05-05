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
  image: "image",
  images: "images",
  image_url: "imageUrl",
  image_urls: "imageUrls",
  images_list: "images",
  video: "video",
  videos: "videos",
  video_url: "videoUrl",
  videos_list: "videos",
  video_files: "videoFiles",
  audio: "audio",
  audios: "audios",
  audio_url: "audioUrl",
  audios_list: "audios",
  audio_files: "audioFiles",
  prompt: "prompt",
  system_prompt: "system",
  last_image: "lastFrame",
  model_name: "modelName",
  model_type: "modelType",
  model_url: "modelUrl",
  model_id: "modelId",
  task_type: "taskType",
  air_model_id: "airModelId",
  api_key: "apiKey",
  uid: "userId",
  category: "category",
  subcategory: "subcategory",
};

const getHandleLabel = (t, handle, index) => {
  if (!handle) return "";
  const labelKey = HANDLE_LABEL_KEYS[handle];
  return labelKey ? t(labelKey) : t("sendHandleFallback", { index });
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
  const { t } = useTranslation("nodes");
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
                ? getHandleLabel(t, edge.targetHandle, targetIndexes[edge.target])
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
