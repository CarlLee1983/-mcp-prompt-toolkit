# Contributing Guide

Thank you for contributing to the Prompt Tooling SDK! This guide explains how to contribute to the project.

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. **All commit messages must be in English.**

### Format

```
<type>[optional scope]: <subject>

[optional body]

[optional footer]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

### Examples

```bash
# Feature
git commit -m "feat: add release workflow automation"

# Fix
git commit -m "fix: correct npm token configuration in release workflow"

# Documentation
git commit -m "docs: update release workflow documentation"

# Chore
git commit -m "chore: configure GitHub Actions for automated releases"

# With scope
git commit -m "feat(cli): add validate command for prompt files"
git commit -m "fix(validators): handle missing registry.yaml gracefully"
```

## Release Tag Convention

We use [Semantic Versioning](https://semver.org/) for release tags. **All release tags must follow the format `v{major}.{minor}.{patch}`.**

### Format

```
v{major}.{minor}.{patch}
```

### Examples

```bash
# Major version
v1.0.0

# Minor version
v0.4.0

# Patch version
v0.3.2

# Pre-release versions
v0.4.0-beta.1
v0.4.0-rc.1
```

### Creating a Release

We use `npm version` to manage releases, ensuring `package.json`, commit, and tag are always in sync.

#### Release Workflow

1. **Use `npm version` to bump version**:
   ```bash
   # For patch releases (0.3.2 → 0.3.3)
   npm version patch -m "chore: bump version to %s"
   
   # For minor releases (0.3.2 → 0.4.0)
   npm version minor -m "chore: bump version to %s"
   
   # For major releases (0.3.2 → 1.0.0)
   npm version major -m "chore: bump version to %s"
   ```

   The `npm version` command automatically:
   - Updates `package.json` version field
   - Creates a commit with your message (where `%s` is replaced with the version number)
   - Creates a Git tag in the format `v{version}` (e.g., `v0.3.3`)

2. **Push commits and tags**:
   ```bash
   git push --follow-tags
   ```

   This command pushes both your commits and the newly created tag to the remote repository.

3. **GitHub Actions automatically**:
   - Detects the tag push event
   - Extracts version from tag
   - Verifies version consistency (package.json, commit, and tag should always match)
   - Builds the project
   - Runs tests
   - Creates a GitHub Release with release notes
   - Publishes to npm (if NPM_TOKEN is configured)

#### Example: Complete Release Process

```bash
# 1. Ensure you're on the main branch and up to date
git checkout main
git pull origin main

# 2. Make sure all changes are committed
git status

# 3. Bump version (patch example)
npm version patch -m "chore: bump version to %s"

# 4. Push everything (commits and tags)
git push --follow-tags
```

**Note**: The `npm version` command ensures that `package.json`, the commit, and the tag are always synchronized. The GitHub Actions workflow will verify this consistency before publishing.

## Release Notes

Release notes are automatically generated in English. The release workflow will:
- Extract the version from the tag
- Create a GitHub Release with the version number
- Link to CHANGELOG.md for detailed changes

## Code Style

- Use TypeScript for all source code
- Follow ESLint rules (run `pnpm lint` before committing)
- Write tests for new features
- Use English for all code comments and documentation

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with English commit messages
4. Ensure all tests pass (`pnpm test:run`)
5. Ensure linting passes (`pnpm lint`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request with a clear description in English

Thank you for contributing! 🎉

