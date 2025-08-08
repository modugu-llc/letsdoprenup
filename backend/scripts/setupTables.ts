#!/usr/bin/env ts-node
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  CreateTableCommand, 
  DescribeTableCommand, 
  DeleteTableCommand,
  ListTablesCommand 
} from '@aws-sdk/client-dynamodb';
import { config } from '../src/utils/config';

const dynamoDBClient = new DynamoDBClient({
  region: config.dynamodb.region,
  endpoint: config.dynamodb.endpoint,
  credentials: {
    accessKeyId: config.dynamodb.accessKeyId,
    secretAccessKey: config.dynamodb.secretAccessKey
  }
});

const TABLE_NAME = config.dynamodb.tableName;

async function setupTables() {
  try {
    console.log(`Setting up DynamoDB table: ${TABLE_NAME}`);
    
    // Check if table already exists
    try {
      await dynamoDBClient.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
      console.log(`Table ${TABLE_NAME} already exists. Deleting and recreating...`);
      
      // Delete existing table
      await dynamoDBClient.send(new DeleteTableCommand({ TableName: TABLE_NAME }));
      
      // Wait a bit for deletion to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error: any) {
      if (error.name !== 'ResourceNotFoundException') {
        throw error;
      }
    }
    
    // Create table with single-table design
    const createTableParams = {
      TableName: TABLE_NAME,
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' as const },  // Partition key
        { AttributeName: 'SK', KeyType: 'RANGE' as const }  // Sort key
      ],
      AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: 'S' as const },
        { AttributeName: 'SK', AttributeType: 'S' as const },
        { AttributeName: 'entityType', AttributeType: 'S' as const },
        { AttributeName: 'email', AttributeType: 'S' as const },
        { AttributeName: 'createdBy', AttributeType: 'S' as const },
        { AttributeName: 'prenupId', AttributeType: 'S' as const }
      ],
      BillingMode: 'PAY_PER_REQUEST' as const,
      GlobalSecondaryIndexes: [
        {
          IndexName: 'EntityTypeIndex',
          KeySchema: [
            { AttributeName: 'entityType', KeyType: 'HASH' as const },
            { AttributeName: 'SK', KeyType: 'RANGE' as const }
          ],
          Projection: { ProjectionType: 'ALL' as const }
        },
        {
          IndexName: 'EmailIndex',
          KeySchema: [
            { AttributeName: 'email', KeyType: 'HASH' as const }
          ],
          Projection: { ProjectionType: 'ALL' as const }
        },
        {
          IndexName: 'CreatedByIndex',
          KeySchema: [
            { AttributeName: 'createdBy', KeyType: 'HASH' as const },
            { AttributeName: 'SK', KeyType: 'RANGE' as const }
          ],
          Projection: { ProjectionType: 'ALL' as const }
        },
        {
          IndexName: 'PrenupIndex',
          KeySchema: [
            { AttributeName: 'prenupId', KeyType: 'HASH' as const },
            { AttributeName: 'SK', KeyType: 'RANGE' as const }
          ],
          Projection: { ProjectionType: 'ALL' as const }
        }
      ]
    };
    
    await dynamoDBClient.send(new CreateTableCommand(createTableParams));
    
    console.log(`✅ Table ${TABLE_NAME} created successfully with GSIs:`);
    console.log('  - EntityTypeIndex: for querying by entity type');
    console.log('  - EmailIndex: for user lookups by email');
    console.log('  - CreatedByIndex: for user-owned entities');
    console.log('  - PrenupIndex: for prenup-related entities');
    
    // Wait for table to become active
    console.log('Waiting for table to become active...');
    let tableActive = false;
    while (!tableActive) {
      try {
        const result = await dynamoDBClient.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
        if (result.Table?.TableStatus === 'ACTIVE') {
          tableActive = true;
          console.log('✅ Table is now active!');
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.log('Still waiting for table...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
  } catch (error) {
    console.error('❌ Error setting up tables:', error);
    process.exit(1);
  }
}

async function listTables() {
  try {
    const result = await dynamoDBClient.send(new ListTablesCommand({}));
    console.log('\nCurrent DynamoDB tables:');
    result.TableNames?.forEach(name => console.log(`  - ${name}`));
  } catch (error) {
    console.error('Error listing tables:', error);
  }
}

// Run setup if called directly
if (require.main === module) {
  console.log('🚀 Starting DynamoDB table setup for local development...\n');
  console.log(`Configuration:`);
  console.log(`  Region: ${config.dynamodb.region}`);
  console.log(`  Endpoint: ${config.dynamodb.endpoint}`);
  console.log(`  Table Name: ${TABLE_NAME}\n`);
  
  setupTables()
    .then(() => listTables())
    .then(() => {
      console.log('\n✅ DynamoDB setup completed successfully!');
      console.log('\nYou can now:');
      console.log('  1. Start the backend server: npm run dev');
      console.log('  2. View DynamoDB data at: http://localhost:8000/shell');
      process.exit(0);
    })
    .catch(error => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

export { setupTables, listTables };