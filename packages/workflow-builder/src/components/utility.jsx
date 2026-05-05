import axios from "axios";
import { toast } from "react-hot-toast";
import i18n from "../i18n";

const tNode = (key, defaultValue) => i18n.t(key, { ns: "nodes", defaultValue });
const presetCopyDefaults = {
  presetImageInitialPrompt: "一位未来 AI 工程师置身全息指挥中心的超精细电影感肖像。漂浮的透明 UI 面板、发光的蓝紫色数据流、反光表面、柔和轮廓光、浅景深、真实肤质、高级科幻电影质感、8K 分辨率、照片级真实感、强烈戏剧对比、干净的未来主义设计。",
  presetImageEditPrompt: "增强光照，让画面更具电影感，加入更强的轮廓光和细腻的体积雾。提升对比度和空间层次，在主体周围添加发光全息元素，略微压暗背景以突出焦点，强化面部真实感和清晰度，并保持照片级真实的高级科幻氛围。",
  presetVideoMotionPrompt: "为场景加入缓慢的电影感镜头运动、细微视差和顺滑前移动作。全息元素应轻柔脉动和位移，光束在雾气中自然流动，漂浮结构轻微旋转，整体运动保持超顺滑、电影级和高级质感。",
  presetVideoImagePrompt: "由漂浮几何形体和全息面板构成的发光未来城市宽幅电影镜头。霓虹蓝紫灯光、柔和体积雾、反光表面、戏剧化天空、超真实光照、景深、8K 细节、科幻电影风格、对称构图。",
  presetAudioPrompt: "生成一段电影感环境音景，包含深沉的大气铺底、柔和演进的合成器纹理、细微低频脉冲和轻柔的高频闪光感。氛围应未来、平静且有启发感，适合高端 AI 产品或电影感工作流展示。混音干净、专业声音设计、过渡顺滑，避免突兀声音。",
  presetCaptionPrompt: "请为这张图片生成详细提示词，尽可能捕捉其中的元素。包括颜色、材质、出现的人物或物体以及场景。描述氛围、显著特征或互动，以及画面的整体情绪。",
  presetCaptionExampleOutput: "一幅黄金时刻的电影感科幻城市景观。一名孤独的探索者站在崎岖悬崖边缘，凝望着低云海之上延展的巨大未来城市。前景悬崖是深色粗粝岩石，岩缝与边缘点缀着草丛和小野花。探索者穿着粗犷的现代太空服，背着背包和装备；他的剪影安静而沉思，被远处发光的城市衬托出来。下方城市由密集的玻璃和金属摩天楼构成。许多建筑表面布满霓虹装饰：青绿和蓝绿色竖线沿塔楼发光，红色和洋红色边缘光勾勒顶部轮廓，青色几何条带描绘建筑纹路。中央建筑群有一对明亮青色高光的双子巨塔，天线直指天空。其他建筑拥有弧形、多层轮廓和反光立面，同时映照夕阳与霓虹。薄雾笼罩低层区域，柔化边缘，赋予城市梦幻般的尺度感。\n\n天空中，几架流线型飞行器划过，留下明亮尾迹，有些是白色和浅黄色，有些是洋红和紫色，为画面增加动感和深度。天空色彩从地平线附近温暖的夕阳金橙色，渐变到高处的冷调深蓝色，零散云层被阳光染成琥珀色。太阳位于左侧低空，长长的暖光扫过悬崖，并在探索者身上形成柔和轮廓光；与此同时，城市以更冷的霓虹光在暮色中发亮。整体氛围令人敬畏、充满冒险感并带有轻微异世界气质，呈现出一个人在先进而脆弱的科技大都会边缘独自探索的瞬间。",
};
const presetCopy = (key) => tNode(key, presetCopyDefaults[key] || key);

