from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any


def _parse_sentinel2_tile_id(feature: dict[str, Any]) -> tuple[str, str]:
    parts = feature["id"].split("_")
    zone = parts[1][:2]
    date = parts[2]
    return zone, date


def _parse_landsat_tile_id(feature: dict[str, Any]) -> tuple[str, str]:
    parts = feature["id"].split("_")
    path_row = parts[2]
    date = parts[3]
    return path_row, date


def _parse_sentinel1_tile_id(feature: dict[str, Any]) -> tuple[str, str]:
    parts = feature["id"].split("_")
    date = parts[4][:8]
    properties = feature.get("properties", {})
    relative_orbit = properties.get("sat:relative_orbit", parts[6])
    orbit_state = properties.get("sat:orbit_state", "unknown")
    grid = f"{relative_orbit}_{orbit_state[:1]}"
    return grid, date


SENTINEL1_MODES = frozenset(["IW", "EW", "SM", "WV"])


@dataclass(frozen=True)
class BandInfo:
    resolution: int
    wavelength: str = ""
    description: str = ""


@dataclass(frozen=True)
class CollectionConfig:
    collection_id: str
    catalog_url: str
    bands: dict[str, BandInfo]
    cloud_cover_property: str | None
    tile_id_parser: Callable[[dict[str, Any]], tuple[str, str]]
    url_signer: Callable[[str], str] | None = None
    stac_query_fields: dict[str, dict[str, int]] = field(default_factory=dict)

    @property
    def band_names(self) -> list[str]:
        return list(self.bands.keys())

    def validate_bands(self, requested_bands: list[str]) -> list[str]:
        return [b for b in requested_bands if b not in self.bands]


EARTH_SEARCH_URL = "https://earth-search.aws.element84.com/v1"
PLANETARY_COMPUTER_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"

SENTINEL2_BANDS = {
    "red": BandInfo(10, "665 nm", "Red, Band 4"),
    "green": BandInfo(10, "560 nm", "Green, Band 3"),
    "blue": BandInfo(10, "490 nm", "Blue, Band 2"),
    "nir": BandInfo(10, "842 nm", "Near-Infrared, Band 8"),
    "swir22": BandInfo(20, "2190 nm", "Short-Wave Infrared 2, Band 12"),
    "rededge2": BandInfo(20, "740 nm", "Red Edge 2, Band 6"),
    "rededge3": BandInfo(20, "783 nm", "Red Edge 3, Band 7"),
    "rededge1": BandInfo(20, "705 nm", "Red Edge 1, Band 5"),
    "swir16": BandInfo(20, "1610 nm", "Short-Wave Infrared 1, Band 11"),
    "wvp": BandInfo(20, "945 nm", "Water Vapour, Band 9"),
    "nir08": BandInfo(20, "865 nm", "Near-Infrared Narrow, Band 8A"),
    "aot": BandInfo(20, "443 nm", "Aerosol Optical Thickness"),
    "coastal": BandInfo(60, "443 nm", "Coastal Aerosol, Band 1"),
    "nir09": BandInfo(60, "945 nm", "Water Vapour, Band 9"),
    "scl": BandInfo(20, "", "Scene Classification Layer"),
    "visual": BandInfo(10, "", "True Color Image (RGB)"),
}

LANDSAT_BANDS = {
    "red": BandInfo(30, "655 nm", "Red, Band 4"),
    "green": BandInfo(30, "560 nm", "Green, Band 3"),
    "blue": BandInfo(30, "480 nm", "Blue, Band 2"),
    "nir08": BandInfo(30, "865 nm", "Near-Infrared, Band 5"),
    "swir16": BandInfo(30, "1610 nm", "Short-Wave Infrared 1, Band 6"),
    "swir22": BandInfo(30, "2200 nm", "Short-Wave Infrared 2, Band 7"),
    "coastal": BandInfo(30, "443 nm", "Coastal Aerosol, Band 1"),
    "lwir11": BandInfo(100, "10900 nm", "Thermal Infrared, Band 10"),
}

SENTINEL1_BANDS = {
    "vv": BandInfo(10),
    "vh": BandInfo(10),
    "hh": BandInfo(10),
    "hv": BandInfo(10),
}


def _sign_planetary_computer_url(url: str) -> str:
    import planetary_computer

    return planetary_computer.sign_url(url)


COLLECTIONS: dict[str, CollectionConfig] = {
    "sentinel-2-l2a": CollectionConfig(
        collection_id="sentinel-2-l2a",
        catalog_url=EARTH_SEARCH_URL,
        bands=SENTINEL2_BANDS,
        cloud_cover_property="eo:cloud_cover",
        tile_id_parser=_parse_sentinel2_tile_id,
    ),
    "landsat-c2-l2": CollectionConfig(
        collection_id="landsat-c2-l2",
        catalog_url=PLANETARY_COMPUTER_URL,
        bands=LANDSAT_BANDS,
        cloud_cover_property="eo:cloud_cover",
        tile_id_parser=_parse_landsat_tile_id,
        url_signer=_sign_planetary_computer_url,
    ),
    "sentinel-1-rtc": CollectionConfig(
        collection_id="sentinel-1-rtc",
        catalog_url=PLANETARY_COMPUTER_URL,
        bands=SENTINEL1_BANDS,
        cloud_cover_property=None,
        tile_id_parser=_parse_sentinel1_tile_id,
        url_signer=_sign_planetary_computer_url,
    ),
}


def get_collection(name: str) -> CollectionConfig:
    if name not in COLLECTIONS:
        available = ", ".join(COLLECTIONS.keys())
        raise ValueError(f"Unknown collection '{name}'. Available: {available}")
    return COLLECTIONS[name]
