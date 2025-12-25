package com.performancemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkUploadDTO {
    private String csvData;
    private List<BulkUploadRow> rows;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BulkUploadRow {
        private String email;
        private String firstName;
        private String lastName;
        private String title;
        private String managerEmail;
        private String departmentName;
        private String role;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BulkUploadResult {
        private int totalRows;
        private int usersCreated;
        private int usersUpdated;
        private int departmentsCreated;
        private int departmentsUpdated;
        private List<String> errors;
    }
}