export const imageModels = [
  {
    id: "image-passthrough",
    displayNameKey: "inputImage",
    get name() { return tNode("inputImage", "输入图片"); },
    input_params: {
      properties: {
        "image_url": {
          "examples": [],
          get description() { return tNode("imageUrlDesc", "输入图片的 URL。"); },
          "field": "image",
          "type": "string",
          get title() { return tNode("imageUrl", "图片 URL"); },
          "name": "image_url"
        },
      },
      required: ["prompt"],
    }
  },
  {
    id: "gpt-image-1.5",
    name: "GPT Image 1.5",
    input_params: {}
  },
  {
    id: "nano-banana",
    name: "Nano Banana",
    input_params: {}
  },
  {
    id: "nano-banana-edit",
    name: "Nano Banana Edit",
    input_params: {}
  },
  {
    id: "nano-banana-pro",
    name: "Nano Banana Pro",
    input_params: {}
  },
  {
    id: "nano-banana-pro-edit",
    name: "Nano Banana Pro Edit",
    input_params: {}
  },
  {
    id: "flux-schnell",
    name: "Flux Schnell",
    input_params: {}
  },
  {
    id: "flux-2-dev",
    name: "Flux 2 Dev",
    input_params: {}
  },
  {
    id: "flux-2-dev-edit",
    name: "Flux 2 Dev Edit",
    input_params: {}
  },
  {
    id: "flux-2-flex",
    name: "Flux 2 Flex",
    input_params: {}
  },
  {
    id: "flux-2-flex-edit",
    name: "Flux 2 Flex Edit",
    input_params: {}
  },
  {
    id: "flux-2-pro",
    name: "Flux 2 Pro",
    input_params: {}
  },
  {
    id: "flux-2-pro-edit",
    name: "Flux 2 Pro Edit",
    input_params: {}
  },
  {
    id: "bytedance-seedream-v4",
    name: "Bytedance Seedream v4",
    input_params: {}
  },
  {
    id: "bytedance-seedream-edit-v4",
    name: "Bytedance Seedream Edit v4",
    input_params: {}
  },
  {
    id: "bytedance-seedream-v4.5",
    name: "Seedream v4.5",
    input_params: {}
  },
  {
    id: "bytedance-seedream-v4.5-edit",
    name: "Seedream v4.5 Edit",
    input_params: {}
  },
  {
    id: "wan2.5-text-to-image",
    name: "Wan 2.5 Text to Image",
    input_params: {}
  },
  {
    id: "wan2.5-image-edit",
    name: "Wan 2.5 Image Edit",
    input_params: {}
  },
  {
    id: "wan2.6-text-to-image",
    name: "Wan 2.6 Text to Image",
    input_params: {}
  },
  {
    id: "wan2.6-image-edit",
    name: "Wan 2.6 Image Edit",
    input_params: {}
  },
  {
    id: "qwen-image",
    name: "Qwen Image",
    input_params: {}
  },
  {
    id: "qwen-image-edit-2511",
    name: "Qwen Image Edit 2511",
    input_params: {}
  },
  {
    id: "qwen-image-edit",
    name: "Qwen Image Edit",
    input_params: {}
  },
  {
    id: "qwen-image-edit-plus",
    name: "Qwen Image Edit Plus",
    input_params: {}
  },
  {
    id: "qwen-image-edit-plus-lora",
    name: "Qwen Image Edit Plus (LoRA)",
    input_params: {}
  },
  {
    id: "z-image-turbo",
    name: "Z Image Turbo",
    input_params: {}
  },
  {
    id: "chroma-image",
    name: "Chroma Image",
    input_params: {}
  },
  {
    id: "kling-o1-text-to-image",
    name: "Kling O1 Text to Image",
    input_params: {}
  },
  {
    id: "kling-o1-edit-image",
    name: "Kling O1 Image Edit",
    input_params: {}
  },
  {
    id: "grok-imagine-text-to-image",
    name: "Grok Imagine",
    input_params: {}
  },
  {
    id: "hunyuan-image-2.1",
    name: "Hunyuan Image 2.1",
    input_params: {}
  },
  {
    id: "hunyuan-image-3.0",
    name: "Hunyuan Image 3.0",
    input_params: {}
  },
  {
    id: "google-imagen4",
    name: "Google Imagen 4",
    input_params: {}
  },
  {
    id: "google-imagen4-fast",
    name: "Google Imagen 4 Fast",
    input_params: {}
  },
  {
    id: "google-imagen4-ultra",
    name: "Google Imagen 4 Ultra",
    input_params: {}
  },
  {
    id: "midjourney-v7-text-to-image",
    name: "Midjourney v7 Text to Image",
    input_params: {}
  },
  {
    id: "midjourney-v7-image-to-image",
    name: "Midjourney v7 Image to Image",
    input_params: {}
  },
  {
    id: "midjourney-v7-omni-reference",
    name: "Midjourney v7 Omni Reference",
    input_params: {}
  },
  {
    id: "midjourney-v7-style-reference",
    name: "Midjourney v7 Style Reference",
    input_params: {}
  },
  {
    id: "vidu-q2-text-to-image",
    name: "Vidu Q2 Text to Image",
    input_params: {}
  },
  {
    id: "vidu-q2-reference-to-image",
    name: "Vidu Q2 Reference Image",
    input_params: {}
  }
];

