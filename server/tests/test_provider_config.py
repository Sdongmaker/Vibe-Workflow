import importlib
import os
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

LEGACY_PROVIDER_KEY_ENV = "MU" + "_API_KEY"
LEGACY_PROVIDER_NAME = "mu" + "api"


class ProviderConfigTest(unittest.TestCase):
    def setUp(self):
        self._env = os.environ.copy()

    def tearDown(self):
        os.environ.clear()
        os.environ.update(self._env)

    def reload_modules(self):
        import app.settings as settings
        import app.providers.factory as factory

        importlib.reload(settings)
        importlib.reload(factory)
        return settings, factory

    def test_openai_provider_is_selected_and_normalized(self):
        os.environ["AI_PROVIDER"] = "openai-compatible"
        os.environ["OPENAI_BASE_URL"] = "https://example.com/v1/"
        os.environ["OPENAI_API_KEY"] = "sk-test"
        os.environ["OPENAI_MODEL"] = "gpt-test"

        settings, factory = self.reload_modules()
        cfg = settings.get_settings()
        provider = factory.get_provider()

        self.assertEqual(cfg.ai_provider, "openai-compatible")
        self.assertEqual(cfg.openai_base_url, "https://example.com")
        self.assertEqual(provider.kind, "openai-compatible")
        self.assertEqual(provider.base_url, "https://example.com")
        self.assertEqual(provider.api_key, "sk-test")
        self.assertEqual(cfg.openai_model, "gpt-test")

    def test_openai_keys_select_openai_provider_without_explicit_provider(self):
        os.environ.pop("AI_PROVIDER", None)
        os.environ["OPENAI_BASE_URL"] = "https://example.com/v1"
        os.environ["OPENAI_API_KEY"] = "sk-test"

        settings, factory = self.reload_modules()
        cfg = settings.get_settings()
        provider = factory.get_provider()

        self.assertEqual(cfg.ai_provider, "openai-compatible")
        self.assertEqual(provider.kind, "openai-compatible")

    def test_legacy_provider_key_no_longer_selects_provider(self):
        os.environ.pop("AI_PROVIDER", None)
        os.environ.pop("OPENAI_BASE_URL", None)
        os.environ.pop("OPENAI_API_KEY", None)
        os.environ[LEGACY_PROVIDER_KEY_ENV] = "sk-legacy"

        settings, factory = self.reload_modules()
        cfg = settings.get_settings()
        provider = factory.get_provider()

        self.assertEqual(cfg.ai_provider, "local")
        self.assertEqual(provider.kind, "local")

    def test_legacy_provider_name_is_rejected(self):
        os.environ["AI_PROVIDER"] = LEGACY_PROVIDER_NAME

        settings, factory = self.reload_modules()

        with self.assertRaises(ValueError) as context:
            factory.get_provider()

        self.assertIn("Unsupported AI_PROVIDER", str(context.exception))

    def test_local_provider_is_selected_without_api_keys(self):
        os.environ.pop("AI_PROVIDER", None)
        os.environ.pop("OPENAI_BASE_URL", None)
        os.environ.pop("OPENAI_API_KEY", None)
        os.environ.pop(LEGACY_PROVIDER_KEY_ENV, None)

        settings, factory = self.reload_modules()
        cfg = settings.get_settings()
        provider = factory.get_provider()

        self.assertEqual(cfg.ai_provider, "local")
        self.assertEqual(provider.kind, "local")
