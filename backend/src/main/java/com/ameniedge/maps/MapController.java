package com.ameniedge.maps;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/v1/maps")
public class MapController {

    private static final String TILES_DIR = "map-data/tiles";
    private static final String SHELTERS_PATH = "map-data/shelters.geojson";
    private static final String HAZARDS_PATH = "map-data/hazards.geojson";

    private Path resolvePath(String relativePath) {
        Path p1 = Paths.get(relativePath);
        if (Files.exists(p1)) return p1;
        Path p2 = Paths.get("..", relativePath);
        if (Files.exists(p2)) return p2;
        return p1;
    }

    @GetMapping(value = "/tiles/{z}/{x}/{y}", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<?> getMapTile(
            @PathVariable int z,
            @PathVariable int x,
            @PathVariable int y) {

        Path tilePath = resolvePath(Paths.get(TILES_DIR, String.valueOf(z), String.valueOf(x), y + ".png").toString());

        if (Files.exists(tilePath) && Files.isReadable(tilePath)) {
            try {
                byte[] bytes = Files.readAllBytes(tilePath);
                HttpHeaders headers = new HttpHeaders();
                headers.setCacheControl("public, max-age=2592000, immutable");
                return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
            } catch (IOException ignored) {}
        }

        // Redirect to OpenStreetMap tile server for online dev mode
        String osmUrl = String.format("https://tile.openstreetmap.org/%d/%d/%d.png", z, x, y);
        return ResponseEntity.status(HttpStatus.TEMPORARY_REDIRECT)
                .location(URI.create(osmUrl))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .build();
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
        Path path = resolvePath(filePath);
        if (Files.exists(path)) {
            try {
                return ResponseEntity.ok(Files.readString(path));
            } catch (IOException ignored) {}
        }
        return ResponseEntity.ok(fallbackJson);
    }
}

