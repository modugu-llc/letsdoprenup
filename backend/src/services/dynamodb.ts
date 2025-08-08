import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  UpdateCommand, 
  DeleteCommand, 
  QueryCommand,
  ScanCommand,
  BatchWriteCommand,
  BatchGetCommand 
} from '@aws-sdk/lib-dynamodb';
import { config } from '../utils/config';
import { logger } from '../utils/logger';

// DynamoDB Client Configuration
const dynamoDBClient = new DynamoDBClient({
  region: config.dynamodb.region,
  ...(config.dynamodb.endpoint && { endpoint: config.dynamodb.endpoint }),
  ...(config.nodeEnv === 'development' && {
    credentials: {
      accessKeyId: config.dynamodb.accessKeyId,
      secretAccessKey: config.dynamodb.secretAccessKey
    }
  })
});

const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

// Entity Types
export enum EntityType {
  USER = 'USER',
  PRENUP = 'PRENUP',
  FINANCIAL_DISCLOSURE = 'FINANCIAL_DISCLOSURE',
  DOCUMENT = 'DOCUMENT',
  SIGNATURE = 'SIGNATURE',
  PARTNER_INVITATION = 'PARTNER_INVITATION'
}

// Base interfaces for all entities
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: string; // V0, V1, V2, etc.
  entityType: EntityType;
}

// Version Management Utilities
export const createPartitionKey = (entityType: EntityType, id: string): string => 
  `${entityType}#${id}`;

export const LATEST_VERSION = 'V0';

export const createVersionKey = (versionNumber?: number): string => {
  if (versionNumber === undefined) return LATEST_VERSION;
  return `V${versionNumber}`;
};

export const parseVersionNumber = (versionKey: string): number => {
  return parseInt(versionKey.substring(1));
};

// DynamoDB Service Class
export class DynamoDBService {
  private tableName: string;

  constructor() {
    this.tableName = config.dynamodb.tableName;
  }

  // Generic CRUD Operations with Versioning

  async create<T extends BaseEntity>(entity: Omit<T, 'createdAt' | 'updatedAt' | 'version'>): Promise<T> {
    const now = new Date().toISOString();
    const entityWithMeta: T = {
      ...entity,
      createdAt: now,
      updatedAt: now,
      version: LATEST_VERSION
    } as T;

    const pk = createPartitionKey(entity.entityType, entity.id);
    
    const params = {
      TableName: this.tableName,
      Item: {
        PK: pk,
        SK: LATEST_VERSION,
        ...entityWithMeta
      }
    };

    try {
      await docClient.send(new PutCommand(params));
      logger.info(`Created entity: ${pk}#${LATEST_VERSION}`);
      return entityWithMeta;
    } catch (error) {
      logger.error(`Error creating entity ${pk}:`, error);
      throw error;
    }
  }

  async getById<T extends BaseEntity>(
    entityType: EntityType, 
    id: string, 
    version: string = LATEST_VERSION
  ): Promise<T | null> {
    const pk = createPartitionKey(entityType, id);
    
    const params = {
      TableName: this.tableName,
      Key: {
        PK: pk,
        SK: version
      }
    };

    try {
      const result = await docClient.send(new GetCommand(params));
      if (!result.Item) return null;

      // Remove DynamoDB keys from response
      const { PK, SK, ...entity } = result.Item;
      return entity as T;
    } catch (error) {
      logger.error(`Error getting entity ${pk}#${version}:`, error);
      throw error;
    }
  }

