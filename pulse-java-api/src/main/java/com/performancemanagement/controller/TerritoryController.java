package com.performancemanagement.controller;

import com.performancemanagement.dto.TerritoryDTO;
import com.performancemanagement.service.AuthorizationService;
import com.performancemanagement.service.TerritoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/territories")
@CrossOrigin(origins = "*")
public class TerritoryController {

    @Autowired
    private TerritoryService territoryService;

    @Autowired
    private AuthorizationService authorizationService;

    @GetMapping
    public ResponseEntity<List<TerritoryDTO>> getAllTerritories() {
        List<TerritoryDTO> territories = territoryService.getAllTerritories();
        return new ResponseEntity<>(territories, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TerritoryDTO> getTerritoryById(@PathVariable Long id) {
        try {
            TerritoryDTO territory = territoryService.getTerritoryById(id);
            return new ResponseEntity<>(territory, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping
    public ResponseEntity<TerritoryDTO> createTerritory(@RequestBody TerritoryDTO territoryDTO) {
        try {
            authorizationService.requireHrAdmin();
            TerritoryDTO created = territoryService.createTerritory(territoryDTO);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TerritoryDTO> updateTerritory(@PathVariable Long id, @RequestBody TerritoryDTO territoryDTO) {
        try {
            authorizationService.requireHrAdmin();
            TerritoryDTO updated = territoryService.updateTerritory(id, territoryDTO);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTerritory(@PathVariable Long id) {
        try {
            authorizationService.requireHrAdmin();
            territoryService.deleteTerritory(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}

