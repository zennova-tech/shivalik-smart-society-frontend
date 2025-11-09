import { apiRequest } from './apiRequest';
import { getBuildingApi, normalizeBuildingResponse } from './building';
import { getSocietyId } from '../utils/societyUtils';

export interface Block {
  _id: string;
  name: string;
  building?: string | { _id: string; id?: string; [key: string]: any };
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | { _id: string; firstName: string; lastName: string; email: string };
  updatedBy?: string | { _id: string; firstName: string; lastName: string; email: string };
}

export interface BlockResponse {
  items: Block[];
  total: number;
  page: number;
  limit: number;
}

export interface GetBlocksParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  building?: string;
}

export interface AddBlockPayload {
  name: string;
  building?: string;
  status?: string;
  societyId?: string; // Optional: backend can auto-get building from society
}

export interface UpdateBlockPayload {
  id: string;
  name?: string;
  building?: string;
  status?: string;
  societyId?: string; // Optional: backend can auto-get building from society if needed
}

export interface DeleteBlockPayload {
  id: string;
  hard?: boolean;
}

export const getBlocksApi = async (params?: GetBlocksParams): Promise<BlockResponse> => {
  return await apiRequest<BlockResponse>({
    method: 'GET',
    url: 'blocks',
    params: params,
  });
};

export const getBlockByIdApi = async (id: string): Promise<Block> => {
  return await apiRequest<Block>({
    method: 'GET',
    url: `blocks/${id}`,
  });
};

export const addBlockApi = async (data: AddBlockPayload): Promise<Block> => {
  return await apiRequest<Block>({
    method: 'POST',
    url: 'blocks',
    data: data,
  });
};

export const updateBlockApi = async (data: UpdateBlockPayload): Promise<Block> => {
  const { id, ...updateData } = data;
  return await apiRequest<Block>({
    method: 'PUT',
    url: `blocks/${id}`,
    data: updateData,
  });
};

export const deleteBlockApi = async (data: DeleteBlockPayload): Promise<void> => {
  const params = data.hard ? { hard: 'true' } : {};
  return await apiRequest<void>({
    method: 'DELETE',
    url: `blocks/${data.id}`,
    params: params,
  });
};

/**
 * Fetch blocks filtered by society ID
 * This function fetches buildings for the society first, then fetches blocks for each building
 * @param params - Optional parameters for filtering blocks (status, limit, etc.)
 * @returns Promise with BlockResponse containing blocks for the society
 */
export const getBlocksBySocietyApi = async (params?: Omit<GetBlocksParams, 'building'>): Promise<BlockResponse> => {
  try {
    // Get society ID
    const societyId = getSocietyId();
    if (!societyId) {
      throw new Error('Society ID not found. Please select a society first.');
    }

    // Fetch buildings for the society
    const buildingResponse = await getBuildingApi(societyId);
    
    // Normalize building response to handle both 'item' (singular) and 'items' (plural) formats
    const buildings = normalizeBuildingResponse(buildingResponse);

    // Debug loggin
    // If no buildings found, return empty response
    // Blocks are associated with buildings, so no buildings = no blocks for this society
    if (buildings.length === 0) {
      console.warn('No buildings found for society:', societyId);
      console.warn('Returning empty blocks list (blocks must be associated with buildings)');
      return {
        items: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 500,
      };
    }

    // Get building IDs
    const buildingIds = buildings.map((b: any) => b._id || b.id).filter(Boolean);
    console.log('Building IDs:', buildingIds);

    if (buildingIds.length === 0) {
      console.warn('No valid building IDs found');
      return {
        items: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 500,
      };
    }

    // Fetch blocks for each building in parallel
    // Use max limit of 500 (backend limit) to get all blocks
    const maxLimit = Math.min(params?.limit || 500, 500);
    const blockPromises = buildingIds.map((buildingId: string) =>
      getBlocksApi({
        ...params,
        building: buildingId,
        limit: maxLimit, // Use max limit of 500 to get all blocks
      }).catch((error) => {
        console.error(`Error fetching blocks for building ${buildingId}:`, error);
        // Return empty response for this building
        return { items: [], total: 0, page: 1, limit: maxLimit };
      })
    );

    const blockResponses = await Promise.all(blockPromises);
    console.log('Block responses:', blockResponses);

    // Combine all blocks from all buildings
    const allBlocks: Block[] = [];
    blockResponses.forEach((response) => {
      if (response.items && response.items.length > 0) {
        allBlocks.push(...response.items);
      }
    });

    console.log('All blocks before filtering:', allBlocks.length);

    // Remove duplicates based on block _id
    const uniqueBlocks = Array.from(
      new Map(allBlocks.map((block) => [block._id, block])).values()
    );

    // Apply status filter if provided (since we're combining results)
    let filteredBlocks = uniqueBlocks;
    if (params?.status) {
      filteredBlocks = uniqueBlocks.filter((block) => block.status === params.status);
    }

    // Apply search query if provided
    if (params?.q) {
      const searchTerm = params.q.toLowerCase();
      filteredBlocks = filteredBlocks.filter(
        (block) => block.name?.toLowerCase().includes(searchTerm)
      );
    }

    console.log('Filtered blocks:', filteredBlocks.length);

    return {
      items: filteredBlocks,
      total: filteredBlocks.length,
      page: params?.page || 1,
      limit: maxLimit,
    };
  } catch (error: any) {
    console.error('Error fetching blocks by society:', error);
    throw error;
  }
};

