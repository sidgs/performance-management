package com.performancemanagement.service;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.dto.KPIDTO;
import com.performancemanagement.model.KPI;
import com.performancemanagement.model.Goal;
import com.performancemanagement.repository.KPIRepository;
import com.performancemanagement.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class KPIService {

    @Autowired
    private KPIRepository kpiRepository;

    @Autowired
    private GoalRepository goalRepository;

    private String requireTenantId() {
        String tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant context is required for mutations");
        }
        return tenantId;
    }

    public KPIDTO createKPI(Long goalId, KPIDTO kpiDTO) {
        String tenantId = requireTenantId();
        
        Goal goal = goalRepository.findByIdAndTenantId(goalId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));
        
        KPI kpi = new KPI();
        kpi.setTenant(goal.getTenant());
        kpi.setGoal(goal);
        kpi.setDescription(kpiDTO.getDescription());
        kpi.setDueDate(LocalDate.parse(kpiDTO.getDueDate().toString()));
        
        if (kpiDTO.getStatus() != null) {
            kpi.setStatus(kpiDTO.getStatus());
        }
        
        if (kpiDTO.getCompletionPercentage() != null) {
            kpi.setCompletionPercentage(kpiDTO.getCompletionPercentage());
            // Auto-set status to ACHIEVED if completion is 100%
            if (kpiDTO.getCompletionPercentage() == 100) {
                kpi.setStatus(KPI.KPIStatus.ACHIEVED);
            }
        }
        
        KPI saved = kpiRepository.save(kpi);
        return convertToDTO(saved);
    }

    public KPIDTO updateKPI(Long id, KPIDTO kpiDTO) {
        String tenantId = requireTenantId();
        
        KPI kpi = kpiRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("KPI not found"));
        
        if (kpiDTO.getDescription() != null) {
            kpi.setDescription(kpiDTO.getDescription());
        }
        
        if (kpiDTO.getStatus() != null) {
            kpi.setStatus(kpiDTO.getStatus());
            // Auto-set completion percentage based on status
            if (kpiDTO.getStatus() == KPI.KPIStatus.ACHIEVED) {
                kpi.setCompletionPercentage(100);
            } else if (kpiDTO.getStatus() == KPI.KPIStatus.NOT_STARTED) {
                kpi.setCompletionPercentage(0);
            }
        }
        
        if (kpiDTO.getCompletionPercentage() != null) {
            kpi.setCompletionPercentage(kpiDTO.getCompletionPercentage());
            // Auto-set status to ACHIEVED if completion is 100%
            if (kpiDTO.getCompletionPercentage() == 100) {
                kpi.setStatus(KPI.KPIStatus.ACHIEVED);
            }
        }
        
        if (kpiDTO.getDueDate() != null) {
            kpi.setDueDate(LocalDate.parse(kpiDTO.getDueDate().toString()));
        }
        
        KPI saved = kpiRepository.save(kpi);
        return convertToDTO(saved);
    }

    public void deleteKPI(Long id) {
        String tenantId = requireTenantId();
        KPI kpi = kpiRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("KPI not found"));
        kpiRepository.delete(kpi);
    }

    public List<KPIDTO> getKPIsByGoalId(Long goalId) {
        String tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return List.of();
        }
        return kpiRepository.findByGoalIdAndTenantId(goalId, tenantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private KPIDTO convertToDTO(KPI kpi) {
        KPIDTO dto = new KPIDTO();
        dto.setId(kpi.getId());
        dto.setDescription(kpi.getDescription());
        dto.setStatus(kpi.getStatus());
        dto.setCompletionPercentage(kpi.getCompletionPercentage());
        dto.setDueDate(kpi.getDueDate());
        dto.setGoalId(kpi.getGoal().getId());
        return dto;
    }
}


