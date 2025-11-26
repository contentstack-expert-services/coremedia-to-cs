

# Content Import Report – NEXT

This repository contains the migration setup and scripts used to transform and import content from the legacy CoreMedia CMS into Contentstack.

---

## CLI Version

For importing data into Contentstack, the following CLI version was used:

* **@contentstack/cli:** `v1.45.0`

---

## Field Mapping

The table below shows how legacy CMS fields were mapped to Contentstack fields.

| CoreMedia Field    | Contentstack Field  |
| ------------------ | ------------------- |
| String             | Single-line textbox |
| Date               | Date                |
| Integer            | Number              |
| Struct             | Group               |
| StringProperty     | Single-line textbox |
| LinkProperty       | Reference           |
| BooleanProperty    | Boolean             |
| StructListProperty | Link                |
| StructProperty     | Group               |

---

## Content Types

The following content types were created based on templates from the legacy CMS:

1. ExternalPage
2. Collection
3. ExternalLink
4. Teaser
5. Picture
6. NextMenuItem

### Number of Entries per Content Type

| Content Type | No. of Entries |
| ------------ | -------------- |
| ExternalPage | 1              |
| Collection   | 1              |
| ExternalLink | 6              |
| Picture      | 4              |
| NextMenuItem | 8              |
| Teaser       | 2              |

---

## Assets and Global Field

* The dataset contains **6 assets**, and all of them have been migrated.
* The legacy CMS includes multiple SEO-related fields such as:

  * `htmlDescription`
  * `htmlTitle`
  * `keyword`

To make these reusable across content types in Contentstack, we created **one global field**:

* **Global Field Name:** `SEO`

---

## Data Observations

### Ignored System-Generated Fields

The exported data includes system-generated fields that were ignored during migration:

* notSearchable
* externalId
* externalRefId
* ignoreUpdates
* masterVersion
* validFrom
* validTo
* locale

### Known Limitations

* Some assets referenced in the data could not be retrieved from their URLs.
* The exported data does not provide a direct connection to static media files included in ZIP files, which makes asset mapping difficult.
* Although such assets were imported, they are not referenced in entries.
* Certain reference fields only contain IDs, UUIDs, and template names. The actual referenced data is missing from the export, so these references could not be fully resolved.

---

## Steps to Run the Migration Script

1. Extract the ZIP file and open the project in an IDE (for example, VS Code).
2. Install dependencies:

   ```bash
   npm i
   ```
3. Run the migration script:

   ```bash
   node index.js
   ```
4. When prompted, provide the **full absolute file path** of the ZIP file containing the legacy data.
5. After transformation, a folder named **`MigrationData`** will be created in the current directory. This contains data formatted for Contentstack.
6. Import the transformed data into Contentstack using the Contentstack CLI.

Refer to the official Contentstack documentation for import steps:
[https://www.contentstack.com/docs/developers/cli/import-content-using-the-cli](https://www.contentstack.com/docs/developers/cli/import-content-using-the-cli)


