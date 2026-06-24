import type { get_asset_path as AssetResolverType } from "@viewportvr/asset-resolver";

export const get_asset_path: typeof AssetResolverType = (
    path,
    from_package = "assets"
) => {
    return new URL(`../../../../packages/${from_package}/${path}`, import.meta.url).href;
};
