import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Paper,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListNumbered as FormatListNumberedIcon,
  Link as LinkIcon,
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
  const textFieldRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim());
    }
  };

  const insertText = (before: string, after: string = '') => {
    const textField = textFieldRef.current;
    if (!textField) return;

    const start = textField.selectionStart;
    const end = textField.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newText);

    // Restore cursor position
    setTimeout(() => {
      textField.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textField.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleFormat = (format: string) => {
    switch (format) {
      case 'bold':
        insertText('<strong>', '</strong>');
        break;
      case 'italic':
        insertText('<em>', '</em>');
        break;
      case 'bullet':
        insertText('<ul><li>', '</li></ul>');
        break;
      case 'number':
        insertText('<ol><li>', '</li></ol>');
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          const text = textFieldRef.current?.selectionStart !== textFieldRef.current?.selectionEnd
            ? content.substring(textFieldRef.current!.selectionStart, textFieldRef.current!.selectionEnd)
            : 'Link';
          insertText(`<a href="${url}">${text}</a>`, '');
        }
        break;
    }
  };

  return (
    <Box>
      <Paper variant="outlined" sx={{ mb: 1 }}>
        <Toolbar variant="dense" sx={{ minHeight: '40px !important', gap: 0.5 }}>
          <ToggleButtonGroup size="small" exclusive>
            <ToggleButton
              value="bold"
              onClick={() => handleFormat('bold')}
              disabled={loading}
              size="small"
            >
              <FormatBoldIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton
              value="italic"
              onClick={() => handleFormat('italic')}
              disabled={loading}
              size="small"
            >
              <FormatItalicIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton
              value="bullet"
              onClick={() => handleFormat('bullet')}
              disabled={loading}
              size="small"
            >
              <FormatListBulletedIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton
              value="number"
              onClick={() => handleFormat('number')}
              disabled={loading}
              size="small"
            >
              <FormatListNumberedIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton
              value="link"
              onClick={() => handleFormat('link')}
              disabled={loading}
              size="small"
            >
              <LinkIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Toolbar>
      </Paper>
      <TextField
        inputRef={textFieldRef}
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
        Tip: Use the formatting buttons above or type HTML tags directly (e.g., &lt;strong&gt;bold&lt;/strong&gt;).
      </Typography>
    </Box>
  );
};

export default RichTextEditor;
