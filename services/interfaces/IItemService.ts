/**
 * Item Service Interface
 * 
 * Defines the contract for item-related operations.
 * Allows for easy swapping of implementations and mocking in tests.
 * 
 * Note: This interface combines read and write operations for backward compatibility.
 * For ISP compliance, prefer using IItemReader or IItemWriter separately when possible.
 */

import type { Item, NewItemInput } from '@/types';
import type { IItemReader } from './IItemReader';
import type { IItemWriter } from './IItemWriter';

/**
 * Result type for operations that may return different data formats
 */
export type ItemServiceResult<T> = 
  | { via: 'sdk'; data: T }
  | { via: 'rest'; data: T };

/**
 * Item Service Interface
 * 
 * Combines IItemReader and IItemWriter for backward compatibility.
 * Implements both interfaces to support components that need both read and write operations.
 */
export interface IItemService extends IItemReader, IItemWriter {}

