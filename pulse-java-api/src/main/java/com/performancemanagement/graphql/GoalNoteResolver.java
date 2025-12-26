package com.performancemanagement.graphql;

import com.performancemanagement.config.TenantContext;
import com.performancemanagement.model.Goal;
import com.performancemanagement.model.GoalNote;
import com.performancemanagement.model.User;
import com.performancemanagement.repository.GoalNoteRepository;
import graphql.kickstart.tools.GraphQLResolver;
import jakarta.persistence.EntityManager;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class GoalNoteResolver implements GraphQLResolver<GoalNote> {

    @Autowired
    private EntityManager entityManager;

    private String getCurrentTenantId() {
        return TenantContext.getCurrentTenantId();
    }

    @Transactional(readOnly = true)
    public Goal goal(GoalNote note) {
        note = entityManager.merge(note);
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            Goal goal = note.getGoal();
            if (goal != null) {
                Hibernate.initialize(goal);
                Hibernate.initialize(goal.getTenant());
            }
            return goal;
        }
        Goal goal = note.getGoal();
        if (goal != null) {
            Hibernate.initialize(goal);
            Hibernate.initialize(goal.getTenant());
            if (goal.getTenant().getFqdn().equals(tenantId)) {
                return goal;
            }
        }
        return null;
    }

    @Transactional(readOnly = true)
    public User author(GoalNote note) {
        note = entityManager.merge(note);
        String tenantId = getCurrentTenantId();
        if (tenantId == null) {
            User author = note.getAuthor();
            if (author != null) {
                Hibernate.initialize(author);
                Hibernate.initialize(author.getTenant());
            }
            return author;
        }
        User author = note.getAuthor();
        if (author != null) {
            Hibernate.initialize(author);
            Hibernate.initialize(author.getTenant());
            if (author.getTenant().getFqdn().equals(tenantId)) {
                return author;
            }
        }
        return null;
    }

    @Transactional(readOnly = true)
    public String createdAt(GoalNote note) {
        note = entityManager.merge(note);
        if (note.getCreatedAt() != null) {
            return note.getCreatedAt().toString();
        }
        return null;
    }

    @Transactional(readOnly = true)
    public String updatedAt(GoalNote note) {
        note = entityManager.merge(note);
        if (note.getUpdatedAt() != null) {
            return note.getUpdatedAt().toString();
        }
        return null;
    }
}
