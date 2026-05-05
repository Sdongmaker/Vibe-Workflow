import axios from "axios";
import Image from "next/image";
import React, { useLayoutEffect, useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { FiUpload } from "react-icons/fi";
import { toast } from "react-hot-toast";
import AudioPlayer from "./AudioPlayer";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import "../i18n";

const FIELD_LABEL_KEYS = {
  prompt: "prompt",
  prompt_text: "prompt",
  promptText: "prompt",
  text_prompt: "prompt",
  textPrompt: "prompt",
  input_text: "inputText",
  inputText: "inputText",
  system_prompt: "systemPrompt",
  systemPrompt: "systemPrompt",
  negative_prompt: "negativePrompt",
  negativePrompt: "negativePrompt",
  image: "image",
  input_image: "inputImage",
  inputImage: "inputImage",
  source_image: "sourceImage",
  sourceImage: "sourceImage",
  reference_image: "referenceImage",
  referenceImage: "referenceImage",
  reference_images: "referenceImages",
  referenceImages: "referenceImages",
  image_url: "imageUrl",
  imageUrl: "imageUrl",
  image_urls: "imageUrls",
  imageUrls: "imageUrls",
  images: "images",
  video_url: "videoUrl",
  input_video: "inputVideo",
  inputVideo: "inputVideo",
  source_video: "sourceVideo",
  sourceVideo: "sourceVideo",
  reference_video: "referenceVideo",
  referenceVideo: "referenceVideo",
  videoUrl: "videoUrl",
  videos: "videos",
  video_files: "videoFiles",
  videoFiles: "videoFiles",
  audio_url: "audioUrl",
  input_audio: "inputAudio",
  inputAudio: "inputAudio",
  source_audio: "sourceAudio",
  sourceAudio: "sourceAudio",
  audioUrl: "audioUrl",
  audios: "audios",
  audio_files: "audioFiles",
  audioFiles: "audioFiles",
  images_list: "images",
  imagesList: "images",
  videos_list: "videos",
  videosList: "videos",
  audios_list: "audios",
  audiosList: "audios",
  video: "video",
  audio: "audio",
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
  api_key: "apiKey",
  apiKey: "apiKey",
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

const FIELD_DESCRIPTION_KEYS = {
  prompt: "promptDesc",
  prompt_text: "promptDesc",
  promptText: "promptDesc",
  text_prompt: "promptDesc",
  textPrompt: "promptDesc",
  input_text: "inputTextDesc",
  inputText: "inputTextDesc",
  system_prompt: "systemPromptDesc",
  systemPrompt: "systemPromptDesc",
  negative_prompt: "negativePromptDesc",
  negativePrompt: "negativePromptDesc",
  image: "imageUrlDesc",
  input_image: "inputImageDesc",
  inputImage: "inputImageDesc",
  source_image: "sourceImageDesc",
  sourceImage: "sourceImageDesc",
  reference_image: "referenceImageDesc",
  referenceImage: "referenceImageDesc",
  reference_images: "referenceImagesDesc",
  referenceImages: "referenceImagesDesc",
  image_url: "imageUrlDesc",
  imageUrl: "imageUrlDesc",
  image_urls: "imageUrlsDesc",
  imageUrls: "imageUrlsDesc",
  images: "imagesListDesc",
  video_url: "videoUrlDesc",
  input_video: "inputVideoDesc",
  inputVideo: "inputVideoDesc",
  source_video: "sourceVideoDesc",
  sourceVideo: "sourceVideoDesc",
  reference_video: "referenceVideoDesc",
  referenceVideo: "referenceVideoDesc",
  videoUrl: "videoUrlDesc",
  videos: "videoClipsDesc",
  video_files: "videoFilesDesc",
  videoFiles: "videoFilesDesc",
  audio_url: "audioUrlDesc",
  input_audio: "inputAudioDesc",
  inputAudio: "inputAudioDesc",
  source_audio: "sourceAudioDesc",
  sourceAudio: "sourceAudioDesc",
  audioUrl: "audioUrlDesc",
  audios: "audiosListDesc",
  audio_files: "audioFilesDesc",
  audioFiles: "audioFilesDesc",
  images_list: "imagesListDesc",
  imagesList: "imagesListDesc",
  videos_list: "videoClipsDesc",
  videosList: "videoClipsDesc",
  audios_list: "audiosListDesc",
  audiosList: "audiosListDesc",
  aspect_ratio: "aspectRatioDesc",
  last_image: "lastFrameDesc",
  lastImage: "lastFrameDesc",
  first_frame: "firstFrameDesc",
  firstFrame: "firstFrameDesc",
  first_image: "firstFrameDesc",
  firstImage: "firstFrameDesc",
  start_image: "firstFrameDesc",
  startImage: "firstFrameDesc",
  end_image: "lastFrameDesc",
  endImage: "lastFrameDesc",
  aspectRatio: "aspectRatioDesc",
  api_key: "apiKeyDesc",
  apiKey: "apiKeyDesc",
  model_name: "modelNameDesc",
  modelName: "modelNameDesc",
  model_type: "modelTypeDesc",
  modelType: "modelTypeDesc",
  model_url: "modelUrlDesc",
  modelUrl: "modelUrlDesc",
  model_id: "modelIdDesc",
  modelId: "modelIdDesc",
  task_type: "taskTypeDesc",
  taskType: "taskTypeDesc",
  air_model_id: "airModelIdDesc",
  airModelId: "airModelIdDesc",
  uid: "userIdDesc",
  user_id: "userIdDesc",
  userId: "userIdDesc",
  category: "categoryDesc",
  model_category: "categoryDesc",
  modelCategory: "categoryDesc",
  subcategory: "subcategoryDesc",
  model_identifier: "modelIdentifierDesc",
  modelIdentifier: "modelIdentifierDesc",
  seed: "seedDesc",
  width: "widthDesc",
  height: "heightDesc",
  duration: "durationDesc",
  resolution: "resolutionDesc",
  quality: "qualityDesc",
  style: "styleDesc",
};

const OPTION_LABEL_KEYS = {
  auto: "optionAuto",
  none: "optionNone",
  default: "optionDefault",
  chat: "optionChat",
  image: "image",
  video: "video",
  audio: "audio",
  imageInference: "optionImageInference",
  textToVideo: "optionTextToVideo",
  imageToVideo: "optionImageToVideo",
  upscale: "optionUpscale",
  removeBackground: "optionRemoveBackground",
  high: "optionHigh",
  medium: "optionMedium",
  low: "optionLow",
  portrait: "optionPortrait",
  landscape: "optionLandscape",
  square: "optionSquare",
  fast: "modelPhraseFast",
  standard: "modelPhraseStandard",
  turbo: "modelPhraseTurbo",
  pro: "modelPhrasePro",
  edit: "modelPhraseEdit",
  lite: "modelPhraseLite",
  ultra: "modelPhraseUltra",
  plus: "modelPhrasePlus",
  dev: "modelPhraseDev",
  flex: "modelPhraseFlex",
  hd: "modelPhraseHd",
  animate: "modelPhraseAnimate",
  extend: "modelPhraseExtend",
  spicy: "modelPhraseSpicy",
  imageToImage: "modelPhraseImageToImage",
  textToImage: "modelPhraseTextToImage",
  imageToVideo: "modelPhraseImageToVideo",
  textToVideo: "modelPhraseTextToVideo",
  startEnd: "modelPhraseStartEnd",
  motionControl: "modelPhraseMotionControl",
  videoExtend: "modelPhraseVideoExtend",
  referenceImage: "modelPhraseReferenceImage",
  omniReference: "modelPhraseOmniReference",
  styleReference: "modelPhraseStyleReference",
  createMusic: "modelPhraseCreateMusic",
  extendMusic: "modelPhraseExtendMusic",
  remixMusic: "modelPhraseRemixMusic",
  voiceClone: "modelPhraseVoiceClone",
  speech: "modelPhraseSpeech",
  reference: "modelPhraseReference",
  modifyVideo: "modelPhraseModifyVideo",
  reframe: "modelPhraseReframe",
};

const toCamelCaseKey = (value) => {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";
  if (/^[a-z][A-Za-z0-9]*$/.test(rawValue)) return rawValue;

  return rawValue
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      const normalized = word.toLowerCase();
      return index === 0
        ? normalized
        : normalized.charAt(0).toUpperCase() + normalized.slice(1);
    })
    .join("");
};

