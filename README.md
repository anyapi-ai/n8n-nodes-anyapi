# n8n-nodes-anyapi.ai

[n8n](https://n8n.io/) community node for [AnyAPI.ai](https://anyapi.ai) — a unified AI gateway providing access to 300+ LLM models through a single API.

## Features

- **Chat Completions** — Send messages to any supported model (GPT-4o, Claude, Gemini, Llama, etc.)
- **Embeddings** — Generate text embeddings
- **Image Generation** — Create images
- **Model Listing** — Browse all available models

## Installation

1. Open the **Nodes panel** in your n8n workflow
2. Search for **AnyAPI**
3. Click **Install** on the community node

For self-hosted n8n, you can also install via **Settings > Community Nodes** and enter `n8n-nodes-anyapi.ai`.

## Credentials

You need an AnyAPI API key:

1. Sign up at [anyapi.ai](https://anyapi.ai)
2. Go to the Dashboard and copy your API key
3. In n8n, create new **AnyAPI** credentials with your API key

## Usage Example

### Chat Completion

1. Add the **AnyAPI** node to your workflow
2. Set **Resource** to `Chat` and **Operation** to `Completions`
3. Choose a **Model**, for example `openai/gpt-4o`
4. Under **Messages**, add one item:
   - **Role**: `user`
   - **Content**: `What is the capital of France?`
5. Execute the node

The node returns the model's response in the output JSON, including the generated message, token usage, and model metadata — ready to be passed to the next node in your workflow.

## Resources

- [AnyAPI Documentation](https://docs.anyapi.ai)
- [n8n Community Nodes Docs](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)