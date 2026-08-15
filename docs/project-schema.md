# Project schema

The `projects` collection holds the AnyDesire portfolio projects. Documents are
managed exclusively by the admin through the future admin panel.

No documents exist yet — this defines the intended structure only.

## `projects/{projectId}`

| Field               | Type      | Notes                                                     |
| ------------------- | --------- | --------------------------------------------------------- |
| `title`             | string    | English title                                              |
| `titleAr`           | string    | Arabic title                                               |
| `slug`              | string    | URL-friendly unique identifier                             |
| `shortDescription`  | string    | English short description                                  |
| `shortDescriptionAr`| string    | Arabic short description                                   |
| `description`       | string    | English full description                                   |
| `descriptionAr`     | string    | Arabic full description                                    |
| `status`            | string    | `idea` / `in-progress` / `completed` / `maintained` / `archived` |
| `category`          | string    | Simple project category                                    |
| `technologies`      | array     | Technology names                                           |
| `features`          | array     | Feature strings                                            |
| `coverImage`        | object    | `{ url, path }` or `null`. Storage path allows cleanup on replace/remove |
| `screenshots`       | array     | Array of `{ url, path }` objects; empty when none |
| `githubUrl`         | string    | Nullable                                                   |
| `demoUrl`           | string    | Nullable                                                   |
| `featured`          | boolean   | Shown in featured section                                  |
| `published`         | boolean   | Visible to public readers when `true`                      |
| `order`             | number    | Controls display order                                     |
| `createdAt`         | timestamp | Firestore server timestamp, set on create                  |
| `updatedAt`         | timestamp | Firestore server timestamp, updated on every change        |

## Images

`coverImage` and `screenshots` store uploaded image references as `{ url, path }`
objects where `url` is the Firebase Storage download URL and `path` is the
Storage object path (`projects/{projectId}/cover/...` or
`projects/{projectId}/screenshots/...`). The `path` lets the admin panel delete
the Storage file when an image is replaced or removed, or when the project is
deleted. Firestore never stores image binary data.

Older/legacy documents may still contain a plain URL string (or an array of URL
strings); the admin form normalizes these for display and treats them as
non-deletable (no known path).
