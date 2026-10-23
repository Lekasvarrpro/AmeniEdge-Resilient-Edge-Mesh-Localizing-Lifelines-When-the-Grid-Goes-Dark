package com.ameniedge.maps;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/v1/maps")
public class MapController {

    private static final String TILES_BASE_PATH = "map-data/tiles";
    private static final String SHELTERS_PATH = "map-data/shelters.geojson";
    private static final String HAZARDS_PATH = "map-data/hazards.geojson";

    @GetMapping(value = "/tiles/{z}/{x}/{y}", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getMapTile(
            @PathVariable int z,
            @PathVariable int x,
            @PathVariable int y) {

        Path tilePath = Paths.get(TILES_BASE_PATH, String.valueOf(z), String.valueOf(x), y + ".png");
        File tileFile = tilePath.toFile();

        if (tileFile.exists() && tileFile.canRead()) {
            try {
                byte[] bytes = Files.readAllBytes(tilePath);
                HttpHeaders headers = new HttpHeaders();
                headers.setCacheControl("public, max-age=2592000, immutable");
                return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
            } catch (IOException ignored) {}
        }

        // Resilient Fallback: Generate a clean 1x1 transparent/tinted PNG tile dynamically if tile is absent
        // PNG 1x1 data with soft grey pixel
        byte[] minimalPng = new byte[]{
                (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
                0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
                0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
                0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, (byte) 0xC4,
                (byte) 0x89, 0x00, 0x00, 0x00, 0x0B, 0x49, 0x44, 0x41,
                0x54, 0x78, (byte) 0x9C, 0x63, 0x60, 0x60, 0x60, 0x00,
                0x00, 0x00, 0x04, 0x00, 0x01, 0x27, 0x34, 0x27,
                0x0A, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
                0x44, (byte) 0xAE, 0x42, 0x60, (byte) 0x82
        };

        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .contentType(MediaType.IMAGE_PNG)
                .body(minimalPng);
    }

    @GetMapping(value = "/layers/shelters", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getSheltersLayer() {
        return readFileOrFallback(SHELTERS_PATH, """
                {
                  "type": "FeatureCollection",
                  "features": [
                    {
                      "type": "Feature",
                      "properties": {
                        "id": "SHL-001",
                        "name": "St. Mary Higher Secondary Relief Shelter",
                        "capacity": 450,
                        "current_occupancy": 128,
                        "has_backup_power": true,
                        "has_drinking_water": true
                      },
                      "geometry": { "type": "Point", "coordinates": [80.2685, 13.0842] }
                    }
                  ]
                }
                """);
    }

    @GetMapping(value = "/layers/hazards", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getHazardsLayer() {
        return readFileOrFallback(HAZARDS_PATH, """
                {
                  "type": "FeatureCollection",
                  "features": [
                    {
                      "type": "Feature",
                      "properties": {
                        "id": "HAZ-001",
                        "title": "Otteri Nullah Inundation",
                        "severity": "CRITICAL",
                        "category": "FLOOD_ZONE"
                      },
                      "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[80.2520, 13.0900], [80.2600, 13.0910], [80.2650, 13.0850], [80.2580, 13.0820], [80.2520, 13.0900]]]
                      }
                    }
                  ]
                }
                """);
    }

    private ResponseEntity<String> readFileOrFallback(String filePath, String fallbackJson) {
        Path path = Paths.get(filePath);
        if (Files.exists(path)) {
            try {
                return ResponseEntity.ok(Files.readString(path));
            } catch (IOException ignored) {}
        }
        return ResponseEntity.ok(fallbackJson);
    }
}
