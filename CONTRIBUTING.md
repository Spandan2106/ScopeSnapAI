# Contributing to ScopeSnapAI 🚀

First of all, thank you for your interest in contributing to ScopeSnapAI! Every contribution, whether it's a bug fix, a new feature, an improvement to the documentation, or a suggestion, is appreciated.

This guide explains how to contribute to the project effectively.

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Ways to Contribute](#-ways-to-contribute)
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Coding Guidelines](#-coding-guidelines)
- [Commit Message Guidelines](#-commit-message-guidelines)
- [Pull Request Guidelines](#-pull-request-guidelines)
- [Reporting Bugs](#-reporting-bugs)
- [Suggesting Features](#-suggesting-features)
- [Security Guidelines](#-security-guidelines)
- [Need Help?](#-need-help)

## 🤝 Code of Conduct

We are committed to maintaining a welcoming, respectful, and collaborative environment for everyone.

By participating in this project, you agree to:

- Treat everyone with respect and professionalism.
- Welcome constructive feedback and different perspectives.
- Focus on improving the project rather than criticizing individuals.
- Communicate respectfully in issues, discussions, and pull requests.
- Help maintain an inclusive environment for contributors of all experience levels.

## 💡 Ways to Contribute

There are several ways you can contribute to ScopeSnapAI:

- **Bug Fixes:** Identify and fix existing issues.
- **New Features:** Improve project scoping, requirement extraction, and documentation generation.
- **AI Improvements:** Improve prompts, output quality, and AI integration.
- **Documentation:** Improve the README, setup instructions, examples, and technical documentation.
- **Testing:** Add unit tests, integration tests, and edge-case coverage.
- **Performance:** Improve execution speed, reliability, and resource usage.
- **User Experience:** Suggest improvements that make project scoping easier and more intuitive.

If you're unsure where to start, look for existing issues or open an issue to discuss your idea before making significant changes.

## 🛠️ Getting Started

### 1. Fork the Repository

Fork the repository to your GitHub account.

Repository: [ScopeSnapAI](https://github.com/Spandan2106/ScopeSnapAI)

### 2. Clone Your Fork

Replace `YOUR_USERNAME` with your GitHub username.

```bash
git clone https://github.com/YOUR_USERNAME/ScopeSnapAI.git
cd ScopeSnapAI
```

### 3. Add the Upstream Repository

Connect your local repository to the original project:

```bash
git remote add upstream https://github.com/Spandan2106/ScopeSnapAI.git
```

### 4. Create a Branch

Create a separate branch for your contribution.

For a new feature:

```bash
git checkout -b feature/your-feature-name
```

For a bug fix:

```bash
git checkout -b fix/your-bug-fix
```

For documentation updates:

```bash
git checkout -b docs/your-documentation-update
```

### 5. Install Dependencies

Follow the installation instructions in the project's [README.md](README.md).

For Python projects:

```bash
python -m venv venv
```

Activate the virtual environment.

**Windows:**

```powershell
venv\Scripts\activate
```

**macOS/Linux:**

```bash
source venv/bin/activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

For Node.js projects, install dependencies using:

```bash
npm install
```

Use the setup instructions that match the project's actual implementation.

### 6. Configure Environment Variables

If the project requires an AI API key, create a local `.env` file using `.env.example` as a reference.

Add the environment variables required by the implementation.

**Never commit API keys, passwords, tokens, or other secrets.**

## 🔄 Development Workflow

Follow this workflow when contributing:

1. Check existing issues to avoid duplicate work.
2. Discuss significant changes before implementation.
3. Create a dedicated branch for your contribution.
4. Make focused, maintainable changes.
5. Add or update tests where appropriate.
6. Run the available tests and verify your changes.
7. Commit your changes with a meaningful message.
8. Push your branch to your fork.
9. Open a Pull Request against the original repository.

Before starting new work, synchronize your local branch with the upstream repository when necessary:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

Create your feature branch after updating `main`.

## 🧹 Coding Guidelines

Please follow these guidelines to keep the codebase maintainable.

### General Guidelines

- Write clean, readable, and maintainable code.
- Use meaningful variable, function, and class names.
- Keep functions focused on a single responsibility.
- Avoid unnecessary duplication.
- Handle errors gracefully and provide useful error messages.
- Avoid introducing unrelated changes in a pull request.
- Update documentation when changing existing functionality.
- Follow the conventions already used in the project.

### Python Contributions

- Follow standard Python naming conventions.
- Use `snake_case` for functions and variables.
- Use `PascalCase` for classes.
- Prefer clear, simple implementations.
- Handle exceptions appropriately.
- Add tests for important logic and edge cases.

### Node.js Contributions

- Follow the existing JavaScript or TypeScript conventions.
- Use `camelCase` for variables and functions.
- Use `PascalCase` for classes and components where appropriate.
- Handle asynchronous operations and errors properly.
- Avoid hardcoding API keys or other sensitive configuration.
- Keep dependencies minimal and justify new packages when appropriate.

### AI Integration Guidelines

Since ScopeSnapAI uses AI workflows, contributors should:

- Design prompts to produce structured, relevant, and consistent outputs.
- Validate AI-generated content before using it in downstream operations.
- Handle missing, malformed, or unexpected AI responses.
- Avoid exposing sensitive project information in logs.
- Consider API errors, rate limits, and token usage.
- Keep model-specific configuration separate from core business logic where practical.

## 📝 Commit Message Guidelines

Write clear commit messages that describe the purpose of your changes.

Use the following prefixes where appropriate:

| Prefix | Purpose |
|---|---|
| `feat:` | Add a new feature |
| `fix:` | Fix a bug |
| `docs:` | Update documentation |
| `refactor:` | Improve code structure without changing intended behavior |
| `test:` | Add or update tests |
| `perf:` | Improve performance |
| `chore:` | Maintenance and configuration changes |

Examples:

```bash
git commit -m "feat: add project risk analysis"
git commit -m "fix: handle invalid AI responses"
git commit -m "docs: improve installation instructions"
git commit -m "test: add requirement extraction tests"
```

These prefixes are recommendations to keep commit history consistent.

## 🚀 Pull Request Guidelines

Before submitting a Pull Request, ensure that:

- [ ] Your changes have a clear purpose.
- [ ] Your branch contains only relevant changes.
- [ ] The project runs with your changes.
- [ ] Relevant tests pass.
- [ ] New functionality has appropriate tests where practical.
- [ ] Documentation has been updated if necessary.
- [ ] No API keys, credentials, or unnecessary generated files are included.
- [ ] Your commit messages are meaningful.

### Submitting a Pull Request

Push your branch:

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub against the original repository's `main` branch.

Include the following information in your description:

- **Summary:** What does this change do?
- **Motivation:** Why is this change needed?
- **Implementation:** How did you implement it?
- **Testing:** How did you verify it?
- **Related Issues:** Link any relevant issues.

Be open to feedback and make requested changes when appropriate.

## 🐛 Reporting Bugs

If you discover a bug, open a GitHub Issue and include:

- A clear, descriptive title.
- Steps to reproduce the problem.
- Expected behavior.
- Actual behavior.
- Relevant error messages or logs.
- Environment details, where relevant.

Include a minimal example when possible, and remove API keys, personal information, and other sensitive data before sharing logs.

Check existing issues before opening a new one.

## 🌟 Suggesting Features

Have an idea that could improve ScopeSnapAI? We'd love to hear it!

When proposing a feature, explain:

1. The problem you want to solve.
2. Why the feature would be useful.
3. How you expect it to work.
4. Any relevant examples or alternatives.
5. Potential limitations or implementation considerations.

For major features, open an issue for discussion before investing time in implementation.

## 🔒 Security Guidelines

Security is important, especially when working with AI APIs and project information.

- Never commit API keys, access tokens, passwords, or private credentials.
- Keep `.env` files out of version control.
- Validate external input and AI-generated output.
- Avoid logging sensitive user or project information.
- Do not commit private data, personal information, or confidential project documents.
- Report suspected security vulnerabilities privately to the repository maintainer rather than publishing exploitable details in a public issue.

## 🙌 Recognition

Every meaningful contribution helps make ScopeSnapAI better.

Thank you for taking the time to contribute, report issues, suggest improvements, and help the project grow!

## 📬 Need Help?

If you have questions or need clarification:

- Open an issue in the [ScopeSnapAI repository](https://github.com/Spandan2106/ScopeSnapAI).
- Explain what you're trying to achieve and where you're stuck.
- Provide relevant context without sharing secrets.

We appreciate your interest in ScopeSnapAI and look forward to your contributions!

---

**Happy Contributing! 🚀**

*Built with the goal of making project scoping and requirements analysis simpler, smarter, and more structured.*
