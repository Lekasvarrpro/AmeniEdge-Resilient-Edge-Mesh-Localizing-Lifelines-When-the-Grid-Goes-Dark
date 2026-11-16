# AmeniEdge Offline Map Tiles & Geospatial Layers

## 1. Map Data Licensing and Attribution
AmeniEdge utilizes offline raster tiles derived from OpenStreetMap data.
- **Data Source**: © OpenStreetMap contributors
- **Licensing**: Open Database License (ODbL) 1.0 (https://opendatacommons.org/licenses/odbl/)
- **Tile Usage Policy**: In accordance with OSM Foundation guidelines, bulk tile downloading from public OSM tile servers during non-emergencies is forbidden without prior authorization. Use pre-rendered tile dumps (Planet.osm extracts) rendered with tools like `tilemaker` or `TileServer GL`.
- **Mandatory Attribution**: All offline and online views MUST render: `© OpenStreetMap contributors` in the bottom-right corner of the map canvas.

---

## 2. Directory Layout for Local Leaflet Serving
Leaflet requests tiles via the standard Slippy Map XYZ directory structure:
```
/map-data/tiles/{z}/{x}/{y}.png
```
Where:
- `{z}`: Zoom level (0 to 18; recommended field range: 12 to 16 for neighborhood level)
- `{x}`: Tile column index
- `{y}`: Tile row index

---

## 3. Preparing Field Tiles Before Disaster Operations

### Strategy A: Using Tilemaker (Recommended for Zero-Internet Linux Station)
1. Download a protocol buffer (.pbf) extract of your target metropolitan area from Geofabrik (e.g. `chennai-latest.osm.pbf`).
2. Run Tilemaker to produce a local MBTiles or folder structure:
   ```bash
   tilemaker --input target-district.osm.pbf --output ./tiles --config config.json
   ```

### Strategy B: Using the Included Tile Downloader Script
For preparation and training drills, use `python download_tiles.py` to fetch a small bounding box:
```bash
python download_tiles.py --bbox 13.04,80.20,13.12,80.30 --min-zoom 12 --max-zoom 15
```

---

## 4. Pre-packaged Layers
- `shelters.geojson`: Verified emergency evacuation centers with capacity, water, generator, and medical status.
- `hazards.geojson`: Active and historic flood inundation zones, washed-out bridges, and high-voltage hazards.

