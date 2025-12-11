package com.performancemanagement.graphql;

import com.performancemanagement.model.Goal;
import com.performancemanagement.model.User;
import graphql.kickstart.tools.GraphQLResolver;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GoalResolver implements GraphQLResolver<Goal> {

    public User owner(Goal goal) {
        return goal.getOwner();
    }

    public Goal parentGoal(Goal goal) {
        return goal.getParentGoal();
    }

    public List<Goal> childGoals(Goal goal) {
        return goal.getChildGoals().stream().toList();
    }

    public List<User> assignedUsers(Goal goal) {
        return goal.getAssignedUsers().stream().toList();
    }
}
