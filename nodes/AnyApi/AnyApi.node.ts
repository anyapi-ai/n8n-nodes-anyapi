import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
	NodeApiError,
} from 'n8n-workflow';

export class AnyApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AnyAPI',
		name: 'anyApi',
		icon: 'file:anyapi.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with 300+ AI models via AnyAPI.ai gateway',
		defaults: {
			name: 'AnyAPI',
		},
		inputs: ['main'] as any,
		outputs: ['main'] as any,
		credentials: [
			{
				name: 'anyApiCredentials',
				required: true,
			},
		],
		properties: [
			// --- Resource ---
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Chat', value: 'chat' },
					{ name: 'Embedding', value: 'embedding' },
					{ name: 'Image', value: 'image' },
					{ name: 'Model', value: 'model' },
				],
				default: 'chat',
			},

			// --- Operations ---
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['chat'] } },
				options: [
					{ name: 'Complete', value: 'complete', description: 'Create a chat completion', action: 'Create a chat completion' },
				],
				default: 'complete',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['embedding'] } },
				options: [
					{ name: 'Create', value: 'create', description: 'Create embeddings', action: 'Create embeddings' },
				],
				default: 'create',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['image'] } },
				options: [
					{ name: 'Generate', value: 'generate', description: 'Generate an image', action: 'Generate an image' },
				],
				default: 'generate',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['model'] } },
				options: [
					{ name: 'List', value: 'list', description: 'List available models', action: 'List available models' },
				],
				default: 'list',
			},

			// ============================
			// Chat Completion fields
			// ============================
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: 'openai/gpt-4o',
				required: true,
				displayOptions: { show: { resource: ['chat'], operation: ['complete'] } },
				description: 'Model ID (e.g. openai/gpt-4o, anthropic/claude-sonnet-4-20250514, google/gemini-2.0-flash)',
			},
			{
				displayName: 'Messages',
				name: 'messages',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				displayOptions: { show: { resource: ['chat'], operation: ['complete'] } },
				default: { messageValues: [{ role: 'user', content: '' }] },
				options: [
					{
						name: 'messageValues',
						displayName: 'Message',
						values: [
							{
								displayName: 'Role',
								name: 'role',
								type: 'options',
								options: [
									{ name: 'System', value: 'system' },
									{ name: 'User', value: 'user' },
									{ name: 'Assistant', value: 'assistant' },
								],
								default: 'user',
							},
							{
								displayName: 'Content',
								name: 'content',
								type: 'string',
								typeOptions: { rows: 4 },
								default: '',
							},
						],
					},
				],
				description: 'The messages to send to the model',
			},
			{
				displayName: 'Simplified Output',
				name: 'simplifiedOutput',
				type: 'boolean',
				default: true,
				displayOptions: { show: { resource: ['chat'], operation: ['complete'] } },
				description: 'Whether to return only the message content instead of the full API response',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: { show: { resource: ['chat'], operation: ['complete'] } },
				options: [
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						typeOptions: { minValue: 0, maxValue: 2, numberStepSize: 0.1 },
						default: 1,
						description: 'Sampling temperature (0-2). Lower = more focused, higher = more creative.',
					},
					{
						displayName: 'Max Tokens',
						name: 'max_tokens',
						type: 'number',
						typeOptions: { minValue: 1 },
						default: 4096,
						description: 'Maximum number of tokens to generate',
					},
					{
						displayName: 'Top P',
						name: 'top_p',
						type: 'number',
						typeOptions: { minValue: 0, maxValue: 1, numberStepSize: 0.1 },
						default: 1,
					},
					{
						displayName: 'Trace ID',
						name: 'trace_id',
						type: 'string',
						default: '',
						description: 'Custom trace ID for request tracking in AnyAPI dashboard',
					},
					{
						displayName: 'JSON Mode',
						name: 'jsonMode',
						type: 'boolean',
						default: false,
						description: 'Whether to force the model to output valid JSON',
					},
					{
						displayName: 'Web Search',
						name: 'webSearch',
						type: 'boolean',
						default: false,
						description: 'Whether to enable web search grounding for the model',
					},
					{
						displayName: 'Web Search Context Size',
						name: 'webSearchContextSize',
						type: 'options',
						options: [
							{ name: 'Low', value: 'low' },
							{ name: 'Medium', value: 'medium' },
							{ name: 'High', value: 'high' },
						],
						default: 'medium',
						description: 'How much web search context to include',
					},
					{
						displayName: 'Assistant Prefill',
						name: 'assistantPrefill',
						type: 'string',
						typeOptions: { rows: 3 },
						default: '',
						description: 'Prefill the assistant response (Anthropic models). The model will continue from this text.',
					},
					{
						displayName: 'Function Calling',
						name: 'functionCalling',
						type: 'json',
						typeOptions: { rows: 6 },
						default: '',
						description: 'JSON array of tool/function definitions for the model to call',
					},
					{
						displayName: 'Parallel Function Calling',
						name: 'parallelFunctionCalling',
						type: 'boolean',
						default: true,
						description: 'Whether to allow the model to call multiple functions in parallel',
					},
					{
						displayName: 'Prompt Caching',
						name: 'promptCaching',
						type: 'boolean',
						default: false,
						description: 'Whether to enable prompt caching for reduced latency and cost on repeated prompts',
					},
					{
						displayName: 'Reasoning',
						name: 'reasoning',
						type: 'boolean',
						default: false,
						description: 'Whether to enable extended thinking/reasoning (for supported models like o1, Claude with thinking)',
					},
					{
						displayName: 'Reasoning Budget',
						name: 'reasoningBudget',
						type: 'number',
						typeOptions: { minValue: 1024 },
						default: 4096,
						description: 'Max tokens for reasoning/thinking steps',
					},
					{
						displayName: 'Streaming',
						name: 'streaming',
						type: 'boolean',
						default: false,
						description: 'Whether to stream the response (returns full response after stream completes)',
					},
					{
						displayName: 'Tool Choice',
						name: 'toolChoice',
						type: 'options',
						options: [
							{ name: 'Auto', value: 'auto' },
							{ name: 'None', value: 'none' },
							{ name: 'Required', value: 'required' },
						],
						default: 'auto',
						description: 'Controls how the model uses tools/functions',
					},
					{
						displayName: 'URL Context',
						name: 'urlContext',
						type: 'string',
						default: '',
						description: 'URL to fetch and include as context for the model',
					},
				],
			},

			// ============================
			// Embedding fields
			// ============================
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: 'amazon/nova-2-multimodal-embeddings',
				required: true,
				displayOptions: { show: { resource: ['embedding'], operation: ['create'] } },
				description: 'Embedding model ID',
			},
			{
				displayName: 'Input Text',
				name: 'input',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				required: true,
				displayOptions: { show: { resource: ['embedding'], operation: ['create'] } },
				description: 'Text to generate embeddings for',
			},

			// ============================
			// Image Generation fields
			// ============================
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: 'google/gemini-3-pro-image-preview',
				required: true,
				displayOptions: { show: { resource: ['image'], operation: ['generate'] } },
				description: 'Image generation model ID',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				required: true,
				displayOptions: { show: { resource: ['image'], operation: ['generate'] } },
				description: 'Text description of the image to generate',
			},
			{
				displayName: 'Image Options',
				name: 'imageOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: { show: { resource: ['image'], operation: ['generate'] } },
				options: [
					{
						displayName: 'Size',
						name: 'size',
						type: 'options',
						options: [
							{ name: '256x256', value: '256x256' },
							{ name: '512x512', value: '512x512' },
							{ name: '1024x1024', value: '1024x1024' },
							{ name: '1024x1792', value: '1024x1792' },
							{ name: '1792x1024', value: '1792x1024' },
						],
						default: '1024x1024',
					},
					{
						displayName: 'Quality',
						name: 'quality',
						type: 'options',
						options: [
							{ name: 'Standard', value: 'standard' },
							{ name: 'HD', value: 'hd' },
						],
						default: 'standard',
					},
					{
						displayName: 'Number of Images',
						name: 'n',
						type: 'number',
						typeOptions: { minValue: 1, maxValue: 10 },
						default: 1,
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('anyApiCredentials');
		const baseUrl = credentials.baseUrl as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				if (resource === 'chat' && operation === 'complete') {
					const model = this.getNodeParameter('model', i) as string;
					const messagesRaw = this.getNodeParameter('messages.messageValues', i, []) as Array<{
						role: string;
						content: string;
					}>;
					const simplifiedOutput = this.getNodeParameter('simplifiedOutput', i, true) as boolean;
					const options = this.getNodeParameter('options', i, {}) as {
						temperature?: number;
						max_tokens?: number;
						top_p?: number;
						trace_id?: string;
						jsonMode?: boolean;
						webSearch?: boolean;
						webSearchContextSize?: string;
						assistantPrefill?: string;
						functionCalling?: string;
						parallelFunctionCalling?: boolean;
						promptCaching?: boolean;
						reasoning?: boolean;
						reasoningBudget?: number;
						streaming?: boolean;
						toolChoice?: string;
						urlContext?: string;
					};

					const messages = messagesRaw.map((m) => ({ role: m.role, content: m.content }));

					// Assistant Prefill — append partial assistant message
					if (options.assistantPrefill) {
						messages.push({ role: 'assistant', content: options.assistantPrefill });
					}

					const body: Record<string, unknown> = { model, messages };

					if (options.temperature !== undefined) body.temperature = options.temperature;
					if (options.max_tokens !== undefined) body.max_tokens = options.max_tokens;
					if (options.top_p !== undefined) body.top_p = options.top_p;
					if (options.streaming) body.stream = true;

					if (options.jsonMode) {
						body.response_format = { type: 'json_object' };
					}

					// Reasoning / Extended Thinking
					if (options.reasoning) {
						body.reasoning_effort = 'high';
						if (options.reasoningBudget) {
							body.max_completion_tokens = options.reasoningBudget;
						}
					}

					// Prompt Caching
					if (options.promptCaching) {
						body.cache_control = { type: 'ephemeral' };
					}

					// Tools: Web Search + Function Calling
					const tools: Array<Record<string, unknown>> = [];

					if (options.webSearch) {
						const searchTool: Record<string, unknown> = { type: 'web_search_preview' };
						if (options.webSearchContextSize) {
							searchTool.search_context_size = options.webSearchContextSize;
						}
						tools.push(searchTool);
					}

					if (options.urlContext) {
						tools.push({
							type: 'url_context',
							url: options.urlContext,
						});
					}

					if (options.functionCalling) {
						try {
							const functions = JSON.parse(options.functionCalling);
							if (Array.isArray(functions)) {
								tools.push(...functions);
							}
						} catch (_) {
							// Invalid JSON — skip
						}
					}

					if (tools.length > 0) {
						body.tools = tools;
					}

					// Tool Choice
					if (options.toolChoice && options.toolChoice !== 'auto') {
						body.tool_choice = options.toolChoice;
					}

					// Parallel Function Calling
					if (options.parallelFunctionCalling === false) {
						body.parallel_tool_calls = false;
					}

					const metadata: Record<string, string> = {};
					if (options.trace_id) metadata.trace_id = options.trace_id;
					if (Object.keys(metadata).length > 0) {
						body.metadata = metadata;
					}

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'anyApiCredentials',
						{
							method: 'POST',
							url: `${baseUrl}/chat/completions`,
							body,
							json: true,
						},
					);

					if (simplifiedOutput) {
						const choice = response.choices?.[0];
						returnData.push({
							json: {
								content: choice?.message?.content ?? '',
								role: choice?.message?.role ?? 'assistant',
								model: response.model,
								usage: response.usage,
							},
						});
					} else {
						returnData.push({ json: response as IDataObject });
					}
				}

				if (resource === 'embedding' && operation === 'create') {
					const model = this.getNodeParameter('model', i) as string;
					const input = this.getNodeParameter('input', i) as string;

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'anyApiCredentials',
						{
							method: 'POST',
							url: `${baseUrl}/embeddings`,
							body: { model, input },
							json: true,
						},
					);

					returnData.push({ json: response as IDataObject });
				}

				if (resource === 'image' && operation === 'generate') {
					const model = this.getNodeParameter('model', i) as string;
					const prompt = this.getNodeParameter('prompt', i) as string;
					const imageOptions = this.getNodeParameter('imageOptions', i, {}) as {
						size?: string;
						quality?: string;
						n?: number;
					};

					const body: Record<string, unknown> = { model, prompt };
					if (imageOptions.size) body.size = imageOptions.size;
					if (imageOptions.quality) body.quality = imageOptions.quality;
					if (imageOptions.n) body.n = imageOptions.n;

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'anyApiCredentials',
						{
							method: 'POST',
							url: `${baseUrl}/images/generations`,
							body,
							json: true,
						},
					);

					returnData.push({ json: response as IDataObject });
				}

				if (resource === 'model' && operation === 'list') {
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'anyApiCredentials',
						{
							method: 'GET',
							url: `${baseUrl}/models`,
							json: true,
						},
					);

					const models = (response as { data?: IDataObject[] }).data ?? [];
					for (const model of models) {
						returnData.push({ json: model });
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject);
			}
		}

		return [returnData];
	}
}