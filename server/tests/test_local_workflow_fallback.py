import importlib
import os
import tempfile
import unittest
from unittest.mock import Mock, patch

from fastapi import HTTPException


class LocalWorkflowFallbackTest(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.tempdir = tempfile.TemporaryDirectory()
        os.environ["LOCAL_WORKFLOW_STORE"] = os.path.join(
            self.tempdir.name, "workflows.json"
        )

        from app.utils import workflow_helper

        self.workflow_helper = importlib.reload(workflow_helper)
        self.workflow_helper.MU_API_KEY = "your_api_key_here"

    async def asyncTearDown(self):
        self.tempdir.cleanup()

    async def test_create_and_fetch_workflow_without_real_muapi_key(self):
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

    async def test_node_schemas_are_available_without_real_muapi_key(self):
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
        with self.assertRaises(Exception) as context:
            await self.workflow_helper.get_workflow_def_helper("missing-id")

        self.assertEqual(context.exception.detail, "未找到工作流")

    async def test_missing_muapi_key_error_is_chinese(self):
        with self.assertRaises(Exception) as context:
            await self.workflow_helper.get_api_key()

        self.assertEqual(
            context.exception.detail,
            "请先在 .env 中配置 MU_API_KEY，才能使用工作流服务",
        )

    async def test_dynamic_cost_is_available_without_real_muapi_key(self):
        cost = await self.workflow_helper.calculate_dynamic_cost_helper(
            {"task_name": "text-passthrough", "payload": {"prompt": "hello"}}
        )

        self.assertEqual(cost, {"cost": 0})

    async def test_remote_english_detail_is_not_returned_to_user(self):
        self.workflow_helper.MU_API_KEY = "real-test-key"

        response = Mock()
        response.status_code = 404
        response.content = b'{"detail":"Workflow not found"}'
        response.json.return_value = {"detail": "Workflow not found"}

        with patch("httpx.AsyncClient") as client_class:
            client = client_class.return_value.__aenter__.return_value
            client.get.return_value = response

            with self.assertRaises(HTTPException) as context:
                await self.workflow_helper.proxy_request_helper(
                    "GET", "https://example.test/workflow"
                )

        self.assertEqual(context.exception.status_code, 404)
        self.assertEqual(context.exception.detail, "未找到工作流")

    async def test_remote_common_english_details_are_localized(self):
        cases = [
            ("Invalid API key provided", "API Key 无效，请检查配置"),
            ("Unauthorized request", "认证失败，请检查 API Key"),
            ("Forbidden", "无权访问该资源"),
            ("Rate limit reached for this API key", "请求过于频繁，请稍后重试"),
            ("Quota exceeded", "服务额度已用尽，请检查配额或稍后重试"),
            ("Request timed out", "远程服务响应超时，请稍后重试"),
            ("Connection refused", "连接远程服务失败，请稍后重试"),
            ("Bad request: missing input", "请求参数不正确，请检查后重试"),
            ("Validation error", "请求参数校验失败，请检查后重试"),
            ("Permission denied", "没有权限执行该操作"),
            ("Workflow is not editable", "当前工作流不可编辑"),
            ("Workflow failed during execution", "工作流执行失败，请稍后重试"),
        ]

        for detail, expected in cases:
            with self.subTest(detail=detail):
                self.assertEqual(
                    self.workflow_helper.localize_remote_detail(detail),
                    expected,
                )

    async def test_remote_structured_detail_is_localized(self):
        self.assertEqual(
            self.workflow_helper.localize_remote_detail(
                {"error": {"message": "Invalid API key"}}
            ),
            "API Key 无效，请检查配置",
        )
        self.assertEqual(
            self.workflow_helper.localize_remote_detail(
                [{"msg": "field required"}, {"message": "Validation failed"}]
            ),
            "请求参数校验失败，请检查后重试",
        )

    async def test_remote_plain_text_error_is_localized(self):
        self.workflow_helper.MU_API_KEY = "real-test-key"

        response = Mock()
        response.status_code = 429
        response.content = b"Rate limit exceeded"
        response.text = "Rate limit exceeded"
        response.json.side_effect = ValueError("not json")

        with patch("httpx.AsyncClient") as client_class:
            client = client_class.return_value.__aenter__.return_value
            client.post.return_value = response

            with self.assertRaises(HTTPException) as context:
                await self.workflow_helper.proxy_request_helper(
                    "POST", "https://example.test/workflow", {}
                )

        self.assertEqual(context.exception.status_code, 429)
        self.assertEqual(context.exception.detail, "请求过于频繁，请稍后重试")

    async def test_router_regular_exception_uses_chinese_detail(self):
        from app.routers import workflow_router

        class BadRequest:
            async def json(self):
                raise ValueError("Invalid payload")

        with self.assertRaises(HTTPException) as context:
            await workflow_router.create_workflow(BadRequest())

        self.assertEqual(context.exception.status_code, 400)
        self.assertEqual(context.exception.detail, "请求处理失败，请稍后重试")
