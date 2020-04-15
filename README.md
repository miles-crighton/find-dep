# find-dep

Search and list paths to a specific package dependency within your npm-based project.

```sh
find-dep example@1.0.0
1: core-dep1@3.0.0 → example@1.0.0
2: core-dep2@2.0.0 → inner-dep@3.0.0 → example@1.0.0
```

## Installation

Try once:

```sh
npx find-dep <package>
```

Or install globally:

```sh
npm i -g find-dep
```

## Usage

```sh
find-dep <package-name@version>
```

Package must include the target name but can also include the version like so: `example@1.0.0`

The program will grab data from the package files (`package.json/package-lock.json`) within the execution directory,
to search beyond this use the `--path <path>` option.

#### Version options

-   The wildcard `*` can be used in versions to signify any numeric value (`ie 1.*.0`).

-   A `^` can be used to specify any patch version (`ie 1.0.X`).

-   A `~` can be used to specify any minor/patch version (`ie 1.X.X`).

### Arguments

-   `-j or --json <path>`: Output the paths found for target into json at the provided path
-   `-v or --verbose`: Show full package names in output paths
-   `-h or --hide`: Hide the version numbers in the output paths
-   `-p or --path`: Specify a path to package.json and package-lock.json outside of current directory

## License

Licensed under the MIT License.

## Todo

-   [ ] Fix hunting for a package in a cycle
-   [ ] Fix if target is a core dep
