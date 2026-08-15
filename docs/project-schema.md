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
| `coverImage`        | string    | Image URL; nullable                                           |
| `screenshots`       | array     | Array of image URL strings; empty when none                   |
| `githubUrl`         | string    | Nullable                                                   |
| `demoUrl`           | string    | Nullable                                                   |
| `featured`          | boolean   | Shown in featured section                                  |
| `published`         | boolean   | Visible to public readers when `true`                      |
| `order`             | number    | Controls display order                                     |
| `createdAt`         | timestamp | Firestore server timestamp, set on create                  |
| `updatedAt`         | timestamp | Firestore server timestamp, updated on every change        |

## Images

`coverImage` is a nullable image URL string and `screenshots` is an array of
image URL strings. Images are hosted and referenced by URL only; Firestore never
stores image binary data.
