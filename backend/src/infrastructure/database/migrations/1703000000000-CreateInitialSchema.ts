import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateInitialSchema1703000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'wallet_balance',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'role',
            type: 'varchar',
            length: '50',
            default: "'USER'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create bancas table
    await queryRunner.createTable(
      new Table({
        name: 'bancas',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'integration_type',
            type: 'varchar',
            length: '50',
            default: "'api'",
          },
          {
            name: 'endpoint',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'auth_type',
            type: 'varchar',
            length: '50',
            default: "'hmac'",
          },
          {
            name: 'client_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'client_secret',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'hmac_secret',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'public_key',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create plays table
    await queryRunner.createTable(
      new Table({
        name: 'plays',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'request_id',
            type: 'uuid',
            isUnique: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'lottery_id',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'numbers',
            type: 'jsonb',
          },
          {
            name: 'bet_type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'DOP'",
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'play_id_banca',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'ticket_code',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'play_data',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create outgoing_requests table
    await queryRunner.createTable(
      new Table({
        name: 'outgoing_requests',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'request_id',
            type: 'uuid',
          },
          {
            name: 'banca_id',
            type: 'uuid',
          },
          {
            name: 'path',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'payload',
            type: 'jsonb',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'retries',
            type: 'int',
            default: 0,
          },
          {
            name: 'last_response',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create webhook_events table
    await queryRunner.createTable(
      new Table({
        name: 'webhook_events',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'source',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'event_type',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'payload',
            type: 'jsonb',
          },
          {
            name: 'signature_valid',
            type: 'boolean',
            default: false,
          },
          {
            name: 'processed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create settings table
    await queryRunner.createTable(
      new Table({
        name: 'settings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'key',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'value',
            type: 'text',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_public',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'plays',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'outgoing_requests',
      new TableForeignKey({
        columnNames: ['banca_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'bancas',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'plays',
      new TableIndex({
        name: 'IDX_PLAYS_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'plays',
      new TableIndex({
        name: 'IDX_PLAYS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'plays',
      new TableIndex({
        name: 'IDX_PLAYS_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createIndex(
      'outgoing_requests',
      new TableIndex({
        name: 'IDX_OUTGOING_REQUESTS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'webhook_events',
      new TableIndex({
        name: 'IDX_WEBHOOK_EVENTS_PROCESSED',
        columnNames: ['processed'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('settings');
    await queryRunner.dropTable('webhook_events');
    await queryRunner.dropTable('outgoing_requests');
    await queryRunner.dropTable('plays');
    await queryRunner.dropTable('bancas');
    await queryRunner.dropTable('users');
  }
}
