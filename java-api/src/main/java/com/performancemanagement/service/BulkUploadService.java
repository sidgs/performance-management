package com.performancemanagement.service;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.dto.BulkUploadDTO;
import com.performancemanagement.model.Department;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.DepartmentRepository;
import com.performancemanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class BulkUploadService {

    private static final Logger logger = LoggerFactory.getLogger(BulkUploadService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;


    /**
     * Parse CSV data and return list of rows
     */
    public List<BulkUploadDTO.BulkUploadRow> parseCSV(String csvData) {
        List<BulkUploadDTO.BulkUploadRow> rows = new ArrayList<>();
        String[] lines = csvData.split("\n");
        
        if (lines.length < 2) {
            throw new IllegalArgumentException("CSV must have at least a header row and one data row");
        }

        // Parse header
        String[] headers = parseCSVLine(lines[0]);
        Map<String, Integer> headerMap = new HashMap<>();
        for (int i = 0; i < headers.length; i++) {
            headerMap.put(headers[i].trim().toLowerCase(), i);
        }

        // Validate required columns
        if (!headerMap.containsKey("email")) {
            throw new IllegalArgumentException("CSV must contain an 'email' column");
        }

        // Parse data rows
        for (int i = 1; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) {
                continue;
            }

            String[] values = parseCSVLine(line);
            BulkUploadDTO.BulkUploadRow row = new BulkUploadDTO.BulkUploadRow();
            
            int emailIndex = headerMap.get("email");
            if (emailIndex < values.length) {
                row.setEmail(values[emailIndex].trim());
            }

            if (headerMap.containsKey("firstname") && headerMap.get("firstname") < values.length) {
                row.setFirstName(values[headerMap.get("firstname")].trim());
            }
            if (headerMap.containsKey("lastname") && headerMap.get("lastname") < values.length) {
                row.setLastName(values[headerMap.get("lastname")].trim());
            }
            if (headerMap.containsKey("title") && headerMap.get("title") < values.length) {
                row.setTitle(values[headerMap.get("title")].trim());
            }
            if (headerMap.containsKey("manageremail") && headerMap.get("manageremail") < values.length) {
                row.setManagerEmail(values[headerMap.get("manageremail")].trim());
            }
            if (headerMap.containsKey("departmentname") && headerMap.get("departmentname") < values.length) {
                row.setDepartmentName(values[headerMap.get("departmentname")].trim());
            }
            if (headerMap.containsKey("role") && headerMap.get("role") < values.length) {
                row.setRole(values[headerMap.get("role")].trim());
            }

            if (row.getEmail() != null && !row.getEmail().isEmpty()) {
                rows.add(row);
            }
        }

        return rows;
    }

    private String[] parseCSVLine(String line) {
        List<String> fields = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder currentField = new StringBuilder();

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                fields.add(currentField.toString());
                currentField = new StringBuilder();
            } else {
                currentField.append(c);
            }
        }
        fields.add(currentField.toString());

        return fields.toArray(new String[0]);
    }

    /**
     * Process bulk upload: create or update users, managers, and departments
     */
    @CacheEvict(value = {"users", "user", "userByEmail", "departments", "department", "rootDepartments"}, allEntries = true)
    public BulkUploadDTO.BulkUploadResult processBulkUpload(List<BulkUploadDTO.BulkUploadRow> rows) {
        String tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant context required for bulk upload");
        }

        BulkUploadDTO.BulkUploadResult result = new BulkUploadDTO.BulkUploadResult();
        result.setTotalRows(rows.size());
        result.setUsersCreated(0);
        result.setUsersUpdated(0);
        result.setDepartmentsCreated(0);
        result.setDepartmentsUpdated(0);
        result.setErrors(new ArrayList<>());

        // First pass: Create/update departments
        Map<String, Department> departmentMap = new HashMap<>();
        for (BulkUploadDTO.BulkUploadRow row : rows) {
            if (row.getDepartmentName() != null && !row.getDepartmentName().trim().isEmpty()) {
                String deptName = row.getDepartmentName().trim();
                if (!departmentMap.containsKey(deptName)) {
                    try {
                        Optional<Department> existingDept = departmentRepository.findByNameAndTenantId(deptName, tenantId);
                        if (existingDept.isPresent()) {
                            departmentMap.put(deptName, existingDept.get());
                            result.setDepartmentsUpdated(result.getDepartmentsUpdated() + 1);
                        } else {
                            // Create new department - owner will be set in second pass after users are created
                            Department newDept = new Department();
                            newDept.setTenant(TenantContext.getCurrentTenant());
                            newDept.setName(deptName);
                            newDept.setSmallDescription("Department: " + deptName);
                            newDept.setCreationDate(LocalDate.now());
                            newDept.setStatus(Department.DepartmentStatus.ACTIVE);
                            
                            // We need an owner - will set it in second pass after users are created
                            // For now, create without owner - we'll update it
                            Department saved = departmentRepository.save(newDept);
                            departmentMap.put(deptName, saved);
                            result.setDepartmentsCreated(result.getDepartmentsCreated() + 1);
                        }
                    } catch (Exception e) {
                        result.getErrors().add("Error processing department '" + deptName + "': " + e.getMessage());
                        logger.error("Error processing department: " + deptName, e);
                    }
                }
            }
        }

        // Second pass: Create/update users and assign managers/departments
        Map<String, User> userMap = new HashMap<>();
        for (BulkUploadDTO.BulkUploadRow row : rows) {
            if (row.getEmail() == null || row.getEmail().trim().isEmpty()) {
                result.getErrors().add("Skipping row with empty email");
                continue;
            }

            try {
                String email = row.getEmail().trim().toLowerCase();
                Optional<User> existingUserOpt = userRepository.findByEmailAndTenantId(email, tenantId);

                User user;

                if (existingUserOpt.isPresent()) {
                    // Update existing user
                    user = existingUserOpt.get();
                    if (row.getFirstName() != null && !row.getFirstName().trim().isEmpty()) {
                        user.setFirstName(row.getFirstName().trim());
                    }
                    if (row.getLastName() != null && !row.getLastName().trim().isEmpty()) {
                        user.setLastName(row.getLastName().trim());
                    }
                    if (row.getTitle() != null && !row.getTitle().trim().isEmpty()) {
                        user.setTitle(row.getTitle().trim());
                    }
                    if (row.getRole() != null && !row.getRole().trim().isEmpty()) {
                        if ("EPM_ADMIN".equalsIgnoreCase(row.getRole().trim())) {
                            user.setRole(User.Role.EPM_ADMIN);
                        } else {
                            user.setRole(User.Role.USER);
                        }
                    }
                    result.setUsersUpdated(result.getUsersUpdated() + 1);
                } else {
                    // Create new user
                    user = new User();
                    user.setTenant(TenantContext.getCurrentTenant());
                    user.setEmail(email);
                    user.setFirstName(row.getFirstName() != null ? row.getFirstName().trim() : "");
                    user.setLastName(row.getLastName() != null ? row.getLastName().trim() : "");
                    user.setTitle(row.getTitle() != null ? row.getTitle().trim() : null);
                    
                    if (row.getRole() != null && "EPM_ADMIN".equalsIgnoreCase(row.getRole().trim())) {
                        user.setRole(User.Role.EPM_ADMIN);
                    } else {
                        user.setRole(User.Role.USER);
                    }
                    
                    result.setUsersCreated(result.getUsersCreated() + 1);
                }

                // Assign manager if specified
                if (row.getManagerEmail() != null && !row.getManagerEmail().trim().isEmpty()) {
                    String managerEmail = row.getManagerEmail().trim().toLowerCase();
                    // Check if manager is in the same batch (userMap) or already exists
                    User manager = userMap.get(managerEmail);
                    if (manager == null) {
                        Optional<User> existingManager = userRepository.findByEmailAndTenantId(managerEmail, tenantId);
                        if (existingManager.isPresent()) {
                            manager = existingManager.get();
                        } else {
                            result.getErrors().add("Manager with email '" + managerEmail + "' not found for user '" + email + "'");
                        }
                    }
                    if (manager != null) {
                        user.setManager(manager);
                    }
                }

                // Assign department if specified
                if (row.getDepartmentName() != null && !row.getDepartmentName().trim().isEmpty()) {
                    String deptName = row.getDepartmentName().trim();
                    Department department = departmentMap.get(deptName);
                    if (department != null) {
                        user.setDepartment(department);
                        // If department doesn't have an owner yet, set this user as owner
                        if (department.getOwner() == null) {
                            department.setOwner(user);
                            departmentRepository.save(department);
                        }
                    }
                }

                user = userRepository.save(user);
                userMap.put(email, user);

            } catch (Exception e) {
                result.getErrors().add("Error processing user '" + row.getEmail() + "': " + e.getMessage());
                logger.error("Error processing user: " + row.getEmail(), e);
            }
        }

        return result;
    }
}

