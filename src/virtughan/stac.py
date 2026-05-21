from __future__ import annotations

import asyncio
from collections.abc import Callable
from typing import Any

from pystac import Item
from pystac_client import Client

from .collections import CollectionConfig


def _build_query(
    config: CollectionConfig,
    cloud_cover: int | None,
    extra_query: dict[str, Any] | None,
) -> dict[str, Any] | None:
    query: dict[str, Any] = {}
    if cloud_cover is not None and config.cloud_cover_property:
        query[config.cloud_cover_property] = {"lt": cloud_cover}
    if extra_query:
        query.update(extra_query)
    return query or None


def search_stac(
    config: CollectionConfig,
    bbox: list[float],
    start_date: str,
    end_date: str,
    cloud_cover: int | None = None,
    max_items: int | None = None,
    extra_query: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    client = Client.open(config.catalog_url)
    search = client.search(
        collections=[config.collection_id],
        bbox=bbox,
        datetime=f"{start_date}T00:00:00Z/{end_date}T23:59:59Z",
        query=_build_query(config, cloud_cover, extra_query),
        max_items=max_items,
        sortby=[{"field": "properties.datetime", "direction": "desc"}],
    )
    return [_item_to_feature(item, config.url_signer) for item in search.items()]


async def search_stac_async(
    config: CollectionConfig,
    bbox_geojson: dict[str, Any],
    start_date: str,
    end_date: str,
    cloud_cover: int | None = None,
    max_items: int | None = None,
    extra_query: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    return await asyncio.to_thread(
        _search_stac_intersects_sync,
        config,
        bbox_geojson,
        start_date,
        end_date,
        cloud_cover,
        max_items,
        extra_query,
    )


def _search_stac_intersects_sync(
    config: CollectionConfig,
    bbox_geojson: dict[str, Any],
    start_date: str,
    end_date: str,
    cloud_cover: int | None = None,
    max_items: int | None = None,
    extra_query: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    client = Client.open(config.catalog_url)
    search = client.search(
        collections=[config.collection_id],
        intersects=bbox_geojson,
        datetime=f"{start_date}T00:00:00Z/{end_date}T23:59:59Z",
        query=_build_query(config, cloud_cover, extra_query),
        max_items=max_items,
        sortby=[{"field": "properties.datetime", "direction": "desc"}],
    )
    return [_item_to_feature(item, config.url_signer) for item in search.items()]


def _sign_feature_assets(
    feature: dict[str, Any], url_signer: Callable[[str], str]
) -> dict[str, Any]:
    for asset in feature.get("assets", {}).values():
        if "href" in asset:
            asset["href"] = url_signer(asset["href"])
    return feature


def _item_to_feature(item: Item, url_signer: Callable[[str], str] | None = None) -> dict[str, Any]:
    feature = item.to_dict()
    if url_signer:
        feature = _sign_feature_assets(feature, url_signer)
    return feature
