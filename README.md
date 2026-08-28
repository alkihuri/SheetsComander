# SheetsCommander

SheetsCommander is a Google Apps Script project that exposes a JSON-based API for working with a Google Spreadsheet from external applications. The backend is designed as a thin web service layer: incoming HTTP requests are validated, routed to the correct action, processed by a service, and persisted through repository functions against the target spreadsheet.

## Project overview

The project is built around a single Apps Script web application configured in `appsscript.json`. It runs as a Google Apps Script web app with anonymous access enabled and exposes two main entry points:

- `doGet(e)` for health checks and basic status responses
- `doPost(e)` for all structured API requests

All requests are passed through the same pipeline:

1. Request payload is read from `e.postData.contents`
2. Basic validation is performed (`action`, payload, request size)
3. API key validation is checked when configured
4. `Router.handle(request)` dispatches the request by `action`
5. A specific service method executes business logic
6. A repository layer reads/writes data in the configured spreadsheet
7. `Response.success(...)` or `Response.error(...)` returns a JSON response

## Architecture

### 1. Entry layer

`Code.js`
- Defines the web app entry points
- Validates request size and body format
- Parses JSON payloads
- Catches exceptions and wraps them in consistent error responses

`Router.js`
- Central dispatcher for all supported actions
- Routes user-related actions to `UsersService`
- Routes spreadsheet operations to `SheetService`
- Rejects unknown actions with `INVALID_ACTION`

### 2. Request and response layer

`Validation.js`
- Validates the request envelope
- Ensures required fields are provided
- Enforces API key authentication when `API_KEY` is configured in script properties
- Provides reusable helpers such as `require(...)`, `requireSheetName(...)`, and `requireRange(...)`

`Response.js`
- Standardizes API responses
- Formats successful responses with `{ success, requestId, data, error }`
- Formats failures with structured error payloads

### 3. Configuration and utilities

`Config.js`
- Stores global configuration constants
- Reads script properties from `PropertiesService`
- Provides access to:
  - `SPREADSHEET_ID`
  - `API_KEY`
  - `ENVIRONMENT`
  - `MAX_REQUEST_SIZE`

`Untils.js`
- Contains cross-cutting helpers used across the app
- Generates UUIDs with `Utilities.getUuid()`
- Produces ISO timestamps
- Creates typed errors with custom `code` values
- Normalizes spreadsheet values and matrices before responding

### 4. Spreadsheet access layer

`SheetRepository.js`
- The lowest-level repository for direct spreadsheet operations
- Opens the target spreadsheet via `SpreadsheetApp.openById(...)`
- Handles sheet lookup, listing, cell reads, cell writes, range writes, row appends, row updates, sheet creation, renaming, and deletion
- Validates sheet existence and prevents deleting the last remaining sheet

`SheetService.js`
- Exposes the spreadsheet-oriented API surface for the router
- Implements actions such as:
  - `health`
  - `listSheets`
  - `getSheet`
  - `getRange`
  - `getCell`
  - `setCell`
  - `setRange`
  - `appendRow`
  - `updateRow`
  - `createSheet`
  - `renameSheet`
  - `deleteSheet`

### 5. Business/domain logic

`UsersRepository.js`
- Manages the dedicated `Users` sheet in the spreadsheet
- Ensures the header row exists (`UserId`, `PilgrimNumber`, `FullName`, `GroupId`, `CreatedAt`, `UpdatedAt`, `Status`)
- Searches users by `UserId` and `PilgrimNumber`
- Creates, updates, and deletes rows while keeping the sheet schema consistent

`UserService.js`
- Implements the user management business logic
- Validates required fields such as `pilgrimNumber`, `fullName`, and `groupId`
- Prevents duplicate pilgrim numbers
- Creates timestamps automatically with `CreatedAt` and `UpdatedAt`
- Supports actions:
  - `createUser`
  - `getUser`
  - `findUser`
  - `updateUser`
  - `deleteUser`

### 6. Testing layer

`Tests.js`
- End-to-end script-level test suite for spreadsheet operations
- Exercises config checks, sheet CRUD behavior, validation, routing, and basic API responses

`UserTests.js`
- Focused lifecycle test for the Users API
- Verifies create/find/get/update/delete flows for a user record

## Request flow example

A request such as this is routed through the stack:

```json
{
  "action": "createUser",
  "payload": {
    "pilgrimNumber": "12345",
    "fullName": "John Doe",
    "groupId": "GROUP-A"
  },
  "apiKey": "optional-secret"
}
```

This is processed as follows:

- `doPost` reads the body and parses JSON
- `Validation.validateRequest` confirms the request structure
- `Validation.validateApiKey` checks the configured API key if enabled
- `Router.handle` routes to `UsersService.createUser`
- `UsersRepository` writes a row to the `Users` sheet
- `Response.success` returns the created user payload and metadata

## Configuration requirements

The App Script project expects script properties to be configured in the Apps Script project settings:

- `SPREADSHEET_ID`: the Google Spreadsheet ID that the app manages
- `API_KEY`: optional shared secret for protecting the API
- `ENVIRONMENT`: environment label (for example `development` or `production`)

`appsscript.json` also configures the web app as a user-deployed application with anonymous access enabled.

## Summary

The project follows a classic Apps Script layered architecture:

- HTTP/Web entry point
- validation and routing
- domain/business services
- repository access to Google Sheets
- standardized JSON response handling
- automated tests for regression coverage

This separation keeps the app simple to extend while maintaining a consistent interface for both spreadsheet management and user-related workflows.
