package com.ameniedge.rescuefit;

import com.ameniedge.common.ApiResponse;
import com.ameniedge.incidents.Incident;
import com.ameniedge.incidents.IncidentService;
import com.ameniedge.rescuefit.dto.RescueFitResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/incidents")
public class RescueFitController {

    private final RescueFitEngine rescueFitEngine;
    private final IncidentService incidentService;

    public RescueFitController(RescueFitEngine rescueFitEngine, IncidentService incidentService) {
        this.rescueFitEngine = rescueFitEngine;
        this.incidentService = incidentService;
    }

    @GetMapping("/{id}/recommendations")
    public ResponseEntity<ApiResponse<RescueFitResponse>> getRecommendations(@PathVariable String id) {
        Incident incident = incidentService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found: " + id));

        RescueFitResponse response = rescueFitEngine.evaluate(incident);
        return ResponseEntity.ok(ApiResponse.ok("RescueFit recommendations calculated", response));
    }
}
