# find-package

Search for an npm package within your projects dependencies.

Requires package.json and up-to-date package-lock.json

## Usage

`find-package <package-name@version>`

Package must include the target name but can also include the version like so: `example@1.0.0`

#### Version options

-   The wildcard `*` can be used in versions to signify any numeric value (`ie 1.*.0`).

-   A `^` can be used to specify any patch version (`ie 1.0.X`).

-   A `~` can be used to specify any minor/patch version (`ie 1.X.X`).

#### Example

`find-package ms@2.0.0`

### Arguments

-   `-j or --json <path>`: Output the paths found for target into json at the provided path.
-   `-v or --verbose`: Show full package names in output paths
-   `-h or --hide`: Hide the version numbers in the output paths

## Todo

-   [x] Add individual colors to depth of target paths
-   [x] Add shorten/extended flag to provide ellipsis for in-between deps for a deep path
-   [ ] Fix hunting for a package in a cycle
-   [ ] Fix if target is a core dep
-   [x] Add output as JSON
-   [x] Allow wildcards for target matching
-   [x] Add target version searching
-   [x] Add version returning
