import { loadEnvFile } from 'node:process';
import pg from 'pg';
import { batchD1, queryD1 } from './d1-client.js';

loadEnvFile();

const { Pool } = pg;
const BATCH_SIZE = 250;
const force = process.argv.includes('--force');

const tableDefinitions = [
	{
		name: 'Denomination',
		columns: ['id', 'slug', 'name', 'abbr', 'continental', 'description'],
	},
	{
		name: 'Presbytery',
		columns: ['id', 'name', 'slug', 'denominationSlug'],
	},
	{
		name: 'Congregation',
		columns: [
			'id',
			'pastor',
			'name',
			'website',
			'phone',
			'email',
			'address',
			'addressLabel',
			'contact',
			'lon',
			'lat',
			'presbyteryId',
			'denominationSlug',
			'createdAt',
			'updatedAt',
		],
	},
	{
		name: 'ScrapeLog',
		columns: ['id', 'message', 'denominationSlug', 'completedAt', 'attemptedAt', 'count'],
	},
];

/** @param {unknown} value */
function toD1Value(value) {
	if (value instanceof Date) return value.toISOString();
	if (typeof value === 'boolean') return value ? 1 : 0;
	return value;
}

/** @param {Array<{sql: string, params: unknown[]}>} statements */
async function executeInChunks(statements) {
	for (let index = 0; index < statements.length; index += BATCH_SIZE) {
		await batchD1(statements.slice(index, index + BATCH_SIZE));
	}
}

async function main() {
	if (!process.env.DATABASE_URL) {
		throw new Error('DATABASE_URL is missing from .env');
	}

	const targetCounts = {};
	for (const { name } of tableDefinitions) {
		const result = await queryD1(`SELECT COUNT(*) AS count FROM "${name}"`);
		targetCounts[name] = Number(result.results[0]?.count ?? 0);
	}
	const targetRowCount = Object.values(targetCounts).reduce((sum, count) => sum + count, 0);
	if (targetRowCount > 0 && !force) {
		throw new Error(
			`Production D1 is not empty (${JSON.stringify(targetCounts)}). Re-run with --force to replace it.`,
		);
	}

	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
		ssl: { rejectUnauthorized: false },
		max: 1,
	});

	try {
		/** @type {Record<string, Array<Record<string, unknown>>>} */
		const sourceRows = {};
		for (const { name, columns } of tableDefinitions) {
			const quotedColumns = columns.map((column) => `"${column}"`).join(', ');
			const result = await pool.query(`SELECT ${quotedColumns} FROM "${name}" ORDER BY "id"`);
			sourceRows[name] = result.rows;
			console.log(`Read ${result.rowCount} ${name} rows from Supabase.`);
		}

		if (force) {
			await batchD1([
				{ sql: 'DELETE FROM Congregation', params: [] },
				{ sql: 'DELETE FROM ScrapeLog', params: [] },
				{ sql: 'DELETE FROM Presbytery', params: [] },
				{ sql: 'DELETE FROM Denomination', params: [] },
			]);
		}

		for (const { name, columns } of tableDefinitions) {
			const placeholders = columns.map(() => '?').join(', ');
			const quotedColumns = columns.map((column) => `"${column}"`).join(', ');
			const statements = sourceRows[name].map((row) => ({
				sql: `INSERT INTO "${name}" (${quotedColumns}) VALUES (${placeholders})`,
				params: columns.map((column) => toD1Value(row[column])),
			}));
			await executeInChunks(statements);
			console.log(`Wrote ${statements.length} ${name} rows to D1.`);
		}

		for (const { name } of tableDefinitions) {
			const result = await queryD1(`SELECT COUNT(*) AS count FROM "${name}"`);
			const targetCount = Number(result.results[0]?.count ?? 0);
			const sourceCount = sourceRows[name].length;
			if (targetCount !== sourceCount) {
				throw new Error(`${name} validation failed: Supabase=${sourceCount}, D1=${targetCount}`);
			}
			console.log(`Validated ${name}: ${targetCount} rows.`);
		}
	} finally {
		await pool.end();
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