export const videoModels = [
  {
    id: "video-passthrough",
    displayNameKey: "inputVideo",
    get name() { return tNode("inputVideo", "输入视频"); },
    input_params: {
      properties: {
        "video_url": {
          "examples": [],
          get description() { return tNode("videoUrlDesc", "输入视频的 URL。"); },
          "field": "video",
          "type": "string",
          get title() { return tNode("videoUrl", "视频 URL"); },
          "name": "video_url"
        },
      },
      required: ["prompt"],
    }
  },
  {
    id: "seedance-lite-i2v",
    name: "Seedance Lite I2V",
    input_params: {}
  },
  {
    id: "seedance-lite-t2v",
    name: "Seedance Lite T2V",
    input_params: {}
  },
  {
    id: "seedance-pro-t2v",
    name: "Seedance Pro T2V",
    input_params: {}
  },
  {
    id: "seedance-pro-i2v",
    name: "Seedance Pro I2V",
    input_params: {}
  },
  {
    id: "seedance-pro-t2v-fast",
    name: "Seedance Pro T2V Fast",
    input_params: {}
  },
  {
    id: "seedance-pro-i2v-fast",
    name: "Seedance Pro I2V Fast",
    input_params: {}
  },

  {
    id: "seedance-v1.5-pro-i2v",
    name: "Seedance v1.5 Pro I2V",
    input_params: {}
  },
  {
    id: "seedance-v1.5-pro-t2v",
    name: "Seedance v1.5 Pro T2V",
    input_params: {}
  },
  {
    id: "seedance-v1.5-pro-i2v-fast",
    name: "Seedance v1.5 Pro I2V Fast",
    input_params: {}
  },
  {
    id: "seedance-v1.5-pro-t2v-fast",
    name: "Seedance v1.5 Pro T2V Fast",
    input_params: {}
  },
  {
    id: "seedance-v1.5-pro-video-extend",
    name: "Seedance v1.5 Pro Video Extend",
    input_params: {}
  },
  {
    id: "seedance-v1.5-pro-video-extend-fast",
    name: "Seedance v1.5 Pro Video Extend Fast",
    input_params: {}
  },

  {
    id: "veo3.1-image-to-video",
    name: "Veo3.1 I2V",
    input_params: {}
  },
  {
    id: "veo3.1-text-to-video",
    name: "Veo3.1 T2V",
    input_params: {}
  },
  {
    id: "veo3.1-fast-image-to-video",
    name: "Veo3.1 Fast I2V",
    input_params: {}
  },
  {
    id: "veo3.1-fast-text-to-video",
    name: "Veo3.1 Fast T2V",
    input_params: {}
  },
  {
    id: "wan2.2-text-to-video",
    name: "Wan 2.2 T2V",
    input_params: {}
  },
  {
    id: "wan2.2-image-to-video",
    name: "Wan 2.2 I2V",
    input_params: {}
  },
  {
    id: "wan2.2-5b-fast-t2v",
    name: "Wan 2.2 5B Fast T2V",
    input_params: {}
  },
  {
    id: "wan2.2-animate",
    name: "Wan 2.2 Animate",
    input_params: {}
  },
  {
    id: "wan2.2-edit-video",
    name: "Wan 2.2 Video Edit",
    input_params: {}
  },
  {
    id: "wan2.2-spicy-image-to-video",
    name: "Wan 2.2 Spicy I2V",
    input_params: {}
  },
  {
    id: "wan2.2-spicy-video-extend",
    name: "Wan 2.2 Spicy Extend",
    input_params: {}
  },
  {
    id: "wan2.5-text-to-video",
    name: "Wan 2.5 T2V",
    input_params: {}
  },
  {
    id: "wan2.5-image-to-video",
    name: "Wan 2.5 I2V",
    input_params: {}
  },
  {
    id: "wan2.5-text-to-video-fast",
    name: "Wan 2.5 Fast T2V",
    input_params: {}
  },
  {
    id: "wan2.5-image-to-video-fast",
    name: "Wan 2.5 Fast I2V",
    input_params: {}
  },
  {
    id: "wan2.6-text-to-video",
    name: "Wan 2.6 T2V",
    input_params: {}
  },
  {
    id: "wan2.6-image-to-video",
    name: "Wan 2.6 I2V",
    input_params: {}
  },
  {
    id: "openai-sora",
    name: "OpenAI Sora",
    input_params: {}
  },
  {
    id: "openai-sora-2-text-to-video",
    name: "Sora 2 T2V",
    input_params: {}
  },
  {
    id: "openai-sora-2-image-to-video",
    name: "Sora 2 I2V",
    input_params: {}
  },
  {
    id: "openai-sora-2-pro-text-to-video",
    name: "Sora 2 Pro T2V",
    input_params: {}
  },
  {
    id: "openai-sora-2-pro-image-to-video",
    name: "Sora 2 Pro I2V",
    input_params: {}
  },
  {
    id: "kling-v2.5-turbo-pro-t2v",
    name: "Kling v2.5 Turbo Pro T2V",
    input_params: {}
  },
  {
    id: "kling-v2.5-turbo-pro-i2v",
    name: "Kling v2.5 Turbo Pro I2V",
    input_params: {}
  },
  {
    id: "kling-v2.5-turbo-std-i2v",
    name: "Kling v2.5 Turbo Std I2V",
    input_params: {}
  },
  {
    id: "kling-v2.6-pro-t2v",
    name: "Kling v2.6 Pro T2V",
    input_params: {}
  },
  {
    id: "kling-v2.6-pro-i2v",
    name: "Kling v2.6 Pro I2V",
    input_params: {}
  },
  {
    id: "kling-v2.6-pro-motion-control",
    name: "Kling v2.6 Pro Motion Control",
    input_params: {}
  },
  {
    id: "kling-o1-text-to-video",
    name: "Kling O1 T2V",
    input_params: {}
  },
  {
    id: "kling-o1-image-to-video",
    name: "Kling O1 I2V",
    input_params: {}
  },
  {
    id: "kling-o1-video-edit",
    name: "Kling O1 Video Edit",
    input_params: {}
  },
  {
    id: "kling-o1-video-edit-fast",
    name: "Kling O1 Video Edit Fast",
    input_params: {}
  },
  {
    id: "kling-o1-reference-to-video",
    name: "Kling O1 Reference",
    input_params: {}
  },
  {
    id: "kling-o1-standard-image-to-video",
    name: "Kling O1 Standard I2V",
    input_params: {}
  },
  {
    id: "kling-o1-standard-reference-to-video",
    name: "Kling O1 Standard Reference",
    input_params: {}
  },
  {
    id: "kling-o1-standard-video-edit",
    name: "Kling O1 Standard Video Edit",
    input_params: {}
  },
  {
    id: "grok-imagine-text-to-video",
    name: "Grok Imagine T2V",
    input_params: {}
  },
  {
    id: "grok-imagine-image-to-video",
    name: "Grok Imagine I2V",
    input_params: {}
  },
  {
    id: "hunyuan-text-to-video",
    name: "Hunyuan T2V",
    input_params: {}
  },
  {
    id: "hunyuan-fast-text-to-video",
    name: "Hunyuan Fast T2V",
    input_params: {}
  },
  {
    id: "hunyuan-image-to-video",
    name: "Hunyuan I2V",
    input_params: {}
  },
  {
    id: "midjourney-v7-image-to-video",
    name: "Midjourney v7 I2V",
    input_params: {}
  },
  {
    id: "vidu-q2-turbo-start-end-video",
    name: "Vidu Q2 Turbo Start/End",
    input_params: {}
  },
  {
    id: "vidu-q2-pro-start-end-video",
    name: "Vidu Q2 Pro Start/End",
    input_params: {}
  },
  {
    id: "vidu-q2-reference",
    name: "Vidu Q2 Reference",
    input_params: {}
  },
  {
    id: "luma-modify-video",
    name: "Luma Modify Video",
    input_params: {}
  },
  {
    id: "luma-flash-reframe",
    name: "Luma Flash Reframe",
    input_params: {}
  },
  {
    id: "video-combiner",
    displayNameKey: "videoCombiner",
    get name() { return tNode("videoCombiner", "视频合并器"); },
    input_params: {}
  }
];

