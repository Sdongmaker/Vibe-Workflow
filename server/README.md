# FastAPI Backend

This is the backend server built with FastAPI.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

Start the development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive API docs: http://localhost:8000/docs
- Alternative API docs: http://localhost:8000/redoc

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint

## Provider Configuration

Secrets are read from server environment variables only. The browser never stores provider API keys.

Selection order:

1. `AI_PROVIDER=openai-compatible`
2. `OPENAI_BASE_URL` + `OPENAI_API_KEY`
3. Local fallback

OpenAI-compatible example:

```bash
AI_PROVIDER=openai-compatible
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

`OPENAI_BASE_URL` can include or omit `/v1`. The provider normalizes it internally. Legacy vendor-specific provider modes are no longer supported; use an OpenAI-compatible provider or local fallback.

## OpenAI-Compatible Routes

- `GET /v1/models`
- `POST /v1/chat/completions`
- `POST /v1/responses`

The routes use standard `Authorization: Bearer` upstream authentication through the configured provider. Streaming chat and responses are proxied as SSE chunks.

## Workflow And Media

Workflow builder routes remain under `/api/workflow/*`. Node schemas are generated from provider capabilities, so unsupported capabilities such as video or audio are hidden instead of advertised.

Uploaded assets are stored locally by default:

```bash
MEDIA_STORAGE_DIR=./media
MEDIA_BASE_URL=/media
```

Dynamic pricing is optional. Providers without pricing return `{"cost": null}` so the frontend can omit cost display without failing.
