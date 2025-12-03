# Changelog

This project follows [Semantic Versioning](https://semver.org/).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project is licensed under [ISC](LICENSE).

## [Unreleased]

## [0.4.0] - 2024-12-XX

### Added
- Comprehensive error code system with standardized error codes
- Four-level severity system: fatal, error, warning, info
- Error code categories: REGISTRY, PROMPT, PARTIAL, REPO, FILE, CLI
- `hint` field in error objects for helpful resolution guidance
- `meta` field in error objects for additional error metadata
- Summary statistics in `validatePromptRepo` result (fatal, error, warning, info counts)
- CLI `--severity` option for filtering errors by minimum severity level
- Fatal error handling that always causes CLI to exit with code 1
- Enhanced error formatting with color-coded severity levels (fatal uses red background)

### Changed
- **BREAKING**: `Severity` type changed from `'error' | 'warning' | 'info' | 'debug'` to `'fatal' | 'error' | 'warning' | 'info'`
- **BREAKING**: `ToolkitError` interface: `details` field renamed to `meta`, added `hint` field
- **BREAKING**: `validatePromptRepo` return type now includes `summary` field
- Error codes renamed for consistency:
  - `PARTIAL_MISSING` → `PARTIAL_NOT_FOUND`
  - `PARTIAL_CIRCULAR` → `PARTIAL_CIRCULAR_DEPENDENCY`
  - `PARTIALS_FOLDER_NOT_FOUND` → `PARTIAL_PATH_INVALID`
- All validators now return `ToolkitError[]` instead of throwing ZodError
- `loadYaml` now throws `ToolkitError` instead of raw errors
- CLI commands updated to support new severity system

### Fixed
- Improved error handling in file operations
- Better error messages with contextual hints
- Consistent error structure across all validators

## [0.3.1] - 2024-12-XX

### Added
- GitHub Actions CI workflow
- Release workflow automation
- Automated version synchronization

### Changed
- Updated workflow configurations to use English

## [0.3.0] - 2024-12-XX

### Added
- Comprehensive CLI tool with command-line interface
- Implemented validate commands (repo, registry, file, partials)
- Implemented check commands (partials usage)
- Implemented list commands (prompts, groups)
- Implemented stats command for repository statistics
- Support for both text and JSON output formats

---

## Version Notes

- **[Unreleased]**: Changes not yet released
- **[version]**: Released versions with date and change types

### Change Types

- **Added**: New features
- **Changed**: Changes to existing features
- **Deprecated**: Features soon to be removed
- **Removed**: Features removed
- **Fixed**: Bug fixes
- **Security**: Security-related changes

