
# PharmaTrack Application: Detailed Technical Specification

## 1. Project Overview

PharmaTrack is a comprehensive web application designed to help pharmacists manage patient records, track medication inventories, and oversee dispensing workflows. It features an intuitive, modern interface optimized for data entry and quick information retrieval.

The application is built as a Single Page Application (SPA) with a focus on real-time user interaction, in-place editing, and a robust undo/redo system for all data modifications.

---

## 2. Technology Stack

*   **Framework:** Next.js (with App Router)
*   **Language:** TypeScript
*   **UI Library:** React
*   **Styling:** Tailwind CSS
*   **UI Components:** ShadCN UI (a collection of reusable components built on Radix UI and Tailwind CSS)
*   **Icons:** Lucide React
*   **AI (Planned):** Genkit (configured but not yet implemented)
*   **Data Handling:** In-memory mock data with React Context for state management. No backend database is currently connected.

---

## 3. Core Architecture & Concepts

### 3.1. State Management (`src/context/AppContext.tsx`)

*   A global `AppContext` provides state to the entire application.
*   **Managed State:** It holds all primary data arrays: `patients`, `archivedPatients`, `medications`, `batches`, `regimens`, `stations`, and `patientCategories`.
*   **Undo/Redo History:** The context provider wraps all state modifications to maintain a history stack. It includes `undoLastChange` and `redoLastChange` functions, allowing users to step backward and forward through their actions.
*   **Search & Filtering:** The context also manages the global `searchTerm` from the main header and the `stationFilter` used on the Patients page.

### 3.2. Data Structures (`src/lib/data.ts`)

The application's functionality is built around a set of core data types:

*   **`Patient`**: Represents a patient with properties like `id` (M.R.), `name`, `station`, `specialNotes`, and `categoryIds`. It contains nested objects for medications and boxes.
*   **`MedicationRecord`**: A detailed record of a medication prescribed to a patient, including `medicationCode`, `medicationName`, `dose`, `regimen`, `notes`, batch details, and notification settings for depo medications.
*   **`Medication`**: A simple dictionary entry for a medication, containing just a `code` and `name`.
*   **`Batch`**: Represents a medication batch with `batchId`, `expiryDate`, and a calculated `status` ('Valid', 'Expiring Soon', 'Expired').
*   **`Station`**, **`RegimenDefinition`**, **`PatientCategory`**: Simple dictionary types for managing lists of pharmacy stations, regimen codes, and patient categories.
*   **Mock Data**: The application is initialized with a comprehensive set of mock data from this file to simulate a real-world environment.

### 3.3. UI Components (`src/components/`)

*   The `/ui` directory contains standard ShadCN components (Button, Card, Table, Input, etc.).
*   **Resizable Columns (`src/components/ui/table.tsx`):** The `<TableHead>` component has been customized to allow for horizontal resizing by dragging the column edge.
*   **Custom Layout Components:**
    *   **Sidebar (`src/components/ui/sidebar.tsx`):** A highly customized, collapsible sidebar that supports icon, off-canvas, and inset modes. It manages its state via cookies.
    *   **Sidebar Navigation (`src/components/layout/sidebar-nav.tsx`):** Populates the sidebar with navigation links and icons.

---

## 4. Page-by-Page Feature Breakdown

### 4.1. Main Layout (`src/app/(main)/layout.tsx`)

*   A two-panel layout with a persistent sidebar and a main content area.
*   **Header:**
    *   Contains back, forward, and up navigation buttons.
    *   A global search bar that filters patients and medications.
    *   **Undo/Redo buttons** with "U" and "R" text labels for clarity.
*   **Sidebar:**
    *   Displays the application logo and name.
    *   Contains the primary navigation menu.
    *   Includes a user profile card at the bottom.

### 4.2. Patient List (`src/app/(main)/patients/page.tsx`)

*   Displays a filterable and sortable list of all active patients.
*   **Filtering:** Can be filtered by `Station` using a dropdown.
*   **Sorting:** Users can sort the table by M.R., Patient Name, and Station by clicking the column headers.
*   **In-place Editing:**
    *   The `Patient Name` and `ملاحظات خاصة بالمريض` (Special Notes) fields are editable `Textarea` components. Changes are saved on blur (when the user clicks away).
    *   The `Station` can be changed via a dropdown within the table row.
*   **Add New Patient:** A slide-out sheet (`Sheet`) allows for adding a new patient. The form includes fields for M.R., Name, Station, and Special Notes. It checks for duplicate M.R.s and can restore a patient if an archived match is found.
*   **Actions:** A dropdown menu for each patient allows for archiving or navigating to the patient's detail page.

### 4.3. Patient Detail Page (`src/app/(main)/patients/[id]/page.tsx`)

*   Provides a detailed view of a single patient's medication profile.
*   **Header:** Displays the patient's name, M.R., station, special notes, and any assigned categories.
*   **Medication Tables:**
    *   The page is organized into three tables: "Regular Medications," "Daily Medications," and "Depo Medications."
    *   **"أمانات" (Consignment) Checkbox:** Each row has a checkbox in a vertical-text column.
        *   If **unchecked**, `Medication Code` and `Medication Name` are searchable comboboxes linked to the main medication directory. Batch details are auto-filled based on the selected medication.
        *   If **checked**, these fields become free-text inputs, allowing for non-standard entries. Batch/expiry fields are disabled.
    *   **Regimen Field:** A custom component combines regimen code and meaning into a single, side-by-side input group for compact display.
    *   **Depo Notifications:** The "Depo" table includes extra fields to configure notifications: a start date, frequency value, and frequency unit (days/weeks/months).
*   **Actions:** Users can add/remove medication rows from any table and archive the patient.

### 4.4. Dictionaries & Directories (Medications, Batches, Regimens, Stations, Categories)

These pages all follow a similar CRUD (Create, Read, Update, Delete) pattern:

*   **Layout:** A `Card` containing a `Table`.
*   **Functionality:**
    *   **Search:** A search bar to filter the list.
    *   **Sorting:** Sortable columns.
    *   **Add New:** A "plus" button opens a `Sheet` to add a new entry. Forms can be submitted with the "Enter" key.
    *   **Import:** An "Import from Excel" button allows for bulk data import using the `xlsx` library.
    *   **In-place Editing:** Most fields in the tables are editable inputs, with changes saved on blur.
    *   **Delete:** A dropdown menu on each row provides a delete option with a confirmation dialog.

### 4.5. Archives (`src/app/(main)/archives/page.tsx`)

*   Displays a list of all archived patients.
*   **Functionality:** Users can search the archives, restore a patient back to the active list, or permanently delete the patient record.

---

## 5. Key Implementation Details & Custom Logic

*   **`CreatableCombobox` (`/patients/[id]/page.tsx`):** A highly customized popover component that combines a text input with a searchable command list. It's used for medication selection.
*   **Event Handling:** Most data updates are triggered by the `onBlur` event on input fields to make the undo/redo feature more predictable. Forms also trigger saves on `onSubmit` (including the "Enter" key).
*   **Dynamic UI Changes:**
    *   The UI for a medication row changes dynamically based on the "Consignment" checkbox.
    *   The patient detail header dynamically displays categories assigned to the patient.
*   **Styling:**
    *   Extensive use of Tailwind CSS with HSL variables defined in `globals.css` for easy theming.
    *   The `cn` utility (`src/lib/utils.ts`) is used everywhere to merge and manage Tailwind classes conditionally.
    *   The main font is 'PT Sans'.