export const textModels = [
  {
    id: "text-passthrough",
    displayNameKey: "inputText",
    get name() { return tNode("inputText", "输入文本"); },
    input_params: {
      properties: {
        "prompt": {
          "examples": [
            ""
          ],
          get description() { return tNode("promptDesc", "用于描述图片的文本提示词。"); },
          "type": "string",
          get title() { return tNode("prompt", "提示词"); },
          "name": "prompt"
        }
      },
      required: ["prompt"],
    }
  },
  {
    id: "any-llm",
    displayNameKey: "anyLlm",
    name: "Any Llm",
    input_params: {}
  },
  {
    id: "openrouter-vision",
    displayNameKey: "openrouterVision",
    name: "Openrouter Vision",
    input_params: {}
  },
  {
    id: "gpt-5-nano",
    displayNameKey: "gpt5Nano",
    name: "GPT5 Nano",
    input_params: {}
  },
  {
    id: "gpt-5-mini",
    displayNameKey: "gpt5Mini",
    name: "GPT5 Mini",
    input_params: {}
  }
];

export const audioModels = [
  {
    id: "audio-passthrough",
    displayNameKey: "inputAudio",
    get name() { return tNode("inputAudio", "输入音频"); },
    input_params: {
      properties: {
        "audio_url": {
          "examples": [],
          get description() { return tNode("audioUrlDesc", "输入音频的 URL。"); },
          "field": "audio",
          "type": "string",
          get title() { return tNode("audioUrl", "音频 URL"); },
          "name": "audio_url"
        },
      },
      required: ["audio_url"],
    }
  },
  {
    id: "suno-create-music",
    name: "Suno Create Music",
    input_params: {}
  },
  {
    id: "suno-extend-music",
    name: "Suno Extend Music",
    input_params: {}
  },
  {
    id: "suno-remix-music",
    name: "Suno Remix Music",
    input_params: {}
  },
  {
    id: "minimax-voice-clone",
    name: "Minimax Voice Clone",
    input_params: {}
  },
  {
    id: "minimax-speech-2.6-hd",
    name: "Minimax Speech 2.6 HD",
    input_params: {}
  },
  {
    id: "minimax-speech-2.6-turbo",
    name: "Minimax Speech 2.6 Turbo",
    input_params: {}
  }
];

