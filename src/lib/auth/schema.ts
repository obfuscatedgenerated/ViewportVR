import { z } from "zod";

export const JWK_EC_Schema = z.object({
    kty: z.literal("EC"),
    crv: z.enum(["P-256", "P-384", "P-521"]),
    x: z.string(),
    y: z.string(),
    ext: z.boolean().optional()
});
export type JWK_EC = z.infer<typeof JWK_EC_Schema>;

export const DeviceRecordSchema = z.object({
    device_id: z.string(),
    label: z.string(),
    added_at: z.number(),
    public_key: JWK_EC_Schema
});
export type DeviceRecord = z.infer<typeof DeviceRecordSchema>;

export const StaticIdentitySchema_VERSION = 1;
export const StaticIdentityRecordSchema = z.object({
    $schema: z.string().optional(),
    version: z.number().int().min(1).max(StaticIdentitySchema_VERSION),
    identity: z.string(),
    created_at: z.number(),
    status: z.enum(["active", "suspended"]),
    devices: z.array(DeviceRecordSchema)
});
export type StaticIdentityRecord = z.infer<typeof StaticIdentityRecordSchema>;
