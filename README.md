<h1 align="center">🎓 BUBT Faculty Scraper</h1>
<p align="center"><b>Part of Project "Harukaze🍃"</b></p>

[![BUBT](https://img.shields.io/badge/BUBT-University-002E5D?style=flat&logo=shield&logoColor=FFD700&color=FFD700&labelColor=002E5D)](https://www.bubt.edu.bd/)
[![Support Chat](https://img.shields.io/badge/Telegram-Join_Chat-2CA5E0?logo=telegram&logoColor=white)](https://t.me/harukaze_bubt)

[![License: GPL-3.0](https://img.shields.io/badge/License-GPLv3-%23B20000?logo=gnu&logoColor=white)](https://opensource.org/licenses/GPL-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
![PNPM](https://img.shields.io/badge/PNPM-10+-F69220?logo=pnpm&logoColor=white)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![ESBuild](https://img.shields.io/badge/ESBuild-0.25.0-FFCF00?logo=esbuild&logoColor=black)](https://esbuild.github.io/)
[![Inquirer](https://img.shields.io/badge/Inquirer-7.3.1-4B32C3?logo=openstack&logoColor=white)](https://www.npmjs.com/package/@inquirer/prompts)
[![Chalk](https://img.shields.io/badge/Chalk-5.4.1-FFE484?logo=markdown&logoColor=black)](https://www.npmjs.com/package/chalk)
[![Cheerio](https://img.shields.io/badge/Cheerio-1.0.0-00CC00?logo=fastapi&logoColor=white)](https://cheerio.js.org/)
[![Commander](https://img.shields.io/badge/Commander-13.1.0-303030?logo=hyper&logoColor=white)](https://www.npmjs.com/package/commander)
[![Winston](https://img.shields.io/badge/Winston-3.17.0-2C3E50?logo=winston&logoColor=white)](https://www.npmjs.com/package/winston)
[![XO](https://img.shields.io/badge/XO-0.60.0-5ED9C7?logo=xo&logoColor=black)](https://github.com/xojs/xo)
[![Rimraf](https://img.shields.io/badge/Rimraf-6.0.1-FF355E?logo=trash&logoColor=white)](https://www.npmjs.com/package/rimraf)

## Overview

Effortlessly extract _structured_ faculty information from the [BUBT](https://bubt.edu.bd/) University website.

<br>

**Faculty JSON structure**

```json
{
  "department": "",
  "name": "",
  "fcode": "",
  "designation": "",
  "room": "",
  "building": "",
  "telephone": {
    "personal": [],
    "office": [],
    "other": []
  },
  "email": {
    "personal": [],
    "office": [],
    "other": []
  },
  "status": "",
  "profileUrl": ""
}
```

**Example Faculty Data**

```json
{
  "department": "Computer Science and Engineering",
  "name": "Md. Masudul Islam",
  "fcode": "MDI",
  "designation": "Assistant Professor",
  "room": "421",
  "building": "2",
  "telephone": { "office": "016xxxxx" },
  "email": "masudulislam11@gmail.com",
  "status": "Active",
  "profileUrl": "https://cse.bubt.edu.bd/facultydetails/29/"
}
```

> [!NOTE]  
> Phone numbers are **intentionally** displayed with masked digits in the example.

## 🌟 Features

**Structured Data Extraction**:

- Retrieves faculty details such as names, positions, departments, faculty codes, and categorized contact information.

  > [!NOTE]  
  > While more information is available on university website, the primary goal was to extract the contact details of each faculty member. In the future, I may consider adding more data fields.

**Ethical Scraping**:

- Built-in rate limiting and request throttling to ensure ethical scraping and avoid overloading the website.

**Flexible Export Options**:

- Easily export extracted data in **JSON format**, ready for further processing, visualization, or integration into databases or applications.

## ⚡ Installation

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/download) (v22.12.0 or later)
- [pnpm](https://pnpm.io/installation) (v10.2.1 or later, highly recommended for faster dependency management)

### Option 1: Run from Source (Recommended for Developers)

1. **Clone the repository**
   ```bash
   git clone https://github.com/kurtnettle/bubt-faculty-scraper.git
   ```
2. **Navigate to the Project Directory**

   ```sh
   cd bubt-faculty-scraper/js
   ```

3. **Install Dependencies**

   Install the dependencies using `pnpm` (**Recommended**)

   ```sh
   pnpm install
   ```

   **Alternatively, Using npm or yarn**

   ```sh
   npm install # or yarn install
   ```

4. **Setup Configuration**

   Rename `config.example.json` to `config.json` and update the required options.

5. **Run the Faculty Scraper**
   ```sh
   pnpm run dev
   ```

### Option 2: Use Precompiled Release (For End Users)

1. Download the latest `bubt-faculty-scraper.js` from [Releases](https://github.com/kurtnettle/bubt-faculty-scraper/releases) page

2. Create a new file `config.json` file in the directory you downloaded the `bubt-faculty-scraper.js`

3. Copy the contents of `config.example.json` from the repo then update the required options.

4. Run with `node`
   ```sh
   node bubt-faculty-scraper.js
   ```

## Usage

To run, simply type in your terminal

```sh
node bubt-faculty-scraper.js
```

### Commands

<table>
  <thead>
    <th>Command</th>
    <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td>
        <code>extract</code>
      </td>
      <td>Export processed faculty data</td>
    </tr>
    <tr>
      <td>
        <code>dump</code>
      </td>
      <td>Download raw faculty webpage content</td>
    </tr>
  </tbody>
</table>

### Common Options

<p>These options apply to both commands:</p>
<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>-D, --list-depts</code></td>
      <td>Display available departments</td>
    </tr>
    <tr>
      <td><code>-d, --dept-alias</code></td>
      <td>Specify department by alias</td>
    </tr>
    <tr>
      <td><code>-a, --all-dept</code></td>
      <td>Select all departments</td>
    </tr>
    <tr>
      <td><code>-S, --list-snapshots</code></td>
      <td>Show available snapshot dates for a department</td>
    </tr>
  </tbody>
</table>

### Command-Specific Options

- `extract`

<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Description</th>
      <th>Default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>-s, --snapshot</code></td>
      <td>Snapshot date (YYYY-MM-DD)</td>
      <td>Latest available</td>
    </tr>
    <tr>
      <td><code>-o, --output-dir</code></td>
      <td>Custom output directory</td>
      <td>Department snapshot dir</td>
    </tr>
  </tbody>
</table>

<br>

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the tool or fix bugs, feel free to submit a pull request. Please ensure your changes align with the project's coding standards and include appropriate tests.

## 📜 License

This project is licensed under the GPLv3 License. See the [LICENSE](./LICENSE) file for full details.

By contributing to this project, you agree that your contributions will be licensed under the GPLv3 License as well.
