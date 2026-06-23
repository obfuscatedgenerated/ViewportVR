const params = new URLSearchParams(window.location.search);
export const TAB_ID = params.get("tab") ? parseInt(params.get("tab")!) : null;
