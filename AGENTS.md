 StacStart Development Rules

 Project

StacStart Hackathon 2026 MVP.

This project is being built during the official hackathon Build Week.

 Role of AI

AI is a development assistant, not the project owner.

Before making major changes:

1. Understand the existing project.
2. Read the relevant documentation.
3. Check the existing implementation.
4. Make the smallest reasonable change.
5. Explain major changes before implementing them.

Do not invent product requirements.

Do not build features that have not been agreed by the team.

 Code Style

Write simple, readable, maintainable code.

Prefer:

- Small components
- Small functions
- Clear variable and function names
- Straightforward TypeScript
- Reusable components when reuse is actually needed
- Simple logic over clever abstractions

Avoid:

- Over-engineering
- Unnecessary design patterns
- Huge components
- Huge files
- Deep abstraction layers
- Unnecessary helper functions
- Unnecessary dependencies
- Excessive comments
- Comments that explain obvious code
- Generated boilerplate that is not needed

The code should look like code maintained by a normal professional development team, not a generated template.

 Existing Code

Before modifying a file:

- Read the relevant code first.
- Preserve working behavior.
- Do not rewrite unrelated sections.
- Do not rename things without a reason.
- Do not restructure the project without approval.

 Dependencies

Do not install a package unless:

1. It is necessary for the current feature.
2. The project does not already have a suitable solution.
3. The reason for adding it is clear.

Prefer existing project dependencies and native platform capabilities when practical.

 UI/UX

Follow the approved UI/UX designs.

Do not invent new screens, layouts, colors, interactions, or user flows without approval.

If the design is unclear:

- Identify the ambiguity.
- Ask for clarification or document the assumption.
- Do not silently invent a solution.

Keep responsive behavior in mind.

 Product Scope

Build the MVP first.

Priority:

P0 = Required for the core user journey.

P1 = Important supporting functionality.

P2 = Optional enhancements.

P2 features must never delay P0 functionality.

 Security

Never commit:

- API keys
- Passwords
- Tokens
- Private credentials
- Environment secrets

Use environment variables.

Never expose server-only credentials in frontend code.

 Git

The repository uses:

main = stable/demo-ready code

develop = active integration branch

feature/* = individual development work

Do not push directly to main.

Keep commits focused and meaningful.

Use commit prefixes where appropriate:

feat:
fix:
docs:
design:
test:
chore:

Do not mix unrelated changes in one commit.

 Testing

Before declaring a task complete:

1. Run the relevant checks.
2. Test the affected feature.
3. Check for obvious errors.
4. Confirm existing functionality still works.

Do not claim something works without testing it.

 File Changes

Only modify files required for the current task.

Avoid unnecessary formatting changes across unrelated files.

Keep pull requests focused and easy for another team member to review.

 Communication

For significant work, provide:

- What changed
- Why it changed
- What was tested
- Any remaining issue

If blocked, explain the blocker instead of guessing.

 Build Week Rule

The deadline is fixed.

Prioritize:

1. Working core flow
2. Integration
3. Testing
4. Deployment
5. Documentation
6. Demo
7. Optional features

Do not sacrifice the working MVP for unnecessary features.