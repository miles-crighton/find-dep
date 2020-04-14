# find-package

Search for an npm package within your projects dependencies.

Requires package.json and up-to-date package-lock.json

## Usage

`find-package <package>`

### Arguments

-   `-j or --json <path>`: Output the paths found for target into json at the provided path.
-   `-v or --verbose`: Show full package names in output paths

## Todo

-   [x] Add individual colors to depth of target paths
-   [x] Add shorten/extended flag to provide ellipsis for in-between deps for a deep path
-   [ ] Fix hunting for a package in a cycle
-   [ ] Fix if target is a core dep
-   [x] Add output as JSON
-   [x] Allow wildcards for target matching
-   [x] Add target version searching
-   [x] Add version returning