  async update<T extends BaseEntity>(
    entityType: EntityType,
    id: string,
    updates: Partial<Omit<T, 'id' | 'createdAt' | 'entityType'>>,
    createNewVersion: boolean = true
  ): Promise<T> {
    const pk = createPartitionKey(entityType, id);
    
    // Get current version
    const current = await this.getById<T>(entityType, id);
    if (!current) {
      throw new Error(`Entity ${pk} not found`);
    }

    const now = new Date().toISOString();
    
    if (createNewVersion) {
      // Archive current version
      const nextVersion = this.getNextVersionKey(current.version);
      await this.archiveVersion(pk, current);
      
      // Create new latest version
      const updatedEntity: T = {
        ...current,
        ...updates,
        updatedAt: now,
        version: LATEST_VERSION
      } as T;

      await docClient.send(new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: pk,
          SK: LATEST_VERSION,
          ...updatedEntity
        }
      }));

      logger.info(`Updated entity with new version: ${pk}#${LATEST_VERSION}`);
      return updatedEntity;
    } else {
      // Update in place (for non-versioned updates like metadata)
      const updateExpression = this.buildUpdateExpression(updates);
      const params = {
        TableName: this.tableName,
        Key: { PK: pk, SK: LATEST_VERSION },
        UpdateExpression: updateExpression.expression,
        ExpressionAttributeNames: updateExpression.names,
        ExpressionAttributeValues: updateExpression.values,
        ReturnValues: 'ALL_NEW' as const
      };

      const result = await docClient.send(new UpdateCommand(params));
      const { PK, SK, ...entity } = result.Attributes!;
      return entity as T;
    }
  }

  async delete(entityType: EntityType, id: string): Promise<void> {
    const pk = createPartitionKey(entityType, id);
    
    // Get all versions of the entity
    const versions = await this.getAllVersions(pk);
    
    // Delete all versions
    const deletePromises = versions.map(version => 
      docClient.send(new DeleteCommand({
        TableName: this.tableName,
        Key: { PK: pk, SK: version.SK }
      }))
    );

    await Promise.all(deletePromises);
    logger.info(`Deleted all versions of entity: ${pk}`);
  }

  async queryByEntityType<T extends BaseEntity>(
    entityType: EntityType,
    limit?: number,
    lastKey?: any
  ): Promise<{ items: T[], lastKey?: any }> {
    const params = {
      TableName: this.tableName,
      FilterExpression: '#entityType = :entityType AND #sk = :version',
      ExpressionAttributeNames: {
        '#entityType': 'entityType',
        '#sk': 'SK'
      },
      ExpressionAttributeValues: {
        ':entityType': entityType,
        ':version': LATEST_VERSION
      },
      ...(limit && { Limit: limit }),
      ...(lastKey && { ExclusiveStartKey: lastKey })
    };

    try {
      const result = await docClient.send(new ScanCommand(params));
      const items = (result.Items || []).map(item => {
        const { PK, SK, ...entity } = item;
        return entity as T;
      });

      return {
        items,
        lastKey: result.LastEvaluatedKey
      };
    } catch (error) {
      logger.error(`Error querying by entity type ${entityType}:`, error);
      throw error;
    }
  }

  async queryRelatedEntities<T extends BaseEntity>(
    parentType: EntityType,
    parentId: string,
    relatedType: EntityType
  ): Promise<T[]> {
    // For related entities, we can use a GSI or scan with filters
    // This is a simplified approach - in production you'd want GSI
    const params = {
      TableName: this.tableName,
      FilterExpression: '#entityType = :relatedType AND #sk = :version AND contains(#data, :parentId)',
      ExpressionAttributeNames: {
        '#entityType': 'entityType',
        '#sk': 'SK',
        '#data': 'data' // Assuming we store related IDs in a 'data' field
      },
      ExpressionAttributeValues: {
        ':relatedType': relatedType,
        ':version': LATEST_VERSION,
        ':parentId': parentId
      }
    };

    const result = await docClient.send(new ScanCommand(params));
    return (result.Items || []).map(item => {
      const { PK, SK, ...entity } = item;
      return entity as T;
    });
  }

  // Version Management Helper Methods
  
  private async archiveVersion<T extends BaseEntity>(pk: string, entity: T): Promise<void> {
    const nextVersionKey = this.getNextVersionKey(entity.version);
    await docClient.send(new PutCommand({
      TableName: this.tableName,
      Item: {
        PK: pk,
        SK: nextVersionKey,
        ...entity,
        version: nextVersionKey
      }
    }));
    logger.info(`Archived version: ${pk}#${nextVersionKey}`);
  }

  private getNextVersionKey(currentVersion: string): string {
    if (currentVersion === LATEST_VERSION) {
      return 'V1';
    }
    const versionNum = parseVersionNumber(currentVersion);
    return createVersionKey(versionNum + 1);
  }

  private async getAllVersions(pk: string): Promise<any[]> {
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': pk
      }
    };

    const result = await docClient.send(new QueryCommand(params));
    return result.Items || [];
  }

  private buildUpdateExpression(updates: Record<string, any>) {
    const names: Record<string, string> = {};
    const values: Record<string, any> = {};
    const expressions: string[] = [];

    Object.entries(updates).forEach(([key, value], index) => {
      const nameKey = `#attr${index}`;
      const valueKey = `:val${index}`;
      
      names[nameKey] = key;
      values[valueKey] = value;
      expressions.push(`${nameKey} = ${valueKey}`);
    });

    // Always update the updatedAt timestamp
    names['#updatedAt'] = 'updatedAt';
    values[':updatedAt'] = new Date().toISOString();
    expressions.push('#updatedAt = :updatedAt');

    return {
      expression: `SET ${expressions.join(', ')}`,
      names,
      values
    };
  }
}

// Singleton instance
export const dynamodbService = new DynamoDBService();