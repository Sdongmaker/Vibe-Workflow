import importlib
import os
import tempfile
import unittest


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
                "name": "Untitled Workflow",
                "edges": [],
                "data": {"nodes": []},
            }
        )

        self.assertIn("workflow_id", created)

        workflows = await self.workflow_helper.get_workflow_defs_helper()
        self.assertEqual(len(workflows), 1)
        self.assertEqual(workflows[0]["id"], created["workflow_id"])
        self.assertEqual(workflows[0]["name"], "Untitled Workflow")

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
