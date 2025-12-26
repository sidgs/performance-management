import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Upload as UploadIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { graphqlRequest } from '../api/graphqlClient';
import { isEpmAdmin } from '../api/authService';

interface BulkUploadRow {
  email: string;
  firstName: string;
  lastName: string;
  title: string;
  managerEmail: string;
  departmentName: string;
  role: string;
}

interface BulkUploadResult {
  totalRows: number;
  usersCreated: number;
  usersUpdated: number;
  departmentsCreated: number;
  departmentsUpdated: number;
  errors: string[];
}

const BulkUploadPage: React.FC = () => {
  const [csvData, setCsvData] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<BulkUploadRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user is EPM_ADMIN
  if (!isEpmAdmin()) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body2">
            You must have EPM_ADMIN role to access the bulk upload feature.
          </Typography>
        </Alert>
      </Box>
    );
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(text);
      parseAndPreviewCSV(text);
    };
    reader.readAsText(file);
  };

  const parseAndPreviewCSV = (csvText: string) => {
    try {
      const lines = csvText.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        alert('CSV must have at least a header row and one data row');
        return;
      }

      // Parse header
      const headers = parseCSVLine(lines[0]);
      const headerMap: Record<string, number> = {};
      headers.forEach((header, index) => {
        headerMap[header.trim().toLowerCase()] = index;
      });

      if (!headerMap.email) {
        alert('CSV must contain an "email" column');
        return;
      }

      // Parse data rows
      const rows: BulkUploadRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === 0) continue;

        const row: BulkUploadRow = {
          email: values[headerMap.email]?.trim() || '',
          firstName: values[headerMap.firstname]?.trim() || '',
          lastName: values[headerMap.lastname]?.trim() || '',
          title: values[headerMap.title]?.trim() || '',
          managerEmail: values[headerMap.manageremail]?.trim() || '',
          departmentName: values[headerMap.departmentname]?.trim() || '',
          role: values[headerMap.role]?.trim() || '',
        };

        if (row.email) {
          rows.push(row);
        }
      }

      setPreviewRows(rows);
    } catch (error) {
      alert('Error parsing CSV: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const fields: string[] = [];
    let inQuotes = false;
    let currentField = '';

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += c;
      }
    }
    fields.push(currentField);

    return fields;
  };

  const handleUpload = async () => {
    if (!csvData || previewRows.length === 0) {
      alert('Please select a CSV file first');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const mutation = `
        mutation BulkUploadUsers($csvData: String!) {
          bulkUploadUsers(csvData: $csvData) {
            totalRows
            usersCreated
            usersUpdated
            departmentsCreated
            departmentsUpdated
            errors
          }
        }
      `;

      const data = await graphqlRequest<{ bulkUploadUsers: BulkUploadResult }>(
        mutation,
        { csvData }
      );

      setUploadResult(data.bulkUploadUsers);
      setShowResultDialog(true);
      
      // Clear the form after successful upload
      setCsvData('');
      setPreviewRows([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert('Error uploading: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setCsvData('');
    setPreviewRows([]);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" gutterBottom>
          Bulk Upload Users
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
          Upload users, managers, and departments from a CSV file
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            CSV Format
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your CSV file should have the following columns (email is required):
          </Typography>
          <Box component="pre" sx={{ 
            backgroundColor: 'grey.100', 
            p: 2, 
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.875rem'
          }}>
{`email,firstName,lastName,title,managerEmail,departmentName,role
john.doe@example.com,John,Doe,Software Engineer,jane.smith@example.com,Engineering,USER
jane.smith@example.com,Jane,Smith,Engineering Manager,,Engineering,EPM_ADMIN`}
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ mr: 2 }}
            >
              Select CSV File
            </Button>
            {csvData && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleClear}
              >
                Clear
              </Button>
            )}
          </Box>

          {previewRows.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Preview ({previewRows.length} rows)
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 400, mb: 3 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell>First Name</TableCell>
                      <TableCell>Last Name</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Manager Email</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Role</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewRows.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>{row.firstName}</TableCell>
                        <TableCell>{row.lastName}</TableCell>
                        <TableCell>{row.title}</TableCell>
                        <TableCell>{row.managerEmail || '-'}</TableCell>
                        <TableCell>{row.departmentName || '-'}</TableCell>
                        <TableCell>{row.role || 'USER'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Button
                variant="contained"
                size="large"
                startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload & Process'}
              </Button>
            </Box>
          )}

          {csvData && previewRows.length === 0 && (
            <Alert severity="warning">
              No valid rows found in CSV. Please check the format.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Upload Result Dialog */}
      <Dialog
        open={showResultDialog}
        onClose={() => setShowResultDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {uploadResult && uploadResult.errors.length === 0 ? (
              <CheckCircleIcon color="success" />
            ) : (
              <ErrorIcon color="warning" />
            )}
            Upload Complete
          </Box>
        </DialogTitle>
        <DialogContent>
          {uploadResult && (
            <Box>
              <DialogContentText gutterBottom>
                <strong>Total Rows Processed:</strong> {uploadResult.totalRows}
              </DialogContentText>
              <Box sx={{ display: 'flex', gap: 2, my: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={`${uploadResult.usersCreated} Users Created`}
                  color="success"
                  icon={<CheckCircleIcon />}
                />
                <Chip
                  label={`${uploadResult.usersUpdated} Users Updated`}
                  color="info"
                  icon={<CheckCircleIcon />}
                />
                <Chip
                  label={`${uploadResult.departmentsCreated} Departments Created`}
                  color="success"
                  icon={<CheckCircleIcon />}
                />
                <Chip
                  label={`${uploadResult.departmentsUpdated} Departments Updated`}
                  color="info"
                  icon={<CheckCircleIcon />}
                />
              </Box>
              {uploadResult.errors.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Errors ({uploadResult.errors.length}):
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {uploadResult.errors.map((error, index) => (
                      <li key={index}>
                        <Typography variant="body2" color="error">
                          {error}
                        </Typography>
                      </li>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResultDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BulkUploadPage;

