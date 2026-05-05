import sys
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app


class FakeOpenAIProvider:
    kind = "openai-compatible"
    base_url = "https://example.com"
    api_key = "sk-test"

    def __init__(self):
        self.list_models_result = {
            "object": "list",
            "data": [
                {
                    "id": "gpt-test",
                    "object": "model",
                    "owned_by": "test",
                }
            ],
        }
        self.chat_result = {
            "id": "chatcmpl-test",
            "object": "chat.completion",
            "created": 1,
            "model": "gpt-test",
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": "hello",
                    },
                    "finish_reason": "stop",
                }
            ],
        }
        self.responses_result = {
            "id": "resp-test",
            "object": "response",
            "output": [
                {
                    "type": "message",
                    "role": "assistant",
                    "content": [
                        {
                            "type": "output_text",
                            "text": "hello",
                        }
                    ],
                }
            ],
        }

    async def list_models(self):
        return self.list_models_result

    async def chat_completions(self, payload, stream: bool = False):
        return self.chat_result

    async def responses(self, payload, stream: bool = False):
        return self.responses_result

    async def image_generation(self, payload):
        return {"data": []}


class FakeStreamingProvider(FakeOpenAIProvider):
    async def _stream_chunks(self):
        yield 'data: {"id":"chunk-test"}\n\n'
        yield "data: [DONE]\n\n"

    async def chat_completions(self, payload, stream: bool = False):
        if stream:
            return self._stream_chunks()
        return await super().chat_completions(payload, stream=stream)

    async def responses(self, payload, stream: bool = False):
        if stream:
            return self._stream_chunks()
        return await super().responses(payload, stream=stream)


class OpenAIRouterTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_models_endpoint_uses_provider(self):
        with patch("app.routers.openai_router.get_provider", return_value=FakeOpenAIProvider()):
            response = self.client.get("/v1/models")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["data"][0]["id"], "gpt-test")

    def test_chat_completions_endpoint_uses_provider(self):
        with patch("app.routers.openai_router.get_provider", return_value=FakeOpenAIProvider()):
            response = self.client.post(
                "/v1/chat/completions",
                json={
                    "model": "gpt-test",
                    "messages": [{"role": "user", "content": "hi"}],
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["choices"][0]["message"]["content"], "hello")

    def test_responses_endpoint_uses_provider(self):
        with patch("app.routers.openai_router.get_provider", return_value=FakeOpenAIProvider()):
            response = self.client.post(
                "/v1/responses",
                json={
                    "model": "gpt-test",
                    "input": "hi",
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["output"][0]["content"][0]["text"], "hello")

    def test_chat_completions_streams_sse_chunks(self):
        with patch("app.routers.openai_router.get_provider", return_value=FakeStreamingProvider()):
            response = self.client.post(
                "/v1/chat/completions",
                json={
                    "model": "gpt-test",
                    "stream": True,
                    "messages": [{"role": "user", "content": "hi"}],
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertIn("text/event-stream", response.headers["content-type"])
        self.assertIn('data: {"id":"chunk-test"}', response.text)
        self.assertIn("data: [DONE]", response.text)

    def test_responses_streams_sse_chunks(self):
        with patch("app.routers.openai_router.get_provider", return_value=FakeStreamingProvider()):
            response = self.client.post(
                "/v1/responses",
                json={
                    "model": "gpt-test",
                    "stream": True,
                    "input": "hi",
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertIn("text/event-stream", response.headers["content-type"])
        self.assertIn('data: {"id":"chunk-test"}', response.text)
        self.assertIn("data: [DONE]", response.text)
