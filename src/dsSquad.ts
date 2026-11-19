/** The data-science squad: what the sim staff are called and working on. Roles stay the same, so every character keeps its sprite. */
const TITLES: Record<string, string> = {
  'code-reviewer': 'Senior Data Scientist',
  'ai-engineer': 'ML Engineer',
  'devops-engineer': 'ML Engineer',
  'performance-engineer': 'ML Engineer',
  'fullstack-developer': 'Data Engineer',
  debugger: 'Data Engineer',
  'frontend-developer': 'Data Analyst',
  'security-auditor': 'QA & Model Critic',
  'test-engineer': 'QA & Model Critic',
  'architect-reviewer': 'Principal Data Scientist',
  Explore: 'Research Analyst',
  Plan: 'Senior Data Scientist',
}
const TASKS: Record<string, string> = {
  'Senior Data Scientist': 'Writing the project spec and delegating tickets',
  'ML Engineer': 'Packaging the model for the server room',
  'Data Engineer': 'Building the feature pipeline and data contract',
  'Data Analyst': 'Running EDA and error-slice analysis',
  'QA & Model Critic': 'Auditing the train/test split for leakage',
  'Principal Data Scientist': 'Reviewing the architecture before heavy compute',
  'Research Analyst': 'Scanning papers for stronger baselines',
}
export const dsTitle = (role: string, fallback: string): string => TITLES[role] ?? fallback
export const dsTask = (role: string, fallback: string): string => TASKS[TITLES[role] ?? ''] ?? fallback