export const concatModels = [
  {
    id: "prompt-concatenator",
    displayNameKey: "promptConcatenator",
    get name() { return tNode("promptConcatenator", "提示词拼接器"); },
    input_params: {
      properties: {
        "prompt": {
          "examples": [
            ""
          ],
          get description() { return tNode("promptDesc", "用于描述图片的文本提示词。"); },
          "type": "string",
          get title() { return tNode("prompt", "提示词"); },
          "name": "prompt"
        }
      },
      required: ["prompt"],
    }
  }
];

export const videoCombinerModels = [
  {
    id: "video-combiner",
    displayNameKey: "videoCombiner",
    get name() { return tNode("videoCombiner", "视频合并器"); },
    input_params: {
      properties: {
        "videos_list": {
          "examples": [
            "https://d3adwkbyhxyrtq.cloudfront.net/webassets/videomodels/seedance-v2.0-i2v.mp4"
          ],
          get description() { return tNode("videoClipsDesc", "按顺序上传要合并的视频片段。每个片段可长达 5 到 60 秒。"); },
          "field": "videos_list",
          "type": "array",
          "items": {
            "type": "string"
          },
          get title() { return tNode("videoClips", "视频片段"); },
          "name": "videos_list",
          "maxItems": 20
        },
        "aspect_ratio": {
          "enum": [
            "auto",
            "16:9",
            "9:16",
            "1:1",
            "4:3",
            "3:4",
            "21:9",
            "9:21"
          ],
          get title() { return tNode("aspectRatio", "宽高比"); },
          "name": "aspect_ratio",
          "type": "string",
          "default": "auto",
          get description() { return tNode("aspectRatioDesc", "输出宽高比。`auto` 会使用第一个上传片段的宽高比。"); }
        }
      },
      required: ["videos_list"],
    }
  }
];

