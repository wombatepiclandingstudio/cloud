import { describe, test, expect, jest } from '@jest/globals';
import type { StoredModel } from '@kilocode/db';

jest.mock('@/lib/ai-gateway/providers/gateway-models-cache', () => ({
  getVercelModelsMetadata: jest.fn(),
  getOpenRouterModelsMetadata: jest.fn(),
}));

jest.mock('@/lib/ai-gateway/providers/direct-byok/direct-byok-definitions', () => ({
  __esModule: true,
  default: [],
}));

import {
  getVercelModelsMetadata,
  getOpenRouterModelsMetadata,
} from '@/lib/ai-gateway/providers/gateway-models-cache';
import { byokRouter } from '@/routers/byok-router';

const mockedGetVercelModelsMetadata = jest.mocked(getVercelModelsMetadata);
const mockedGetOpenRouterModelsMetadata = jest.mocked(getOpenRouterModelsMetadata);

type SupportedModels = Record<string, string[]>;

async function callListSupportedModels(): Promise<SupportedModels> {
  const caller = byokRouter.createCaller({} as never);
  return caller.listSupportedModels();
}

function makeStoredModel(overrides: Partial<StoredModel> = {}): StoredModel {
  return {
    id: 'mock/model',
    name: 'Mock Model',
    type: 'language',
    endpoints: [],
    ...overrides,
  };
}

describe('byok.listSupportedModels', () => {
  test('includes a Novita-served model that only exists in OpenRouter metadata', async () => {
    mockedGetVercelModelsMetadata.mockResolvedValue({
      'unrelated/vercel-model': makeStoredModel({
        id: 'unrelated/vercel-model',
        name: 'Unrelated Vercel Model',
        endpoints: [{ provider_name: 'novita' }],
      }),
    });
    mockedGetOpenRouterModelsMetadata.mockResolvedValue({
      'novita-only/some-model': makeStoredModel({
        id: 'novita-only/some-model',
        name: 'Some Model',
        endpoints: [{ provider_name: 'Novita', tag: 'novita' }],
      }),
    });

    const result = await callListSupportedModels();

    expect(result.novita).toEqual([
      'Some Model (novita-only/some-model)',
      'Unrelated Vercel Model (unrelated/vercel-model)',
    ]);
  });

  test('includes a Novita-served model that exists in both Vercel and OpenRouter metadata', async () => {
    mockedGetVercelModelsMetadata.mockResolvedValue({
      'shared/model': makeStoredModel({
        id: 'shared/model',
        name: 'Shared Model',
        endpoints: [{ provider_name: 'novita' }],
      }),
    });
    mockedGetOpenRouterModelsMetadata.mockResolvedValue({
      'shared/model': makeStoredModel({
        id: 'shared/model',
        name: 'Shared Model',
        endpoints: [{ provider_name: 'Novita', tag: 'novita' }],
      }),
    });

    const result = await callListSupportedModels();

    expect(result.novita).toEqual(['Shared Model (shared/model)']);
  });

  test('still excludes non-language Vercel models from supported providers', async () => {
    mockedGetVercelModelsMetadata.mockResolvedValue({
      'embed-model': makeStoredModel({
        id: 'embed-model',
        name: 'Embed Model',
        type: 'embedding',
        endpoints: [{ provider_name: 'novita' }],
      }),
    });
    mockedGetOpenRouterModelsMetadata.mockResolvedValue({});

    const result = await callListSupportedModels();

    expect(result.novita).toBeUndefined();
  });
});
