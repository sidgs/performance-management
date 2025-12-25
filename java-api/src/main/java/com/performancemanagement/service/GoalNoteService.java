package com.performancemanagement.service;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.config.UserContext;
import com.performancemanagement.model.Goal;
import com.performancemanagement.model.GoalNote;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.GoalNoteRepository;
import com.performancemanagement.repository.GoalRepository;
import com.performancemanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class GoalNoteService {

    @Autowired
    private GoalNoteRepository goalNoteRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorizationService authorizationService;

    private String getCurrentTenantId() {
        return TenantContext.getCurrentTenantId();
    }

    private String requireTenantId() {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant context required for this operation");
        }
        return tenantId;
    }

    /**
     * Check if current user can view notes for a goal.
     * Users can view notes if they are: goal owner, assigned user, or HR_ADMIN
     */
    private boolean canViewGoal(Goal goal) {
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            return false;
        }

        // HR_ADMIN can view all notes
        if (authorizationService.isHrAdmin()) {
            return true;
        }

        // Check if user is goal owner
        boolean isOwner = goal.getOwner() != null && 
                         Objects.equals(goal.getOwner().getId(), currentUser.getId());

        // Check if user is assigned to the goal
        boolean isAssigned = goal.getAssignedUsers().stream()
                .anyMatch(user -> Objects.equals(user.getId(), currentUser.getId()));

        return isOwner || isAssigned;
    }

    /**
     * Create a new note for a goal.
     * Users can create notes if they can view the goal.
     */
    public GoalNote createNote(Long goalId, String content) {
        String tenantId = requireTenantId();
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("User not authenticated");
        }

        Goal goal = goalRepository.findByIdAndTenantId(goalId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));

        // Check authorization
        if (!canViewGoal(goal)) {
            throw new IllegalStateException("You do not have permission to create notes for this goal");
        }

        GoalNote note = new GoalNote();
        note.setTenant(TenantContext.getCurrentTenant());
        note.setGoal(goal);
        note.setAuthor(currentUser);
        note.setContent(content);

        return goalNoteRepository.save(note);
    }

    /**
     * Update a note. Only the note author can update their notes.
     */
    public GoalNote updateNote(Long noteId, String content) {
        String tenantId = requireTenantId();
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("User not authenticated");
        }

        GoalNote note = goalNoteRepository.findByIdAndTenantId(noteId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Note not found"));

        // Check if current user is the author
        if (!Objects.equals(note.getAuthor().getId(), currentUser.getId())) {
            throw new IllegalStateException("Only the note author can update this note");
        }

        note.setContent(content);
        return goalNoteRepository.save(note);
    }

    /**
     * Delete a note. Only the note author can delete their notes.
     */
    public void deleteNote(Long noteId) {
        String tenantId = requireTenantId();
        User currentUser = UserContext.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("User not authenticated");
        }

        GoalNote note = goalNoteRepository.findByIdAndTenantId(noteId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Note not found"));

        // Check if current user is the author
        if (!Objects.equals(note.getAuthor().getId(), currentUser.getId())) {
            throw new IllegalStateException("Only the note author can delete this note");
        }

        goalNoteRepository.delete(note);
    }

    /**
     * Get all notes for a goal, with authorization filtering.
     * Only returns notes if the user can view the goal.
     */
    @Transactional(readOnly = true)
    public List<GoalNote> getNotesByGoalId(Long goalId) {
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            return List.of();
        }

        Goal goal = goalRepository.findByIdAndTenantId(goalId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));

        // Check authorization
        if (!canViewGoal(goal)) {
            return List.of();
        }

        return goalNoteRepository.findByGoalIdAndTenantId(goalId, tenantId);
    }
}