export const apiNodeModels = [
  {
    id: "wavespeed",
    displayNameKey: "wavespeedApi",
    get name() { return tNode("wavespeedApi", "Wavespeed API"); },
    input_params: {
      properties: {
        "model_url": {
          "default": "",
          get description() { return tNode("wavespeedModelUrlDesc", "Wavespeed 模型 URL，例如 https://wavespeed.ai/models/wavespeed-ai/flux-schnell"); },
          "type": "string",
          "format": "text",
          "required": true
        },
        "api_key": {
          "examples": "",
          get description() { return tNode("wavespeedApiKeyDesc", "Wavespeed AI 的 API 密钥。"); },
          "type": "string",
          "format": "text",
          "required": true
        },
      },
      required: ["model_url", "api_key"],
    }
  },
  {
    id: "straico",
    displayNameKey: "straicoApi",
    get name() { return tNode("straicoApi", "Straico API"); },
    input_params: {
      properties: {
        "model_name": {
          "enum": [],
          get description() { return tNode("straicoModelNameDesc", "模型名称（例如 sd-xl）"); },
          "type": "string",
          "default": "",
          "required": true
        },
        "model_type": {
          "enum": ["chat", "image", "video", "audio"],
          "default": "chat",
          get description() { return tNode("straicoModelTypeDesc", "模型类型（例如 chat、image、video、audio）"); },
          "type": "string",
          "required": true
        },
        "api_key": {
          "examples": "",
          get description() { return tNode("straicoApiKeyDesc", "Straico 的 API 密钥。"); },
          "type": "string",
          "format": "text",
          "required": true
        },
      },
      required: ["model_name", "model_type", "api_key"],
    }
  },
  {
    id: "runware",
    displayNameKey: "runwareApi",
    get name() { return tNode("runwareApi", "Runware API"); },
    input_params: {
      properties: {
        "api_key": {
          get description() { return tNode("runwareApiKeyDesc", "Runware API 密钥"); },
          "type": "string",
          "format": "text",
          "required": true
        },
        "task_type": {
          "enum": ["imageInference", "textToVideo", "imageToVideo", "upscale", "removeBackground"],
          get description() { return tNode("runwareTaskTypeDesc", "任务类型（例如 imageInference、textToVideo、imageToVideo、upscale）"); },
          "type": "string",
          "default": "imageInference",
          "required": true
        },
        "model_name": {
          "enum": [],
          get description() { return tNode("runwareAirModelIdDesc", "模型的 AIR 标识符"); },
          "type": "string",
          "default": "",
          "required": false
        }
      },
      required: ["task_type", "api_key"]
    }
  },
  {
    id: "genvr",
    displayNameKey: "genvrApi",
    get name() { return tNode("genvrApi", "GenVR API"); },
    input_params: {
      properties: {
        "uid": {
          get description() { return tNode("genvrUserIdDesc", "你的 GenVR 用户 ID"); },
          "type": "string",
          "format": "text",
          "required": true
        },
        "api_key": {
          get description() { return tNode("genvrApiKeyDesc", "GenVR API 密钥"); },
          "type": "string",
          "format": "text",
          "required": true
        },
        "category": {
          get description() { return tNode("genvrModelCategoryDesc", "模型分类（例如 imagegen）"); },
          "type": "string",
          "format": "text",
          "required": true
        },
        "subcategory": {
          get description() { return tNode("genvrModelIdentifierDesc", "模型标识符（例如 flux_dev）"); },
          "type": "string",
          "format": "text",
          "required": true
        }
      },
      required: ["uid", "api_key", "category", "subcategory"]
    }
  }
];

export const downloadFile = async (file_url, filename = "download") => {
  if (!file_url) {
    toast.error(i18n.t("toastFileUrlNotFound", { ns: "nodes" }));
    return;
  }

  const response = await axios.post("/api/workflow/cloudfront-signed-url",
    {
      url: file_url
    }
  );

  const signed_url = response.data.signed_url;

  try {
    const response = await fetch(signed_url, { mode: "cors" });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed:", err);
    toast.error(i18n.t("toastDownloadFailed", { ns: "nodes" }));
  }
};

