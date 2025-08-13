# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a client-side PNG metadata display application built with Next.js 14 and TypeScript. The application allows users to select PNG files via file picker or drag-and-drop, then displays extracted metadata without sending files to any server.

## Key Commands

### Development
```bash
# Start development server with turbopack
pnpm dev

# Build production version
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Code formatting
pnpm format
pnpm format:check
```

### Testing
```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Run specific test file
pnpm test src/lib/__tests__/png-parser.test.ts

# Run UI component tests
pnpm test src/components/ui
```

### Testing Considerations
- Tests use Vitest with jsdom environment for React components
- UI component tests may show CSS class resolution issues in test environment (this is expected)
- When running tests, temporarily move `postcss.config.mjs` if PostCSS conflicts occur:
  ```bash
  mv postcss.config.mjs postcss.config.mjs.bak
  pnpm test
  mv postcss.config.mjs.bak postcss.config.mjs
  ```

## Architecture Overview

### Core PNG Processing Pipeline
The application follows a three-layer architecture for PNG processing:

1. **File Validation** (`src/lib/file-validator.ts`)
   - PNG signature verification
   - File size and type validation
   - Client-side security checks

2. **PNG Parser** (`src/lib/png-parser.ts`)
   - Low-level PNG chunk reading and CRC validation
   - IHDR (image header) parsing for basic image info
   - Chunk enumeration and categorization
   - Dynamic import of metadata extractor to avoid circular dependencies

3. **Metadata Extractor** (`src/lib/metadata-extractor.ts`)
   - Text metadata extraction (tEXt, zTXt, iTXt chunks)
   - Timestamp extraction (tIME chunk)
   - Physical dimensions extraction (pHYs chunk)
   - Error-tolerant chunk processing

### Type System
All PNG-related types are centralized in `src/types/png-metadata.ts`, including:
- `PngMetadata`: Complete metadata container
- `PngBasicInfo`: Image dimensions and color information
- `PngTextMetadata`: Text-based metadata with internationalization support
- `AppError`: Structured error handling with error types

### UI Components
Reusable UI components are in `src/components/ui/`:
- **Card**: Collapsible content containers with accessibility features
- **Button**: Multi-variant buttons with loading states
- **LoadingIndicator**: Configurable loading spinners
- **ErrorMessage**: Error display with retry functionality

All components support theming via Tailwind CSS and include comprehensive TypeScript props.

### Error Handling Strategy
The application uses a structured error handling approach:
- `AppError` type with specific error categories (FILE_TOO_LARGE, CORRUPTED_FILE, etc.)
- Error boundaries at component level
- User-friendly error messages with technical details in collapsible sections
- Graceful degradation for unsupported PNG chunks

### Performance Considerations
- File processing is asynchronous with progress indication
- Large file size limits (100MB default, configurable)
- Chunk count limits to prevent memory issues
- CRC validation only in strict mode for performance

### Security Features
- All processing is client-side (no file uploads)
- PNG signature verification prevents malformed files
- File size and type validation
- No external dependencies for PNG parsing

## Development Patterns

### Adding New PNG Chunk Support
1. Add chunk type to metadata extractor switch statement
2. Create extraction function following existing patterns
3. Add corresponding TypeScript types
4. Update tests with valid chunk data
5. Consider adding chunk description to `getChunkDescription()`

### UI Component Development
- Use forwardRef for component composition
- Include loading and error states
- Follow accessibility patterns (ARIA attributes, keyboard navigation)
- Add comprehensive prop types with JSDoc comments
- Create corresponding test files in `__tests__/` subdirectories

### Test Data Creation
- Use hex strings for valid PNG data in tests
- Create helper functions for common test scenarios
- Mock File API properly for browser environment simulation
- Test both success and error paths for robustness

## File Structure Context

- `docs/`: Complete specifications and design documents following EARS notation
- `src/app/`: Next.js App Router pages and layouts
- `src/lib/`: Core PNG processing logic and utilities
- `src/components/ui/`: Reusable UI components with tests
- `src/types/`: TypeScript type definitions
- `src/test/`: Test configuration and mocks for browser APIs