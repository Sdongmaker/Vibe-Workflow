import React, { useLayoutEffect, useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { FiUpload } from "react-icons/fi";
import { toast } from "react-hot-toast";
import AudioPlayer from "./AudioPlayer";
import { IoCloudUploadOutline } from "react-icons/io5";
import { Handle, Position } from "reactflow";
import { TbBoxModel2, TbExternalLink } from "react-icons/tb";
import { useTranslation } from "react-i18next";
import { uploadFile } from "./uploadFile";
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
  images_list: "images",
  imagesList: "images",
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
  video: "video",
  video_url: "videoUrl",
  input_video: "inputVideo",
  inputVideo: "inputVideo",
  source_video: "sourceVideo",
  sourceVideo: "sourceVideo",
  reference_video: "referenceVideo",
  referenceVideo: "referenceVideo",
  videoUrl: "videoUrl",
  videos: "videos",
  videos_list: "videos",
  videosList: "videos",
  video_files: "videoFiles",
  videoFiles: "videoFiles",
  audio: "audio",
  audio_url: "audioUrl",
  input_audio: "inputAudio",
  inputAudio: "inputAudio",
  source_audio: "sourceAudio",
  sourceAudio: "sourceAudio",
  audioUrl: "audioUrl",
  audios: "audios",
  audios_list: "audios",
  audiosList: "audios",
  audio_files: "audioFiles",
  audioFiles: "audioFiles",
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
  images_list: "imagesListDesc",
  imagesList: "imagesListDesc",
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
  video: "videoUrlDesc",
  video_url: "videoUrlDesc",
  input_video: "inputVideoDesc",
  inputVideo: "inputVideoDesc",
  source_video: "sourceVideoDesc",
  sourceVideo: "sourceVideoDesc",
  reference_video: "referenceVideoDesc",
  referenceVideo: "referenceVideoDesc",
  videoUrl: "videoUrlDesc",
  videos: "videoClipsDesc",
  videos_list: "videoClipsDesc",
  videosList: "videoClipsDesc",
  video_files: "videoFilesDesc",
  videoFiles: "videoFilesDesc",
  audio: "audioUrlDesc",
  audio_url: "audioUrlDesc",
  input_audio: "inputAudioDesc",
  inputAudio: "inputAudioDesc",
  source_audio: "sourceAudioDesc",
  sourceAudio: "sourceAudioDesc",
  audioUrl: "audioUrlDesc",
  audios: "audiosListDesc",
  audios_list: "audiosListDesc",
  audiosList: "audiosListDesc",
  audio_files: "audioFilesDesc",
  audioFiles: "audioFilesDesc",
  aspect_ratio: "aspectRatioDesc",
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

const RenderApiField = ({ fieldName, meta, idx, formValues, setFormValues, handleChange, hasHandle = false, exposedHandles = [], onToggleHandle }) => {
  const { t, i18n } = useTranslation("nodes");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dropDown, setDropDown] = useState(-1);
  const [uploading, setUploading] = useState(false);
  const [isOpeningUp, setIsOpeningUp] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const containerRef = useRef(null);

  const isImageUrl = (url) => {
    if (typeof url !== 'string') return false;
    return url.match(/\.(jpeg|jpg|gif|png|webp|avif|HEIC)(\?.*)?$/i) !== null || url.startsWith('/media/');
  };

  const isImageField = ['image', 'last_image', 'image_url'].includes(meta.field) || 
                       ['image', 'last_image', 'image_url'].includes(fieldName);
  const isImagesListField = ['images', 'image_urls', 'images_list'].includes(fieldName) || meta.field === 'images_list';
  const isVideoField = ['video', 'video_url'].includes(meta.field) || ['video', 'video_url'].includes(fieldName);
  const isAudioField = ['audio', 'audio_url'].includes(meta.field) || ['audio', 'audio_url'].includes(fieldName);
  const value = formValues[fieldName] ?? meta.default ?? "";
  const isRequired = meta.required || false;
  const isZh = i18n.language?.startsWith("zh");
  const fallbackFieldName = isZh
    ? ""
    : toReadableFieldName(fieldName);
  const translateDisplay = (key, fallback) => t(key, { defaultValue: fallback });
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
  const handleToggleTitle = exposedHandles.includes(fieldName) ? t("removeInput") : t("setAsInput");
  const label = (
    <div className="flex items-center justify-between w-full group/label">
      <label htmlFor={fieldName} className="text-xs font-bold text-zinc-500 text-start flex-grow cursor-pointer">
        {fieldLabel}
        {isRequired && <span className="text-blue-500 text-[9px] ml-1">{t("required")}</span>}
      </label>
      {onToggleHandle && (
        <button
          type="button"
          suppressHydrationWarning={true}
          onClick={(e) => { e.stopPropagation(); onToggleHandle(fieldName); }}
          className={`p-1 rounded-lg transition-all group-hover/label:opacity-100 h-6 w-6 flex items-center justify-center ${exposedHandles.includes(fieldName) ? "text-blue-500 bg-blue-500/10 opacity-100" : "text-zinc-500 hover:text-white hover:bg-white/5 opacity-0"}`}
          title={handleToggleTitle}
          aria-label={handleToggleTitle}
        >
          <TbExternalLink size={14} />
        </button>
      )}
    </div>
  );

  useLayoutEffect(() => {
    if (dropDown === idx + 1 && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
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
    uploadFile(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      })
    .then((uploadedUrl) => {
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
    .catch((error) => {
      console.error(t("toastUploadFailed"), error);
      toast.error(isZh ? t("toastUploadFailed") : (error?.response?.data?.detail || t("toastUploadFailed")));
      setUploading(false);
      setUploadProgress(0);
    })
  };

  const handleStyle = {
    width: 10,
    height: 10,
    transition: 'all 0.2s ease-in-out',
    background: '#3b82f6',
    border: '2px solid #fff',
    zIndex: 10,
    boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
  };

  if (meta.enum) {
    const isManual = meta.allowManual || false;
    const enumOptions = meta.enum || [];
    const filteredOptions = isManual && value 
      ? enumOptions.filter(opt => `${getOptionLabel(opt)} ${getOptionValue(opt)}`.toLowerCase().includes((value || "").toString().toLowerCase()))
      : enumOptions;
    const selectedOption = enumOptions.find((option) => getOptionValue(option) === getOptionValue(value));

    return (
      <div key={fieldName} className="flex flex-col gap-1 w-full relative">
        {hasHandle && (
          <Handle 
            type="target" 
            position={Position.Left} 
            id={fieldName} 
            style={{ ...handleStyle, top: '50%', transform: 'translateY(-50%)' }} 
            className="!rounded-full input-handle !left-[-17px]" 
          />
        )}
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
          <div 
            ref={containerRef}
            className="flex items-center gap-1 border border-white/10 rounded-lg bg-zinc-900/50 hover:border-white/20 transition-all relative overflow-hidden"
          >
            {isManual ? (
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(fieldName, e.target.value)}
                onFocus={() => setDropDown(idx + 1)}
                placeholder={t("selectOrType")}
                className="flex-grow text-xs text-white bg-transparent outline-none px-2 py-[5px] w-full"
              />
            ) : (
              <button
                type="button"
                suppressHydrationWarning={true}
                onClick={() => setDropDown((prev) => (prev === idx + 1 ? -1 : idx + 1))}
                className="flex items-center justify-between gap-1 text-xs text-center text-white w-full h-full cursor-pointer whitespace-nowrap px-3 py-1.5 focus:outline-none"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate">
                    {translateOptionLabel(selectedOption ?? value, enumOptions.indexOf(selectedOption))}
                  </span>
                </div>
              </button>
            )}
            
            <button
              type="button"
              suppressHydrationWarning={true}
              onClick={() => setDropDown((prev) => (prev === idx + 1 ? -1 : idx + 1))}
              title={t("toggleOptions")}
              aria-label={t("toggleOptions")}
              className="px-2 text-gray-400 hover:text-white cursor-pointer border-l border-gray-700 h-full flex items-center justify-center"
            >
              <FaAngleDown
                size={14}
                className={`transition-all duration-300 ease-in-out ${
                  dropDown === idx + 1 ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
          <div
            tabIndex={-1}
            style={dropdownStyle}
            className={`absolute left-0 ${isOpeningUp ? "bottom-full mb-2" : "top-full mt-2"} border border-white/10 p-2 rounded-lg flex flex-col overflow-y-auto bg-zinc-900/95 backdrop-blur-3xl shadow-2xl z-50 transition-all duration-200 w-full max-h-60 custom-scrollbar-thin ${
              dropDown === idx + 1
                ? "opacity-100 scale-100 visible translate-y-0"
                : `opacity-0 scale-95 invisible ${isOpeningUp ? "translate-y-2" : "-translate-y-2"}`
            }`}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, i) => (
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
              ))
            ) : (
              <div className="text-gray-500 text-xs p-2 text-center">{t("noOptionsFound")}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isImageField || isVideoField || isAudioField) {
    return (
      <div key={fieldName} className="flex flex-col gap-2 relative">
        {hasHandle && (
          <Handle 
            type="target" 
            position={Position.Left} 
            id={fieldName} 
            style={{ ...handleStyle, top: '25px' }} 
            className="!rounded-full input-handle !left-[-17px]" 
          />
        )}
        {label}
        <div className="flex items-center gap-1">
          <input 
            type="text" 
            value={formValues[fieldName] || ''} 
            readOnly
            // onChange={(e) => handleChange(fieldName, e.target.value)} 
            className="bg-zinc-900/50 text-white text-xs py-2 px-3 rounded-lg border border-white/10 hover:border-white/20 transition-all w-full outline-none focus:border-blue-500/50" 
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
            {isImageField || isImageUrl(value) ? (
              <img src={value} alt={t("preview")} className="w-24 h-24 object-cover border border-white/10 rounded-xl shadow-lg" width={0} height={0} />
            ) : isVideoField ? (
              <video src={value} className="w-24 h-24 object-cover border border-white/10 rounded-xl shadow-lg" />
            ) : isAudioField && (
              <div className="flex flex-col w-full h-16 border border-white/10 rounded-xl overflow-hidden shadow-lg">
                <AudioPlayer src={value} />
              </div>
            )}
            <button 
              type="button" 
              suppressHydrationWarning={true}
              onClick={() => handleChange(fieldName, '')} 
              aria-label={t("removeFile")}
              title={t("removeFile")}
              className="text-gray-500 group-hover:text-red-600 group-hover:font-black cursor-pointer absolute top-2 left-2"
            >
              &#10005;
            </button>
          </div>
        )}
      </div>
    );
  };

  if (isImagesListField) {
    const imageList = Array.isArray(formValues[fieldName]) ? formValues[fieldName] : [];
    return (
      <div key={fieldName} className="flex flex-col gap-1 relative">
        {hasHandle && (
          <Handle 
            type="target" 
            position={Position.Left} 
            id={fieldName} 
            style={{ ...handleStyle, top: '25px' }} 
            className="!rounded-full input-handle !left-[-17px]" 
          />
        )}
        <div className="flex items-center justify-between">
          {label}
          {meta.maxItems && <span className="text-xs text-gray-400">{t("maxItems", { count: meta.maxItems })}</span>}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {imageList.map((url, idx) => (
            <div key={idx} className="flex items-center gap-2 relative group overflow-hidden">
              {isImageUrl(url) ? (
                <img 
                  src={url} 
                  alt={t("preview")} 
                  className="w-full h-full aspect-[1/1] object-cover border border-gray-500 rounded" 
                />
              ) : (url.includes('.mp4') || url.includes('.webm')) && (
                <video 
                  src={url} 
                  className="w-full h-full aspect-[1/1] object-cover border border-gray-500 rounded" 
                />
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
                  aria-label={t("removeFile")}
                  title={t("removeFile")}
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

  // if (meta.minValue !== undefined && meta.maxValue !== undefined) {
  //   return (
  //     <div key={fieldName} className="flex flex-col w-full">
  //       {label}
  //       <div className="flex items-center gap-2 w-full">
  //         <input
  //           type="range"
  //           id={fieldName}
  //           min={meta.minValue}
  //           max={meta.maxValue}
  //           step={meta.step}
  //           value={formValues[fieldName] ?? meta.default}
  //           onChange={(e) => handleChange(fieldName, parseFloat(e.target.value))}
  //           className="h-1 rounded-full cursor-pointer accent-blue-600 active:accent-blue-600 outline-none w-full"
  //         />
  //         <input 
  //           type="number" 
  //           id={fieldName} 
  //           min={meta.minValue} 
  //           max={meta.maxValue} 
  //           step={meta.step}
  //           value={formValues[fieldName] ?? meta.default} 
  //           readOnly
  //           // onChange={(e) => {
  //           //   const val = parseFloat(e.target.value) || meta.minValue;
  //           //   const clamped = Math.max(meta.minValue, Math.min(val, meta.maxValue));
  //           //   handleChange(fieldName, clamped);
  //           // }} 
  //           className="w-12 h-7 text-center text-white rounded border border-gray-300 text-xs" 
  //         />
  //       </div>
  //     </div>
  //   );
  // };

  if (meta.type === "int" || meta.type === "number") {
    return (
      <div key={fieldName} className="flex flex-col gap-1 relative">
        {hasHandle && (
          <Handle 
            type="target" 
            position={Position.Left} 
            id={fieldName} 
            style={{ ...handleStyle, top: '50%', transform: 'translateY(-50%)' }} 
            className="!rounded-full input-handle !left-[-17px]" 
          />
        )}
        {label}
        <input
          type="number"
          value={value}
          onChange={(e) => handleChange(fieldName, parseFloat(e.target.value || 0))}
          placeholder={fieldDescription || t("inputValue")}
          className="bg-zinc-900/50 text-white text-xs p-2 rounded-lg border border-white/10 hover:border-white/20 transition-all outline-none focus:border-blue-500/50"
        />
      </div>
    );
  };

  if (meta.format === 'text') {
    return (
      <div key={fieldName} className="flex flex-col gap-2 w-full relative">
        {hasHandle && (
          <Handle 
            type="target" 
            position={Position.Left} 
            id={fieldName} 
            style={{ ...handleStyle, top: '25px' }} 
            className="!rounded-full input-handle !left-[-17px]" 
          />
        )}
        <div className="flex items-center gap-2 text-sm font-medium relative">
          {label}
        </div>
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

  if (meta.type === "bool") {
    return (
      <div key={fieldName} className="flex flex-col gap-1 relative">
        {hasHandle && (
          <Handle 
            type="target" 
            position={Position.Left} 
            id={fieldName} 
            style={{ ...handleStyle, top: '50%', transform: 'translateY(-50%)' }} 
            className="!rounded-full input-handle !left-[-17px]" 
          />
        )}
        {label}
        <div className="flex items-center gap-2">
          <label htmlFor={`instrumental-${fieldName}`} className="flex items-center justify-between cursor-pointer select-none relative">
            <input
              type="checkbox"
              id={`instrumental-${fieldName}`}
              className="sr-only peer"
              checked={!!formValues[fieldName]}
              onChange={(e) => handleChange(fieldName, e.target.checked)}
            />
            <span className={`flex items-center h-[20px] w-[36px] rounded-full p-1 duration-200 transition-all ${!!formValues[fieldName] ? "bg-blue-600 shadow-lg shadow-blue-900/40" : "bg-zinc-800 border border-white/10"}`}>
              <span className={`h-[12px] w-[12px] rounded-full bg-white duration-200 shadow-sm ${!!formValues[fieldName] && "translate-x-4"}`}></span>
            </span>
	          </label>
	          {fieldDescription && <p className="text-xs">{fieldDescription}</p>}
	        </div>
	      </div>
	    )
  };

  // if (meta.type === "string") {
  return (
    <div key={fieldName} className="flex flex-col items-start gap-1 relative">
      {hasHandle && (
        <Handle 
          type="target" 
          position={Position.Left} 
          id={fieldName} 
          style={{ ...handleStyle, top: '25px' }} 
          className="!rounded-full input-handle !left-[-17px]" 
        />
      )}
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
  // }
};

export default RenderApiField;
