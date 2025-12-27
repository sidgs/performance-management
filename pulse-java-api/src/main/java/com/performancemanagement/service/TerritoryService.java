package com.performancemanagement.service;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.dto.TerritoryDTO;
import com.performancemanagement.model.Goal;
import com.performancemanagement.model.Territory;
import com.performancemanagement.repository.GoalRepository;
import com.performancemanagement.repository.TerritoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TerritoryService {

    @Autowired
    private TerritoryRepository territoryRepository;

    @Autowired
    private GoalRepository goalRepository;

    private String requireTenantId() {
        String tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant context required for this operation");
        }
        return tenantId;
    }

    /**
     * Ensure "Global" territory exists for the current tenant
     */
    public Territory ensureGlobalTerritory() {
        String tenantId = requireTenantId();
        
        Optional<Territory> globalTerritory = territoryRepository.findByNameAndTenantId("Global", tenantId);
        if (globalTerritory.isPresent()) {
            return globalTerritory.get();
        }
        
        // Create Global territory if it doesn't exist
        Territory territory = new Territory();
        territory.setTenant(TenantContext.getCurrentTenant());
        territory.setName("Global");
        territory.setDescription("Global territory for all goals");
        return territoryRepository.save(territory);
    }

    @Cacheable(value = "territories")
    public List<TerritoryDTO> getAllTerritories() {
        String tenantId = requireTenantId();
        
        List<Territory> territories = territoryRepository.findByTenantId(tenantId);
        return territories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TerritoryDTO getTerritoryById(Long id) {
        String tenantId = requireTenantId();
        
        Territory territory = territoryRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Territory not found"));
        return convertToDTO(territory);
    }

    @CacheEvict(value = "territories", allEntries = true)
    public TerritoryDTO createTerritory(TerritoryDTO territoryDTO) {
        String tenantId = requireTenantId();
        
        // Check if territory with same name already exists
        Optional<Territory> existing = territoryRepository.findByNameAndTenantId(territoryDTO.getName(), tenantId);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Territory with name '" + territoryDTO.getName() + "' already exists");
        }
        
        Territory territory = new Territory();
        territory.setTenant(TenantContext.getCurrentTenant());
        territory.setName(territoryDTO.getName());
        territory.setDescription(territoryDTO.getDescription());
        
        Territory saved = territoryRepository.save(territory);
        return convertToDTO(saved);
    }

    @CacheEvict(value = "territories", allEntries = true)
    public TerritoryDTO updateTerritory(Long id, TerritoryDTO territoryDTO) {
        String tenantId = requireTenantId();
        
        Territory territory = territoryRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Territory not found"));
        
        // Prevent updating "Global" territory name
        if ("Global".equals(territory.getName()) && !"Global".equals(territoryDTO.getName())) {
            throw new IllegalArgumentException("Cannot change the name of 'Global' territory");
        }
        
        // Check if new name conflicts with existing territory
        if (!territory.getName().equals(territoryDTO.getName())) {
            Optional<Territory> existing = territoryRepository.findByNameAndTenantId(territoryDTO.getName(), tenantId);
            if (existing.isPresent() && !existing.get().getId().equals(id)) {
                throw new IllegalArgumentException("Territory with name '" + territoryDTO.getName() + "' already exists");
            }
        }
        
        territory.setName(territoryDTO.getName());
        territory.setDescription(territoryDTO.getDescription());
        
        Territory saved = territoryRepository.save(territory);
        return convertToDTO(saved);
    }

    @CacheEvict(value = {"territories", "goals", "goal", "goalsByOwner"}, allEntries = true)
    public void deleteTerritory(Long id) {
        String tenantId = requireTenantId();
        
        Territory territory = territoryRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Territory not found"));
        
        // Prevent deletion of "Global" territory
        if ("Global".equals(territory.getName())) {
            throw new IllegalArgumentException("Cannot delete 'Global' territory");
        }
        
        // Get Global territory for reassignment
        Territory globalTerritory = ensureGlobalTerritory();
        
        // Find all goals with this territory and reassign to Global
        List<Goal> goalsWithTerritory = goalRepository.findByTerritoryAndTenantId(territory, tenantId);
        for (Goal goal : goalsWithTerritory) {
            goal.setTerritory(globalTerritory);
        }
        goalRepository.saveAll(goalsWithTerritory);
        
        // Delete the territory
        territoryRepository.delete(territory);
    }

    private TerritoryDTO convertToDTO(Territory territory) {
        TerritoryDTO dto = new TerritoryDTO();
        dto.setId(territory.getId());
        dto.setName(territory.getName());
        dto.setDescription(territory.getDescription());
        return dto;
    }
}

