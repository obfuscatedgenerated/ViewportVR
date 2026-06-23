import fs from "fs";
import path from "path";

import { StaticIdentityRecordSchema, StaticIdentityRecordSchema_VERSION } from "~lib/auth/schema";

const SCHEMA_URL_BASE = "https://vvr.ollieg.codes/schemas";

const OUTPUT_DIR = path.join(__dirname, "../build/schemas");

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const raw_schema = StaticIdentityRecordSchema.toJSONSchema();

// force the current version to be exact
raw_schema.properties.version = {
    type: "integer",
    const: StaticIdentityRecordSchema_VERSION,
}

const final_schema = {
    $id: `${SCHEMA_URL_BASE}/static_identity_record_v${StaticIdentityRecordSchema_VERSION}.json`,
    version: StaticIdentityRecordSchema_VERSION,
    title: `ViewportVR - Static Identity Record (version ${StaticIdentityRecordSchema_VERSION})`,
    description: `A static identity record for ViewportVR to authenticate users on a static site, under the .well-known/vvr/auth/ path. This schema is version ${StaticIdentityRecordSchema_VERSION}.`,
    ...raw_schema
};

fs.writeFileSync(
    path.join(OUTPUT_DIR, `static_identity_record_v${StaticIdentityRecordSchema_VERSION}.json`),
    JSON.stringify(final_schema, null, 4)
);

console.log(`Generated JSON schema for StaticIdentityRecord v${StaticIdentityRecordSchema_VERSION} at ${OUTPUT_DIR}`);
