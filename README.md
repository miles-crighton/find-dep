# find-package

Search for an npm package within your projects dependencies.

Requires package.json and up-to-date package-lock.json

## Usage

`find-package <package>`

### Arguments

-   `-j or --json <path>`: Output the paths found for target into json at the provided path.

## Todo

-   [x] Add individual colors to depth of target paths
-   [ ] Add shorten/extended flag to provide ellipsis for in-between deps for a deep path
-   [ ] Fix hunting for a package in a cycle
-   [ ] Fix if target is a core dep
-   [x] Add output as JSON
-   [ ] Allow wildcards for target matching
-   [ ] Add target version searching
-   [ ] Add version returning
