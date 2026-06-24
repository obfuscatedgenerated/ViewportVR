import type { get_asset_path as AssetResolverType } from "@asset-resolver";

export const get_asset_path: typeof AssetResolverType = (
    path,
    from_package = "assets"
) => {
    const base = `../../../../packages/${from_package}`;
    return new URL(`url:${base}/${path}`, import.meta.url).href;
};
