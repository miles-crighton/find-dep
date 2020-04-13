# find-package

Search for an npm package within your projects dependencies.

Requires package.json and up-to-date package-lock.json

## Usage

`find-package <package>`

### Arguments

TBA

## Todo

-   [x] Add individual colors to depth of target paths
-   [ ] Add shorten/extended flag to provide ellipsis for in-between deps for a deep path
-   [ ] Fix hunting for a package in a cycle
-   [ ] Fix if target is a core dep
-   [ ] Add output as JSON
-   [ ] Allow wildcards for target matching
