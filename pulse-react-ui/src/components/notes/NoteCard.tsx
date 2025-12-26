import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Stack,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import RichTextEditor from './RichTextEditor';
import type { GoalNote, User } from '../../types';
import { getCurrentUserEmail } from '../../api/authService';

interface NoteCardProps {
  note: GoalNote;
  onEdit: (noteId: string, content: string) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
  loading?: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserEmail = getCurrentUserEmail();
  const isAuthor = note.author.email === currentUserEmail;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(note.content);
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      setError('Note content cannot be empty');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onEdit(note.id, editContent.trim());
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(note.content);
    setError(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(note.id);
      setDeleteDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };

  // Render HTML content safely
  const renderContent = (content: string) => {
    // Basic HTML sanitization - allow only safe tags
    const allowedTags = ['strong', 'em', 'b', 'i', 'u', 'ul', 'ol', 'li', 'a', 'p', 'br'];
    const allowedAttributes = ['href', 'target'];
    
    // Simple HTML sanitization (in production, use a library like DOMPurify)
    let sanitized = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ''); // Remove iframes
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitized;
    
    // Remove disallowed tags and attributes
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_ELEMENT,
      null
    );
    
    const nodesToRemove: Node[] = [];
    let node;
    while (node = walker.nextNode()) {
      const element = node as Element;
      if (!allowedTags.includes(element.tagName.toLowerCase())) {
        nodesToRemove.push(node);
      } else {
        // Remove disallowed attributes
        Array.from(element.attributes).forEach(attr => {
          if (!allowedAttributes.includes(attr.name.toLowerCase())) {
            element.removeAttribute(attr.name);
          }
        });
        // Ensure links open in new tab
        if (element.tagName.toLowerCase() === 'a') {
          element.setAttribute('target', '_blank');
          element.setAttribute('rel', 'noopener noreferrer');
        }
      }
    }
    
    nodesToRemove.forEach(n => n.parentNode?.removeChild(n));
    
    return (
      <Box
        sx={{
          '& strong, & b': { fontWeight: 'bold' },
          '& em, & i': { fontStyle: 'italic' },
          '& ul, & ol': { marginLeft: 2, marginTop: 1, marginBottom: 1 },
          '& li': { marginBottom: 0.5 },
          '& a': { color: 'primary.main', textDecoration: 'underline' },
          '& p': { marginBottom: 1 },
        }}
        dangerouslySetInnerHTML={{ __html: tempDiv.innerHTML }}
      />
    );
  };

  return (
    <>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {note.author.firstName[0]}{note.author.lastName[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {note.author.firstName} {note.author.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {note.author.title || note.author.email}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {formatDate(note.createdAt)}
                  {note.updatedAt !== note.createdAt && ' (edited)'}
                </Typography>
              </Box>
            </Box>
            {isAuthor && !isEditing && (
              <Stack direction="row" spacing={1}>
                <Tooltip title="Edit Note">
                  <IconButton
                    size="small"
                    onClick={handleEdit}
                    disabled={loading}
                    color="primary"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Note">
                  <IconButton
                    size="small"
                    onClick={handleDeleteClick}
                    disabled={loading}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Box>

          {isEditing ? (
            <Box>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <RichTextEditor
                initialContent={editContent}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                loading={isSaving}
              />
            </Box>
          ) : (
            <Box
              sx={{
                wordBreak: 'break-word',
                color: 'text.primary',
                lineHeight: 1.6,
                '& strong, & b': { fontWeight: 'bold' },
                '& em, & i': { fontStyle: 'italic' },
                '& ul, & ol': { marginLeft: 2, marginTop: 1, marginBottom: 1 },
                '& li': { marginBottom: 0.5 },
                '& a': { color: 'primary.main', textDecoration: 'underline' },
                '& p': { marginBottom: 1 },
              }}
            >
              {renderContent(note.content)}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this note? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={isDeleting}
            startIcon={<DeleteIcon />}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NoteCard;
