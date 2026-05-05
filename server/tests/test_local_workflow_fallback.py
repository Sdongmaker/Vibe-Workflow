import importlib
import os
import sys
import tempfile
import unittest
from pathlib import Path

from fastapi import HTTPException

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

LEGACY_PROVIDER_KEY_ENV = "MU" + "_API_KEY"


class LocalWorkflowFallbackTest(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.tempdir = tempfile.TemporaryDirectory()
        os.environ["LOCAL_WORKFLOW_STORE"] = os.path.join(
            self.tempdir.name, "workflows.json"
        )
        os.environ.pop("AI_PROVIDER", None)
        os.environ.pop("OPENAI_BASE_URL", None)
        os.environ.pop("OPENAI_API_KEY", None)
        os.environ.pop("OPENAI_MODEL", None)
        os.environ.pop("AI_CAPABILITIES", None)
        os.environ.pop(LEGACY_PROVIDER_KEY_ENV, None)

        from app.utils import workflow_helper

        self.workflow_helper = importlib.reload(workflow_helper)

    async def asyncTearDown(self):
        self.tempdir.cleanup()

    async def test_create_and_fetch_workflow_with_local_provider(self):
        created = await self.workflow_helper.create_or_update_workflow(
            {
                "workflow_id": None,
                "edges": [],
                "data": {"nodes": []},
            }
        )

        self.assertIn("workflow_id", created)

        workflows = await self.workflow_helper.get_workflow_defs_helper()
        self.assertEqual(len(workflows), 1)
        self.assertEqual(workflows[0]["id"], created["workflow_id"])
        self.assertEqual(workflows[0]["name"], "未命名工作流")
        self.assertEqual(workflows[0]["category"], "通用")

        fetched = await self.workflow_helper.get_workflow_def_helper(
            created["workflow_id"]
        )
        self.assertEqual(fetched["workflow_id"], created["workflow_id"])
        self.assertEqual(fetched["data"], {"nodes": []})
        self.assertTrue(fetched["is_owner"])

    async def test_node_schemas_are_available_with_local_provider(self):
        schemas = await self.workflow_helper.get_node_schemas_helper("local-id")

        self.assertIn("categories", schemas)
        self.assertIn("text-passthrough", schemas["categories"]["text"]["models"])
        self.assertIn("image-passthrough", schemas["categories"]["image"]["models"])
        self.assertIn("video-passthrough", schemas["categories"]["video"]["models"])
        self.assertIn("audio-passthrough", schemas["categories"]["audio"]["models"])

        text_schema = schemas["categories"]["text"]["models"]["text-passthrough"][
            "input_schema"
        ]["schemas"]["input_data"]
        image_field = schemas["categories"]["image"]["models"]["image-passthrough"][
            "input_schema"
        ]["schemas"]["input_data"]["properties"]["image_url"]
        video_list = schemas["categories"]["utility"]["models"]["video-combiner"][
            "input_schema"
        ]["schemas"]["input_data"]["properties"]["videos_list"]

        self.assertEqual(text_schema["title"], "输入文本")
        self.assertEqual(text_schema["properties"]["prompt"]["title"], "提示词")
        self.assertEqual(
            text_schema["properties"]["prompt"]["description"], "工作流的文本输入。"
        )
        self.assertEqual(image_field["title"], "图片 URL")
        self.assertEqual(image_field["description"], "输入图片的 URL。")
        self.assertEqual(video_list["title"], "视频片段")

    async def test_local_workflow_errors_are_chinese(self):
        with self.assertRaises(HTTPException) as context:
            await self.workflow_helper.get_workflow_def_helper("missing-id")

        self.assertEqual(context.exception.detail, "未找到工作流")

    async def test_openai_capabilities_hide_unsupported_nodes(self):
        os.environ["AI_PROVIDER"] = "openai-compatible"
        os.environ["OPENAI_BASE_URL"] = "https://example.com/v1"
        os.environ["OPENAI_API_KEY"] = "sk-test"
        os.environ["OPENAI_MODEL"] = "gpt-test"
        os.environ["AI_CAPABILITIES"] = '{"video": false, "audio": false, "image": false}'

        self.workflow_helper = importlib.reload(self.workflow_helper)
        schemas = await self.workflow_helper.get_node_schemas_helper("local-id")

        self.assertIn("openai-chat", schemas["categories"]["text"]["models"])
        openai_model = schemas["categories"]["text"]["models"]["openai-chat"]
        model_default = openai_model["input_schema"]["schemas"]["input_data"][
            "properties"
        ]["model"]["default"]
        self.assertEqual(model_default, "gpt-test")
        self.assertNotIn("video", schemas["categories"])
        self.assertNotIn("audio", schemas["categories"])
        self.assertNotIn("image", schemas["categories"])
        self.assertNotIn("video-combiner", schemas["categories"]["utility"]["models"])

    async def test_dynamic_cost_is_optional_with_local_provider(self):
        cost = await self.workflow_helper.calculate_dynamic_cost_helper(
            {"task_name": "text-passthrough", "payload": {"prompt": "hello"}}
        )

        self.assertEqual(cost, {"cost": None})

    async def test_router_regular_exception_uses_chinese_detail(self):
        from app.routers import workflow_router

        class BadRequest:
            async def json(self):
                raise ValueError("Invalid payload")

        with self.assertRaises(HTTPException) as context:
            await workflow_router.create_workflow(BadRequest())

        self.assertEqual(context.exception.status_code, 400)
        self.assertEqual(context.exception.detail, "请求处理失败，请稍后重试")
