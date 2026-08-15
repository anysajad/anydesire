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
| `coverImage`        | string    | Image URL/path; nullable                                   |
| `screenshots`       | array     | Image URLs/paths; empty for now                            |
| `githubUrl`         | string    | Nullable                                                   |
| `demoUrl`           | string    | Nullable                                                   |
| `featured`          | boolean   | Shown in featured section                                  |
| `published`         | boolean   | Visible to public readers when `true`                      |
| `order`             | number    | Controls display order                                     |
| `createdAt`         | timestamp | Firestore server timestamp, set on create                  |
| `updatedAt`         | timestamp | Firestore server timestamp, updated on every change        |
