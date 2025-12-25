/**
 * Service for accessing demo users in dev/demo mode
 * Provides demo users from demo-data.json for login purposes
 */

export interface DemoUser {
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  role: string;
}

/**
 * Demo users from demo-data.json
 * These are used when logging in as an existing user in dev/demo mode
 */
const DEMO_USERS: DemoUser[] = [
  {
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah.chen@techconsult.demo",
    title: "Chief Executive Officer",
    role: "EPM_ADMIN"
  },
  {
    firstName: "Michael",
    lastName: "Rodriguez",
    email: "michael.rodriguez@techconsult.demo",
    title: "VP of Engineering",
    role: "USER"
  },
  {
    firstName: "Emily",
    lastName: "Watson",
    email: "emily.watson@techconsult.demo",
    title: "VP of Consulting",
    role: "USER"
  },
  {
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@techconsult.demo",
    title: "VP of Sales",
    role: "USER"
  },
  {
    firstName: "Jennifer",
    lastName: "Martinez",
    email: "jennifer.martinez@techconsult.demo",
    title: "VP of Human Resources",
    role: "HR_ADMIN"
  },
  {
    firstName: "Robert",
    lastName: "Taylor",
    email: "robert.taylor@techconsult.demo",
    title: "VP of Operations",
    role: "USER"
  },
  {
    firstName: "Amanda",
    lastName: "Johnson",
    email: "amanda.johnson@techconsult.demo",
    title: "Engineering Manager",
    role: "USER"
  },
  {
    firstName: "James",
    lastName: "Brown",
    email: "james.brown@techconsult.demo",
    title: "Senior Software Engineer",
    role: "USER"
  },
  {
    firstName: "Lisa",
    lastName: "Anderson",
    email: "lisa.anderson@techconsult.demo",
    title: "Software Engineer",
    role: "USER"
  },
  {
    firstName: "Christopher",
    lastName: "Lee",
    email: "christopher.lee@techconsult.demo",
    title: "Consulting Manager",
    role: "USER"
  },
  {
    firstName: "Jessica",
    lastName: "White",
    email: "jessica.white@techconsult.demo",
    title: "Senior Consultant",
    role: "USER"
  },
  {
    firstName: "Daniel",
    lastName: "Harris",
    email: "daniel.harris@techconsult.demo",
    title: "Consultant",
    role: "USER"
  },
  {
    firstName: "Michelle",
    lastName: "Clark",
    email: "michelle.clark@techconsult.demo",
    title: "Sales Manager",
    role: "USER"
  },
  {
    firstName: "Matthew",
    lastName: "Lewis",
    email: "matthew.lewis@techconsult.demo",
    title: "Account Executive",
    role: "USER"
  },
  {
    firstName: "Nicole",
    lastName: "Walker",
    email: "nicole.walker@techconsult.demo",
    title: "Business Development Representative",
    role: "USER"
  },
  {
    firstName: "Kevin",
    lastName: "Hall",
    email: "kevin.hall@techconsult.demo",
    title: "HR Manager",
    role: "HR_ADMIN"
  },
  {
    firstName: "Stephanie",
    lastName: "Allen",
    email: "stephanie.allen@techconsult.demo",
    title: "HR Coordinator",
    role: "MANAGER_ASSISTANT"
  },
  {
    firstName: "Ryan",
    lastName: "Young",
    email: "ryan.young@techconsult.demo",
    title: "Operations Manager",
    role: "USER"
  },
  {
    firstName: "Ashley",
    lastName: "King",
    email: "ashley.king@techconsult.demo",
    title: "Operations Coordinator",
    role: "USER"
  }
];

/**
 * Get all demo users
 * In the future, this could try to fetch from the API first and fall back to demo data
 */
export async function getDemoUsers(): Promise<DemoUser[]> {
  // For now, return the hardcoded demo users
  // In the future, we could try to fetch from the API if available
  return DEMO_USERS;
}

/**
 * Get a demo user by email
 */
export async function getDemoUserByEmail(email: string): Promise<DemoUser | null> {
  const users = await getDemoUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Convert role string to array format expected by auth service
 * The auth service expects roles as an array, and we store a single role
 */
export function roleToArray(role: string): string[] {
  // Normalize role to match what the backend expects
  const normalizedRole = role.toUpperCase();
  return [normalizedRole];
}

