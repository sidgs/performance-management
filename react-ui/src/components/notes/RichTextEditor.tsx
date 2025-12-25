import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

interface RichTextEditorProps {
  initialContent?: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  placeholder?: string;
  loading?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent = '',
  onSave,
  onCancel,
  placeholder = 'Enter your note...',
  loading = false,
}) => {
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim());
    }
  };

  return (
    <Box>
      <TextField
        fullWidth
        multiline
        rows={6}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        variant="outlined"
        disabled={loading}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
          },
        }}
      />
      <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
          startIcon={<CancelIcon />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || !content.trim()}
          startIcon={<SaveIcon />}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Tip: You can use basic formatting. HTML tags will be preserved.
      </Typography>
    </Box>
  );
};

export default RichTextEditor;
