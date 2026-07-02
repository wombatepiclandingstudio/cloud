import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import type { StoredModel } from '@kilocode/db';

jest.mock('@/lib/ai-gateway/providers/gateway-models-cache', () => ({
  getVercelModelsMetadata: jest.fn(),
  getOpenRouterModelsMetadata: jest.fn(),
}));

import {
  getOpenRouterModelsMetadata,
  getVercelModelsMetadata,
} from '@/lib/ai-gateway/providers/gateway-models-cache';
import { getModelUserByokProviders } from '@/lib/ai-gateway/byok';

const mockedGetVercelModelsMetadata = jest.mocked(getVercelModelsMetadata);
const mockedGetOpenRouterModelsMetadata = jest.mocked(getOpenRouterModelsMetadata);

function makeStoredModel(overrides: Partial<StoredModel> = {}): StoredModel {
  return {
    id: 'mock/model',
    name: 'Mock Model',
    type: 'language',
    endpoints: [],
    ...overrides,
  };
}

describe('getModelUserByokProviders', () => {
  beforeEach(() => {
    mockedGetVercelModelsMetadata.mockReset();
    mockedGetOpenRouterModelsMetadata.mockReset();
  });

  test('returns Novita for a model only present in OpenRouter metadata', async () => {
    mockedGetVercelModelsMetadata.mockResolvedValue({});
    mockedGetOpenRouterModelsMetadata.mockResolvedValue({
      'novita-only/model': makeStoredModel({
        id: 'novita-only/model',
        endpoints: [{ provider_name: 'Novita', tag: 'novita' }],
      }),
    });

    await expect(getModelUserByokProviders('novita-only/model')).resolves.toEqual(['novita']);
  });

  test('returns Novita for a model present in both Vercel and OpenRouter metadata', async () => {
    mockedGetVercelModelsMetadata.mockResolvedValue({
      'shared/model': makeStoredModel({
        id: 'shared/model',
        endpoints: [{ provider_name: 'novita' }],
      }),
    });
    mockedGetOpenRouterModelsMetadata.mockResolvedValue({
      'shared/model': makeStoredModel({
        id: 'shared/model',
        endpoints: [{ provider_name: 'Novita', tag: 'novita' }],
      }),
    });

    await expect(getModelUserByokProviders('shared/model')).resolves.toEqual(['novita']);
  });

  test('returns no providers for a Vercel embedding model with no OpenRouter counterpart', async () => {
    mockedGetVercelModelsMetadata.mockResolvedValue({
      'embed/model': makeStoredModel({
        id: 'embed/model',
        type: 'embedding',
        endpoints: [{ provider_name: 'novita' }],
      }),
    });
    mockedGetOpenRouterModelsMetadata.mockResolvedValue({});

    await expect(getModelUserByokProviders('embed/model')).resolves.toEqual([]);
  });
});
