import { mkdir, writeFile } from 'node:fs/promises';
import { loadEnvFile } from 'node:process';
import pg from 'pg';

loadEnvFile();

const outputPath = '.wrangler/supabase-to-d1.sql';
const tables = [
	['Denomination', ['id', 'slug', 'name', 'abbr', 'continental', 'description']],
	['Presbytery', ['id', 'name', 'slug', 'denominationSlug']],
	[
		'Congregation',
		[
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
	],
	['ScrapeLog', ['id', 'message', 'denominationSlug', 'completedAt', 'attemptedAt', 'count']],
];

/** @param {unknown} value */
function sqlLiteral(value) {
	if (value === null || value === undefined) return 'NULL';
	if (value instanceof Date) return `'${value.toISOString()}'`;
	if (typeof value === 'boolean') return value ? '1' : '0';
	if (typeof value === 'number') {
		if (!Number.isFinite(value)) throw new Error(`Cannot export non-finite number: ${value}`);
		return String(value);
	}
	return `'${String(value).replaceAll("'", "''")}'`;
}

async function main() {
	if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing from .env');
	const pool = new pg.Pool({
		connectionString: process.env.DATABASE_URL,
		ssl: { rejectUnauthorized: false },
		max: 1,
	});
	const statements = [
		'DELETE FROM "Congregation";',
		'DELETE FROM "ScrapeLog";',
		'DELETE FROM "Presbytery";',
		'DELETE FROM "Denomination";',
	];

	try {
		for (const [table, columns] of tables) {
			const quotedColumns = columns.map((column) => `"${column}"`).join(', ');
			const { rows } = await pool.query(`SELECT ${quotedColumns} FROM "${table}" ORDER BY "id"`);
			for (const row of rows) {
				statements.push(
					`INSERT INTO "${table}" (${quotedColumns}) VALUES (${columns.map((column) => sqlLiteral(row[column])).join(', ')});`,
				);
			}
			console.log(`Exported ${rows.length} ${table} rows.`);
		}
	} finally {
		await pool.end();
	}

	await mkdir('.wrangler', { recursive: true });
	await writeFile(outputPath, `${statements.join('\n')}\n`, { encoding: 'utf8', mode: 0o600 });
	console.log(`Wrote ${outputPath}`);
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