export const presets = [
  {
    id: "empty-workflow",
    get title() { return tNode("presetEmpty", "空工作流"); },
    get description() { return tNode("presetEmptyDesc", "从空白画布开始"); },
    icon: "plus",
    image: "",
    nodes: [],
    edges: []
  },
  {
    id: "image-generator",
    get title() { return tNode("presetImageGen", "图片生成与编辑"); },
    get description() { return tNode("presetImageGenDesc", "使用 Wan 2.5 生成和编辑图片"); },
    icon: "image",
    image: "https://cdn.muapi.ai/outputs/e53f9cb2caf947f790154dada58a426c.jpg",
    nodes: [
      {
        id: "text1",
        position: { x: -69, y: 22 },
        data: {
          selectedModel: {
            id: "text-passthrough",
            get name() { return tNode("inputText", "输入文本"); }
          },
          formValues: {
            get prompt() { return presetCopy("presetImageInitialPrompt"); }
          },
          outputs: [
            {
              type: "text",
              get value() { return presetCopy("presetImageInitialPrompt"); }
            }
          ],
          get resultUrl() { return presetCopy("presetImageInitialPrompt"); }
        },
        type: "textNode"
      },
      {
        id: "image1",
        position: { x: 370, y: 250 },
        data: {
          selectedModel: {
            id: "wan2.5-text-to-image",
            name: "Wan 2.5 Text to Image",
          },
          formValues: {
            get prompt() { return presetCopy("presetImageInitialPrompt"); },
            width: 1024,
            height: 1024,
          },
          outputs: [
            {
              type: "image_url",
              value: "https://cdn.muapi.ai/outputs/8c6c1863ae594cb99e82884f5d3de058.jpg"
            }
          ],
          resultUrl: "https://cdn.muapi.ai/outputs/8c6c1863ae594cb99e82884f5d3de058.jpg"
        },
        type: "imageNode"
      },
      {
        id: "text2",
        position: { x: 390, y: -235 },
        data: {
          selectedModel: {
            id: "text-passthrough",
            get name() { return tNode("inputText", "输入文本"); }
          },
          formValues: {
            get prompt() { return presetCopy("presetImageEditPrompt"); }
          },
          outputs: [
            {
              type: "text",
              get value() { return presetCopy("presetImageEditPrompt"); }
            }
          ],
          get resultUrl() { return presetCopy("presetImageEditPrompt"); }
        },
        type: "textNode"
      },
      {
        id: "image2",
        position: { x: 835, y: 25 },
        data: {
          selectedModel: {
            id: "wan2.5-image-edit",
            name: "Wan 2.5 Image Edit",
          },
          formValues: {
            get prompt() { return presetCopy("presetImageEditPrompt"); },
            images_list: [
              "https://cdn.muapi.ai/outputs/8c6c1863ae594cb99e82884f5d3de058.jpg"
            ],
            width: 2048,
            height: 2048,
          },
          outputs: [
            {
              type: "image_url",
              value: "https://cdn.muapi.ai/outputs/e53f9cb2caf947f790154dada58a426c.jpg"
            }
          ],
          resultUrl: "https://cdn.muapi.ai/outputs/e53f9cb2caf947f790154dada58a426c.jpg"
        },
        type: "imageNode"
      }
    ],
    edges: [
      {
        id: "e1-1",
        source: "text1",
        target: "image1",
        sourceHandle: "textOutput",
        targetHandle: "imageInput",
        style: { stroke: "#3b82f6", strokeWidth: 2 }
      },
      {
        id: "e1-2",
        source: "image1",
        target: "image2",
        sourceHandle: "imageOutput",
        targetHandle: "imageInput2",
        style: { stroke: "#22c55e", strokeWidth: 2 }
      },
      {
        id: "e1-3",
        source: "text2",
        target: "image2",
        sourceHandle: "textOutput",
        targetHandle: "imageInput",
        style: { stroke: "#3b82f6", strokeWidth: 2 }
      }
    ]
  },
  {
    id: "video-generator",
    get title() { return tNode("presetVideoGen", "视频生成器"); },
    get description() { return tNode("presetVideoGenDesc", "使用 Seedance Lite 进行简单的视频生成"); },
    icon: "video",
    image: "https://cdn.muapi.ai/outputs/836c0912239f4f11a2ca333e26387152.jpg",
    nodes: [
      {
        id: "text1",
        position: { x: -9, y: 30 },
        data: {
          selectedModel: {
            id: "text-passthrough",
            get name() { return tNode("inputText", "输入文本"); }
          },
          formValues: {
            get prompt() { return presetCopy("presetVideoMotionPrompt"); }
          },
          outputs: [
            {
              type: "text",
              get value() { return presetCopy("presetVideoMotionPrompt"); }
            }
          ],
          get resultUrl() { return presetCopy("presetVideoMotionPrompt"); }
        },
        type: "textNode"
      },
      {
        id: "image1",
        position: { x: -14, y: -426 },
        data: {
          selectedModel: {
            id: "bytedance-seedream-v4.5",
            name: "Seedream v4.5",
          },
          formValues: {
            get prompt() { return presetCopy("presetVideoImagePrompt"); },
            aspect_ratio: "1:1",
            quality: "high",
          },
          outputs: [
            {
              type: "image_url",
              value: "https://cdn.muapi.ai/outputs/836c0912239f4f11a2ca333e26387152.jpg"
            }
          ],
          resultUrl: "https://cdn.muapi.ai/outputs/836c0912239f4f11a2ca333e26387152.jpg"
        },
        type: "imageNode"
      },
      {
        id: "video1",
        position: { x: 624, y: -154 },
        data: {
          selectedModel: {
            id: "seedance-lite-i2v",
            name: "Seedance Lite I2V",
          },
          formValues: {
            get prompt() { return presetCopy("presetVideoMotionPrompt"); },
            image_url: "https://cdn.muapi.ai/outputs/836c0912239f4f11a2ca333e26387152.jpg",
            resolution: "720p",
            duration: 5,
            camera_fixed: false,
          },
          outputs: [
            {
              type: "video_url",
              value: "https://cdn.muapi.ai/outputs/6e1f813951b24868ad117ddca0aaa8ea.mp4"
            }
          ],
          resultUrl: "https://cdn.muapi.ai/outputs/6e1f813951b24868ad117ddca0aaa8ea.mp4"
        },
        type: "videoNode"
      }
    ],
    edges: [
      {
        id: "e1-1",
        source: "text1",
        target: "video1",
        sourceHandle: "textOutput",
        targetHandle: "videoInput",
        style: { stroke: "#3b82f6", strokeWidth: 2 }
      },
      {
        id: "e1-2",
        source: "image1",
        target: "video1",
        sourceHandle: "imageOutput",
        targetHandle: "videoInput2",
        style: { stroke: "#22c55e", strokeWidth: 2 }
      }
    ]
  },
  {
    id: "audio-generator",
    get title() { return tNode("presetAudioGen", "音频生成器"); },
    get description() { return tNode("presetAudioGenDesc", "使用 Suno 从文本生成音频"); },
    icon: "audio",
    image: "https://images.unsplash.com/photo-1526512340740-9217d0159da9?q=80&w=500&auto=format&fit=crop",
    nodes: [
      {
        id: "text1",
        position: { x: -9, y: 30 },
        data: {
          selectedModel: {
            id: "text-passthrough",
            get name() { return tNode("inputText", "输入文本"); }
          },
          formValues: {
            get prompt() { return presetCopy("presetAudioPrompt"); }
          },
          outputs: [
            {
              type: "text",
              get value() { return presetCopy("presetAudioPrompt"); }
            }
          ],
          get resultUrl() { return presetCopy("presetAudioPrompt"); }
        },
        type: "textNode"
      },
      {
        id: "audio1",
        position: { x: 400, y: 100 },
        data: {
          selectedModel: {
            id: "suno-create-music",
            name: "Suno Create Music"
          },
          formValues: {
            get prompt() { return presetCopy("presetAudioPrompt"); },
            style: "Classical",
            style_weight: 0,
            vocal_gender: "male",
            weirdness_constraint: 0,
            audio_weight: 0,
            instrumental: true,
            model: "V5",
            negative_tags: null,
          },
          outputs: [
            {
              type: "audio_url",
              value: "https://cdn.muapi.ai/outputs/6a42f05895284e8687420843c749e11c.mp3"
            }
          ],
          resultUrl: "https://cdn.muapi.ai/outputs/6a42f05895284e8687420843c749e11c.mp3"
        },
        type: "audioNode"
      }
    ],
    edges: [
      {
        id: "e1-1",
        source: "text1",
        target: "audio1",
        sourceHandle: "textOutput",
        targetHandle: "audioInput2",
        style: { stroke: "#3b82f6", strokeWidth: 2 }
      }
    ]
  },
  {
    id: "captioning",
    get title() { return tNode("presetCaption", "LLM 图片描述"); },
    get description() { return tNode("presetCaptionDesc", "使用 GPT-5 从图片生成提示词"); },
    icon: "text",
    image: "https://cdn.muapi.ai/outputs/a4c650a8834a4a14a82a961710617fd2.jpg",
    nodes: [
      {
        id: "image1",
        position: { x: 0, y: 100 },
        data: {
          selectedModel: {
            id: "image-passthrough",
            get name() { return tNode("inputImage", "输入图片"); }
          },
          formValues: {
            image_url: "https://cdn.muapi.ai/outputs/a4c650a8834a4a14a82a961710617fd2.jpg"
          },
          outputs: [
            {
              type: "image_url",
              value: "https://cdn.muapi.ai/outputs/a4c650a8834a4a14a82a961710617fd2.jpg"
            }
          ],
          resultUrl: "https://cdn.muapi.ai/outputs/a4c650a8834a4a14a82a961710617fd2.jpg",
        },
        type: "imageNode"
      },
      {
        id: "text1",
        position: { x: 432, y: -110 },
        data: {
          selectedModel: {
            id: "gpt-5-nano",
            name: "GPT5 Nano"
          },
          formValues: {
            get prompt() { return presetCopy("presetCaptionPrompt"); },
            image_url: "https://cdn.muapi.ai/outputs/a4c650a8834a4a14a82a961710617fd2.jpg"
          },
          outputs: [
            {
              type: "text",
              get value() { return presetCopy("presetCaptionExampleOutput"); }
            }
          ],
          get resultUrl() { return presetCopy("presetCaptionExampleOutput"); },
        },
        type: "textNode"
      },
      {
        id: "text2",
        position: { x: -2, y: -335 },
        data: {
          selectedModel: {
            id: "text-passthrough",
            get name() { return tNode("inputText", "输入文本"); }
          },
          formValues: {
            get prompt() { return presetCopy("presetCaptionPrompt"); }
          },
          outputs: [
            {
              type: "text",
              get value() { return presetCopy("presetCaptionPrompt"); }
            }
          ],
          get resultUrl() { return presetCopy("presetCaptionPrompt"); },
        },
        type: "textNode"
      }
    ],
    edges: [
      {
        id: "e4-1",
        source: "image1",
        target: "text1",
        sourceHandle: "imageOutput",
        targetHandle: "textInput2",
        style: { stroke: "#22c55e", strokeWidth: 2 }
      },
      {
        id: "e4-2",
        source: "text2",
        target: "text1",
        sourceHandle: "textOutput",
        targetHandle: "textInput",
        style: { stroke: "#3b82f6", strokeWidth: 2 }
      }
    ]
  }
];
