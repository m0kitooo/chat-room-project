import { $ZodIssue } from 'zod/v4/core';

const formatZodIssues = (issues: $ZodIssue[]) => issues.reduce((acc, issue) => {
  const path = issue.path.join('.');
  acc[path] ??= [];
  acc[path].push(issue.message);
  return acc;
}, {} as Record<string, string[]>);

export { formatZodIssues };