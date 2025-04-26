# Blockchain Certificate Verification DApp

## Project Overview

This project is a Decentralized Application (DApp) designed to securely issue and verify credentials (like course completion certificates) using blockchain technology. It leverages the transparency and immutability of the blockchain to store a unique fingerprint (hash) of a certificate along with its key details, preventing tampering and allowing anyone to verify its authenticity.

This DApp consists of:
* A Solidity smart contract (`Certify.sol`) deployed on an Ethereum-compatible blockchain.
* A web-based frontend (`frontend/`) allowing users to interact with the smart contract via their browser wallet (MetaMask).

## How it Works

### Issuing a Certificate:
1.  An authorized entity (e.g., an institution) fills in the certificate details (Institute, Recipient, Course, Grade, Date) on the frontend.
2.  The corresponding certificate document (e.g., PDF, image) is selected.
3.  The frontend calculates the SHA-256 hash of the certificate file. This hash acts as a unique digital fingerprint.
4.  The user initiates a transaction via MetaMask to call the `addDocHash` function on the `Certify` smart contract.
5.  The smart contract stores the certificate details (recipient, course, etc.) mapped against the unique file hash on the blockchain.

### Verifying a Certificate:
1.  A user uploads the certificate file they wish to verify using the frontend.
2.  The frontend calculates the SHA-256 hash of the uploaded file, identical to the process during issuing.
3.  The frontend calls the `findDocHash` (read-only) function on the smart contract, passing the calculated hash.
4.  The smart contract checks if a record exists for that specific hash.
5.  If a record exists, the contract returns the associated details (Institute, Recipient, Course, etc.) stored on the blockchain. The frontend displays these details, confirming the certificate's authenticity and original data.
6.  If no record exists for that hash, the frontend indicates that the certificate is not found or potentially invalid/tampered with.

## Technology Stack

* **Blockchain:** Ethereum (using Ganache for local development)
* **Smart Contract:** Solidity (`^0.8.0`) [assumed from truffle-config.js]
* **Development Framework:** Truffle Suite
* **Frontend:** HTML, CSS, JavaScript
* **Web3 Library:** Ethers.js (v5.7.2 via CDN)
* **Local Blockchain:** Ganache GUI or CLI
* **Browser Wallet:** MetaMask

## Prerequisites

* **Node.js & npm:** Required for Truffle and the frontend server. Download from [https://nodejs.org/](https://nodejs.org/)
* **Truffle:** Install globally: `npm install -g truffle`
* **Ganache:** Local blockchain GUI or CLI. Download from [https://trufflesuite.com/ganache/](https://trufflesuite.com/ganache/)
* **MetaMask:** Browser extension wallet. Download from [https://metamask.io/](https://metamask.io/)

## Setup Instructions

1.  **Clone the Repository (If applicable):**
    ```bash
    git clone <your-repository-url>
    cd CERTIFICATE_ISSUE_BLOCKCHAIN
    ```
    *(If not using Git, just ensure you have the project folder).*

2.  **Install Dependencies (Optional but Recommended):**
    * While dependencies aren't strictly managed in this project yet, it's good practice. Navigate to the root directory (`CERTIFICATE_ISSUE_BLOCKCHAIN`) in your terminal and run:
        ```bash
        npm init -y # Creates a package.json file
        ```

3.  **Start Ganache:**
    * Launch your Ganache GUI or run the Ganache CLI.
    * Ensure it's running on the default port `7545` (or update `truffle-config.js` if using a different port).
    * Keep Ganache running in the background.

4.  **Compile Smart Contracts:**
    * Open your terminal in the project root directory (`CERTIFICATE_ISSUE_BLOCKCHAIN`).
    * Run:
        ```bash
        truffle compile
        ```
    * This creates a `build/contracts/` directory containing the ABI and bytecode.

5.  **Migrate Smart Contracts:**
    * Deploy the contracts to your running Ganache network:
        ```bash
        truffle migrate --reset
        ```
        *(Use `--reset` to ensure fresh deployment if you've deployed before).*
    * After migration, Truffle will output the deployed contract addresses. **Copy the address for the `Certify` contract.**

6.  **Configure Frontend (`app.js`):**
    * Open the `frontend/app.js` file.
    * Find the `contractAddress` variable near the top.
    * **Replace** the placeholder address (`"0xfa85e8E1f4C1fD1528B3b6873D05eFb1c59Cdb7d"` or any other value) with the **actual `Certify` contract address** you copied after running `truffle migrate`.
    * Ensure the `contractABI` variable in `app.js` matches the ABI found in `CertifyABI.json` or `build/contracts/Certify.json`.
    * Save the `app.js` file.

7.  **Configure MetaMask:**
    * Open MetaMask in your browser.
    * Connect MetaMask to your local Ganache network:
        * Click the network dropdown (usually says "Ethereum Mainnet").
        * Select "Custom RPC" or "Add Network".
        * Enter Network Name: `Ganache` (or any name you prefer).
        * New RPC URL: `http://127.0.0.1:7545` (or your Ganache RPC server address).
        * Chain ID: `1337` (or check Ganache for the correct ID).
        * Currency Symbol: `ETH`.
        * Save the network.
    * Import an account from Ganache into MetaMask:
        * In Ganache, copy the Private Key of one of the accounts (usually the first one, which deployed the contract).
        * In MetaMask, click the account icon -> "Import Account" -> Paste the private key.

## Running the Application

1.  **Ensure Ganache is running.**
2.  **Ensure Contracts are Migrated** (run `truffle migrate` if needed).
3.  **Start the Frontend Server:**
    * Navigate to the `frontend` directory in your terminal:
        ```bash
        cd frontend
        ```
    * Start a simple web server. Using `npx serve` (requires Node.js/npm):
        ```bash
        npx serve .
        ```
        *(Alternatively, use Python: `python -m http.server`)*
    * Keep this terminal running. It will output the address where the server is running (e.g., `http://localhost:3000`).

4.  **Use the DApp:**
    * Open Google Chrome (or another compatible browser with MetaMask).
    * Navigate to the address provided by the server (e.g., `http://localhost:3000`).
    * Connect your MetaMask wallet (ensure it's connected to the Ganache network and using an imported Ganache account).
    * You can now issue new certificates or verify existing ones by uploading the corresponding file.

## Key Files

* `contracts/Certify.sol`: The core smart contract logic.
* `migrations/2_deploy_contracts.js`: Script to deploy `Certify.sol`.
* `truffle-config.js`: Configuration for Truffle (network, compiler).
* `frontend/index.html`: Structure of the web application.
* `frontend/style.css`: Styling for the web application.
* `frontend/app.js`: Frontend JavaScript logic, Ethers.js interaction, contract address/ABI.
* `CertifyABI.json` / `build/contracts/Certify.json`: ABI needed to interact with the contract from the frontend.