const resolveTranslationKey = (map, ...candidates) => {
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (map[candidate]) return map[candidate];
    const camelKey = toCamelCaseKey(candidate);
    if (map[camelKey]) return map[camelKey];
  }
  return null;
};

const toReadableFieldName = (fieldName) => (
  String(fieldName || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
);

const isTechnicalToken = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return false;
  return (
    /^https?:\/\//i.test(text) ||
    /^[\w.+-]+\/[\w.+-]+$/.test(text) ||
    /^[\w.-]+:[\w.-]+$/.test(text) ||
    /\d/.test(text) ||
    /^[a-z0-9_.:/-]+$/.test(text)
  );
};

const RenderField = ({ fieldName, meta, idx, formValues, setFormValues, handleChange, data, modelName }) => {
  const { t, i18n } = useTranslation("nodes");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dropDown, setDropDown] = useState(-1);
  const [uploading, setUploading] = useState(false);
  const [isOpeningUp, setIsOpeningUp] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const buttonRef = useRef(null);

  const isImageField = ['image', 'images_list'].includes(meta.field);
  const isVideoField = meta.field === 'video';
  const isAudioField = meta.field === 'audio';
  const value = formValues[fieldName] ?? meta.default ?? "";
  const isRequired = data.required && data.required.includes(fieldName);
  const isZh = i18n.language?.startsWith("zh");
  const fallbackFieldName = isZh
    ? ""
    : toReadableFieldName(fieldName);
  const translateDisplay = (key, fallback) => t(key, { defaultValue: fallback });
  const getOptionValue = (option) => (
    typeof option === "object" && option !== null
      ? option.value ?? option.label
      : option
  );
  const getOptionLabel = (option) => (
    typeof option === "object" && option !== null
      ? option.label ?? option.value
      : option
  );
  const translateFieldLabel = () => {
    const labelKey = resolveTranslationKey(
      FIELD_LABEL_KEYS,
      fieldName,
      meta.field,
      meta.name,
      meta.title
    );
    return labelKey
      ? translateDisplay(labelKey, isZh ? fallbackFieldName : (meta.title || meta.name || fallbackFieldName))
      : (isZh ? t("fieldLabelFallbackShort") : t("fieldLabelFallback", { field: fallbackFieldName }));
  };
  const translateFieldDescription = () => {
    const descriptionKey = resolveTranslationKey(
      FIELD_DESCRIPTION_KEYS,
      fieldName,
      meta.field,
      meta.name,
      meta.title
    );
    return descriptionKey
      ? translateDisplay(descriptionKey, isZh ? "" : (meta.description || ""))
      : "";
  };
  const translateOptionLabel = (option, optionIndex = -1) => {
    const optionValue = getOptionValue(option);
    const optionLabel = getOptionLabel(option);
    const optionKey = resolveTranslationKey(
      OPTION_LABEL_KEYS,
      optionValue,
      optionLabel
    );
    if (optionKey) {
      return translateDisplay(optionKey, optionLabel ?? optionValue ?? "");
    }

    const fallback = optionLabel ?? optionValue ?? "";
    if (isZh && !isTechnicalToken(fallback)) {
      return optionIndex >= 0
        ? t("optionFallback", { index: optionIndex + 1 })
        : t("optionFallbackShort");
    }

    return String(fallback);
  };
  const fieldLabel = translateFieldLabel();
  const fieldDescription = translateFieldDescription();
  const fieldPlaceholder = isZh
    ? t("fieldPlaceholderFallbackShort")
    : t("fieldPlaceholderFallback", { field: fieldLabel });
  const label = (
    <label className="text-[10px] font-bold text-zinc-500 text-start px-1 mb-1">
      {fieldLabel}
      {isRequired && <span className="text-blue-500 text-[9px] ml-1">{t("required")}</span>}
    </label>
  );

  const handleDropdownToggle = (value) => {
    setDropDown((prev) => (prev === value ? -1 : value));
  };

  useLayoutEffect(() => {
    if (dropDown === idx + 1 && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      setIsOpeningUp(spaceBelow < 200);
    }
  }, [dropDown, idx]);

  const handleFileUpload = (field, fieldSchema, e) => {
    let file = null;

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      file = e.dataTransfer.files[0];
    } else if (e.target.files && e.target.files.length > 0) {
      file = e.target.files[0];
    } else {
      return;
    }
    const acceptedTypes = 
      isImageField ? ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"] : 
      isVideoField ? ["video/mp4", "video/webm"] : 
      isAudioField ? ["audio/mpeg", "audio/wav", "audio/webm", "audio/mp3"] :
        ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "video/mp4", "video/webm"];

    if (!acceptedTypes.includes(file.type)) {
      toast.error(t("unsupportedFileType"));
      return;
    };

    setUploading(true);
    axios.get("/api/app/get_file_upload_url", {
      params: { filename: file.name }
    })
    .then((response) => {
      const { url, fields } = response.data;

      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", file);
      axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      })
      .then(() => {
        const uploadedUrl = `https://cdn.muapi.ai/${fields.key}`;
        setFormValues((prev) => { 
          const current = prev[field];
          const updatedValue = fieldSchema.type === 'array'
            ? [...(current || []), uploadedUrl]
            : uploadedUrl

            return { ...prev, [field]: updatedValue };
        });
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
        }, 500);
      })
    })
    .catch((error) => {
      console.error(t("toastUploadFailed"), error);
      toast.error(t("toastUploadFailed"));
      setUploading(false);
      setUploadProgress(0);
    })
  };

  const isInputModel = modelName.includes("passthrough");
  if (isInputModel && meta.type !== "boolean") return null;

  if (meta.enum) {
    const currentOption = meta.enum.find((option) => getOptionValue(option) === getOptionValue(value));
    const currentOptionIndex = meta.enum.findIndex((option) => getOptionValue(option) === getOptionValue(value));
    return (
      <div key={fieldName} className="flex flex-col gap-1 w-full">
        {label}
        <div
          tabIndex={0}
          onBlur={(e) => {
            const currentTarget = e.currentTarget;
            setTimeout(() => {
              if (
                currentTarget &&
                !currentTarget.contains(document.activeElement)
              ) {
                setDropDown(-1);
              }
            }, 100);
          }}
          className="flex flex-col gap-1 relative w-full"
        >
            <button
              type="button"
              suppressHydrationWarning={true}
              ref={buttonRef}
              onClick={() => handleDropdownToggle(idx + 1)}
              title={t("toggleOptions")}
              aria-label={t("toggleOptions")}
              className="flex items-center justify-between gap-1 text-xs text-center text-white w-full h-full cursor-pointer whitespace-nowrap px-3 py-1.5 bg-zinc-900/50 border border-white/10 hover:border-white/20 focus:outline-none rounded-lg transition-all"
            >
            <div className="flex items-center gap-2 truncate">
              <span className="truncate">{translateOptionLabel(currentOption ?? value, currentOptionIndex)}</span>
            </div>
            <FaAngleDown
              size={14}
              className={`transition-all duration-300 ease-in-out text-zinc-400 group-hover:text-white ${
                dropDown === idx + 1 ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            tabIndex={-1}
            style={dropdownStyle}
            className={`absolute left-0 ${isOpeningUp ? "bottom-full mb-2" : "top-full mt-2"} border border-white/10 p-1 rounded-xl flex flex-col overflow-y-auto bg-zinc-900/95 backdrop-blur-3xl shadow-2xl transition-all duration-200 w-full z-50 max-h-60 custom-scrollbar-thin ${
              dropDown === idx + 1
                ? "opacity-100 scale-100 visible translate-y-0"
                : `opacity-0 scale-95 invisible ${isOpeningUp ? "translate-y-2" : "-translate-y-2"}`
            }`}
          >
            {meta.enum.map((option, i) => (
              <button
                type="button"
                suppressHydrationWarning={true}
                key={i}
                className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer rounded-lg transition-all ${
                  formValues[fieldName] === getOptionValue(option)
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
                onClick={() => {handleChange(fieldName, getOptionValue(option)); setDropDown(-1)}}
              >
                <span className="truncate">{translateOptionLabel(option, i)}</span>
                {formValues[fieldName] === getOptionValue(option) && (
                  <span className="ml-auto text-blue-400 font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (['image', 'video', 'audio'].includes(meta.field)) {
    return (
      <div key={fieldName} className="flex flex-col gap-2">
        {label}
        <div className="flex items-center gap-1">
          <input 
            type="text" 
            value={formValues[fieldName] || ''} 
            readOnly
            // onChange={(e) => handleChange(fieldName, e.target.value)} 
            className="bg-zinc-900/50 text-white text-xs py-2 px-3 rounded-lg border border-white/10 transition-all hover:border-white/20 w-full outline-none focus:border-blue-500/50" 
            placeholder={t("addFileOrUrl")} 
          />
          {/* <input 
            type="file" 
            accept={
              isImageField ? "image/*" : 
              isVideoField ? "video/*" : 
              isAudioField ? "audio/*": 
              "image/*,video/*,audio/*"
            }
            id={`file-upload-${fieldName}`} 
            className="hidden" 
            disabled={uploading}
            onChange={(e) => handleFileUpload(fieldName, meta, e)} 
          />
          <label 
            htmlFor={`file-upload-${fieldName}`} 
            className={`flex items-center justify-center gap-1 bg-blue-500 text-white hover:bg-blue-600 text-xs font-medium cursor-pointer flex-shrink-0 ${
              uploading ? 'rounded-full h-6 w-6': 'rounded py-1 px-3'}
            `}
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <IoCloudUploadOutline size={16} />
            )}
          </label> */}
        </div>
        {uploading && (
          <div className="w-full bg-gray-700/70 rounded h-1 overflow-hidden">
            <div className="bg-blue-500 h-full" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}
        {formValues[fieldName] && (
          <div className="flex items-center gap-2 relative group overflow-hidden self-start w-full">
            {meta.field === 'image' ? (
              <img src={formValues[fieldName]} alt={t("preview")} className="w-24 h-24 object-cover border border-white/10 rounded-xl shadow-lg" width={0} height={0} />
            ) : meta.field === 'video' ? (
              <video src={formValues[fieldName]} className="w-24 h-24 object-cover border border-white/10 rounded-xl shadow-lg" />
            ) : meta.field === 'audio' && (
              <div className="flex flex-col w-full h-20 border border-white/10 rounded-xl overflow-hidden shadow-lg">
                <AudioPlayer src={formValues[fieldName]} />
              </div>
            )}
            <button 
              type="button" 
              suppressHydrationWarning={true}
              onClick={() => handleChange(fieldName, '')} 
              aria-label={t("removeInput")}
              title={t("removeInput")}
              className="text-gray-500 group-hover:text-red-600 group-hover:font-black cursor-pointer absolute top-2 left-2"
            >
              &#10005;
            </button>
          </div>
        )}
      </div>
    );
  };

  if (meta.type === "array" || fieldName === "images_list") {
    const imageList = formValues[fieldName] || [];
    return (
      <div key={fieldName} className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          {label}
          <span className="text-[10px] text-gray-500">{imageList.length}/{meta.maxItems}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {imageList.map((url, idx) => (
            <div key={idx} className={`flex items-center gap-2 relative group overflow-hidden ${['audios_list', 'audio_files'].includes(meta.field) ? 'col-span-full' : ''}`}>
              {meta.field === 'images_list' ? (
                <img 
                  src={url} 
                  alt={t("preview")} 
                  className="w-full h-full aspect-[1/1] object-cover border border-gray-500 rounded" 
                />
              ) : ['videos_list', 'video_files'].includes(meta.field) ? (
                <video 
                  src={url} 
                  className="w-full h-full aspect-[1/1] object-cover border border-gray-500 rounded" 
                />
              ) : ['audios_list', 'audio_files'].includes(meta.field) && (
                <div className="flex flex-col w-full h-20 border border-white/10 rounded-xl overflow-hidden shadow-lg">
                  <AudioPlayer src={url} />
                </div>
              )}
              <div className="inset-0 group-hover:bg-gray-600/40 absolute rounded">
                  <button
                    type="button"
                    suppressHydrationWarning={true}
                    onClick={() => {
                      const updated = [...imageList];
                      updated.splice(idx, 1);
                      handleChange(fieldName, updated);
                    }}
                    aria-label={t("removeInput")}
                    title={t("removeInput")}
                    className="text-gray-500 group-hover:text-red-600 hover:font-bold cursor-pointer absolute top-2 left-2"
                  >
                  &#10005;
                </button>
              </div>
            </div>
          ))}
          {/* {imageList.length < (meta.maxItems) && (
            <div>
              <input
                type="file"
                id={`file-upload-${fieldName}`} 
                accept={isImageField ? "image/*" : isVideoField ? "video/*" : "image/*,video/*"}
                multiple
                onChange={(e) => handleFileUpload(fieldName, meta, e)}
                className="hidden"
              />
              <label
                htmlFor={`file-upload-${fieldName}`} 
                className="w-full h-full aspect-[1/1] flex items-center justify-center border border-dashed border-gray-400 text-gray-500 hover:text-white text-xl rounded cursor-pointer hover:bg-gray-800/50"
              >
                {uploading ? (
                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <FiUpload size={25} />
                )}
              </label>
            </div>
          )} */}
        </div>
      </div>
    );
  };

  if (meta.minValue !== undefined && meta.maxValue !== undefined) {
    return (
      <div key={fieldName} className="flex flex-col w-full">
        {label}
        <div className="flex items-center gap-2 w-full">
          <input
            type="range"
            id={fieldName}
            min={meta.minValue}
            max={meta.maxValue}
            step={meta.step}
            value={formValues[fieldName] ?? meta.default ?? 0}
            onChange={(e) => handleChange(fieldName, parseFloat(e.target.value))}
            className="h-1.5 rounded-full cursor-pointer accent-blue-600 outline-none w-full bg-zinc-800"
          />
          <input 
            type="number" 
            id={fieldName} 
            min={meta.minValue} 
            max={meta.maxValue} 
            step={meta.step}
            value={formValues[fieldName] ?? meta.default ?? 0} 
            readOnly
            // onChange={(e) => {
            //   const val = parseFloat(e.target.value) || meta.minValue;
            //   const clamped = Math.max(meta.minValue, Math.min(val, meta.maxValue));
            //   handleChange(fieldName, clamped);
            // }} 
            placeholder={t("inputValue")}
            className="w-12 h-8 text-center text-white rounded-lg border border-white/10 text-[10px] font-bold bg-zinc-900/50 outline-none focus:border-blue-500/50 transition-all" 
          />
        </div>
      </div>
    );
  };

  if (meta.type === "int") {
    const min = meta.minValue ?? 0;
    const max = meta.maxValue ?? Number.MAX_SAFE_INTEGER;

    return (
      <div key={fieldName} className="flex flex-col gap-1 w-full">
        <label htmlFor={fieldName} className="flex items-center gap-2 text-sm text-white font-medium relative">
          {label}
          {isRequired && <span className="text-blue-500 text-xs">{t("required")}</span>}
        </label>
        <div className="flex items-center gap-2 w-full">
          <input 
            type="number" 
            id={fieldName} 
            min={min}
            max={max}
            step={meta.step ?? 1}
            value={formValues[fieldName] ?? ""} 
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                handleChange(fieldName, "");
                return;
              }
              let num = Number(value);
              if (Number.isNaN(num)) return;
              num = Math.max(min, Math.min(num, max));
              handleChange(fieldName, num);
            }} 
            placeholder={t("inputValue")}
            className="w-full rounded-lg border border-white/10 px-3 py-2 text-white text-xs bg-zinc-900/50 hover:border-white/20 focus:border-blue-500/50 outline-none transition-all" 
          />
        </div>
      </div>
    );
  };

  // if (meta.type === "int" || meta.type === "number") {
  //   return (
  //     <div key={fieldName} className="flex flex-col gap-1">
  //       {label}
  //       <input
  //         type="number"
  //         value={value}
  //         onChange={(e) => handleChange(fieldName, parseFloat(e.target.value))}
  //         placeholder={meta.description || ""}
  //         className="bg-[#1f2125] text-white text-xs p-1 rounded border border-gray-600 outline-none"
  //       />
  //     </div>
  //   );
  // };

  if (meta.format === 'text') {
    return (
      <div key={fieldName} className="flex flex-col gap-2 w-full">
        <label htmlFor={fieldName} className="flex items-center gap-2 text-sm font-medium relative">
          {label}
        </label>
        <input
          type="text"
          id={fieldName}
          value={value}
          placeholder={fieldDescription || t("inputValue")}
          onChange={(e) => handleChange(fieldName, e.target.value)}
          className="bg-zinc-900/50 text-white text-xs py-2 px-3 rounded-lg border border-white/10 hover:border-white/20 transition-all w-full outline-none focus:border-blue-500/50"
        />
      </div>
    );
  };

  if (meta.type === "boolean") {
    return (
      <div key={fieldName} className="flex flex-col gap-2">
        {label}
        <div className="flex items-center gap-2">
          <label htmlFor={`instrumental-${fieldName}`} className="flex items-center justify-between cursor-pointer select-none relative shrink-0">
            <input
              type="checkbox"
              id={`instrumental-${fieldName}`}
              className="sr-only peer"
              checked={!!formValues[fieldName]}
              onChange={(e) => handleChange(fieldName, e.target.checked)}
            />
            <span className={`flex items-center h-[20px] w-[36px] rounded-full p-1 duration-200 transition-all ${!!formValues[fieldName] ? "bg-blue-600 shadow-lg shadow-blue-900/40" : "bg-zinc-800 border border-white/10"}`}>
              <span className={`h-[12px] w-[12px] rounded-full bg-white duration-200 shadow-sm ${!!formValues[fieldName] && "translate-x-[16px]"}`}></span>
            </span>
          </label>
          {fieldDescription && <p className="text-xs text-white">{fieldDescription}</p>}
        </div>
      </div>
    )
  };

  if (meta.type === "string") {
    return (
      <div key={fieldName} className="flex flex-col items-start gap-1">
        {label}
        <textarea
          value={value}
          readOnly
          // onChange={(e) => handleChange(fieldName, e.target.value)}
          placeholder={fieldDescription || fieldPlaceholder}
          className="bg-zinc-900/50 text-white text-xs py-2 px-3 rounded-lg border border-white/10 hover:border-white/20 transition-all w-full outline-none focus:border-blue-500/50"
          rows={6}
        />
      </div>
    );
  };
};

export default RenderField;
