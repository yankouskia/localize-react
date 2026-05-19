# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).

When you make a change that should ship to npm, add a changeset:

```sh
pnpm changeset
```

Pick the bump level (`patch`, `minor`, `major`), describe what changed, and commit the
generated `.md` file alongside your code. The release workflow in `.github/workflows/release.yml`
opens a "Version Packages" PR that consumes all pending changesets, bumps `package.json`,
updates `CHANGELOG.md`, and — on merge — publishes to npm with provenance.

See `CONTRIBUTING.md` for the full release flow.
