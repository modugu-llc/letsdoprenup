# DynamoDB Migration - Prisma Schema Reference

This file has been migrated to DynamoDB. The original Prisma schema is preserved here for reference during migration.

## Migration Mapping

### Original Prisma Models → DynamoDB Entities

1. **User** → DynamoDB with V0 versioning
   - PK: USER#{id}
   - SK: V0 (latest), V1, V2... (versions)

2. **Prenup** → DynamoDB entity
   - PK: PRENUP#{id}
   - SK: V0 (latest)
   - Denormalized: createdByEmail, partnerEmail

3. **FinancialDisclosure** → DynamoDB entity
   - PK: FINANCIAL_DISCLOSURE#{id}
   - SK: V0 (latest)
   - Denormalized: userEmail

4. **Document** → DynamoDB entity
   - PK: DOCUMENT#{id}
   - SK: V0 (latest)
   - Added: uploadedBy field

5. **Signature** → DynamoDB entity
   - PK: SIGNATURE#{id}
   - SK: V0 (latest)
   - Denormalized: userEmail

6. **PartnerInvitation** → DynamoDB entity
   - PK: PARTNER_INVITATION#{id}
   - SK: V0 (latest)
   - Denormalized: invitedByEmail

## Key Changes Made

1. **Single Table Design**: All entities in one table with composite keys
2. **Versioning System**: V0 always contains latest version
3. **Denormalization**: Strategic data duplication for performance
4. **GSI Strategy**: Optimized indexes for query patterns
5. **Service Layer**: Complete business logic abstraction

## Original Schema Backed Up
The original schema.prisma has been moved to schema.prisma.backup for reference.