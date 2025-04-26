// --- Configuration ---
// IMPORTANT: Replace with your actual deployed contract address
const contractAddress = "0xfa85e8E1f4C1fD1528B3b6873D05eFb1c59Cdb7d";

// IMPORTANT: Paste the ABI from your CertifyABI.json file here
const contractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "hash",
                "type": "bytes32"
            },
            {
                "internalType": "string",
                "name": "insti",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "reci",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "course",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "grade",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "doc",
                "type": "string"
            }
        ],
        "name": "addDocHash",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "hash",
                "type": "bytes32"
            }
        ],
        "name": "findDocHash",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]; // Replace with your actual ABI array

// --- Global Variables ---
let provider;
let signer;
let contract;

// --- DOM Elements ---
const connectWalletBtn = document.getElementById('connectWalletBtn');
const walletStatus = document.getElementById('walletStatus');
const signerAddress = document.getElementById('signerAddress');
const addCertificateForm = document.getElementById('addCertificateForm');
const verifyCertificateForm = document.getElementById('verifyCertificateForm');
const addResult = document.getElementById('addResult');
const verifyResult = document.getElementById('verifyResult');
const statusMessage = document.getElementById('statusMessage');

// --- Initialization ---
window.addEventListener('load', () => {
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask (or compatible wallet) is installed!');
        // You could try to auto-connect or prompt user upon interaction
    } else {
        walletStatus.textContent = 'Status: Wallet not detected. Please install MetaMask.';
        connectWalletBtn.disabled = true;
    }
    // Check if already connected (optional)
    checkConnection();
});

connectWalletBtn.addEventListener('click', connectWallet);

addCertificateForm.addEventListener('submit', handleAddCertificate);
verifyCertificateForm.addEventListener('submit', handleVerifyCertificate);

// --- Wallet Connection ---
async function checkConnection() {
     if (typeof window.ethereum !== 'undefined' && window.ethereum.selectedAddress) {
        await connectWallet(); // Re-connect if already approved
    }
}

async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        showStatus("Please install MetaMask!", "error");
        return;
    }
    try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Setup provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        const address = await signer.getAddress();

        // Instantiate the contract
        contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Update UI
        walletStatus.textContent = 'Status: Connected';
        signerAddress.textContent = `Address: ${address}`;
        connectWalletBtn.textContent = 'Wallet Connected';
        connectWalletBtn.disabled = true; // Disable after connection
        showStatus("Wallet connected successfully.", "success");

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
            console.log('Account changed:', accounts[0]);
            // Handle account change (e.g., reconnect or update UI)
             if (accounts.length === 0) {
                // MetaMask is locked or user disconnected
                walletStatus.textContent = 'Status: Disconnected';
                signerAddress.textContent = '';
                connectWalletBtn.textContent = 'Connect Wallet';
                connectWalletBtn.disabled = false;
                contract = null; // Clear contract instance
            } else {
                 connectWallet(); // Reconnect with the new account
            }
        });

         // Listen for network changes
        window.ethereum.on('chainChanged', (chainId) => {
            console.log('Network changed to:', chainId);
             // Optionally reload the page or prompt user
            window.location.reload();
        });


    } catch (error) {
        console.error("Error connecting wallet:", error);
        walletStatus.textContent = 'Status: Connection Failed';
        signerAddress.textContent = '';
        showStatus(`Error connecting: ${error.message || 'User denied connection.'}`, "error");
    }
}

// --- Hashing Helper ---
async function hashFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const buffer = event.target.result;
                const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
                // Convert ArrayBuffer to hex string
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                resolve(hashHex);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}

// --- Contract Interactions ---

// Add Certificate
async function handleAddCertificate(event) {
    event.preventDefault(); // Prevent page reload
    if (!contract) {
        showStatus("Please connect your wallet first.", "error");
        return;
    }

    addResult.innerHTML = ''; // Clear previous results
    showStatus("Processing...", "info");

    const instituteName = document.getElementById('instituteName').value;
    const recipientName = document.getElementById('recipientName').value;
    const courseName = document.getElementById('courseName').value;
    const marks = document.getElementById('marks').value;
    const dateOfCompletion = document.getElementById('dateOfCompletion').value;
    const fileInput = document.getElementById('certificateFileAdd');

    if (!fileInput.files || fileInput.files.length === 0) {
        showStatus("Please select a certificate file.", "error");
        return;
    }
    const file = fileInput.files[0];

    try {
        // 1. Hash the file
        const fileHash = await hashFile(file);
        console.log("Calculated File Hash:", fileHash);

        // 2. Call the smart contract function
        showStatus("Hashing complete. Sending transaction to add record...", "info");
        const tx = await contract.addDocHash(
            fileHash,
            instituteName,
            recipientName,
            courseName,
            marks,
            dateOfCompletion
        );

        showStatus("Transaction sent. Waiting for confirmation...", "info");
        console.log("Transaction:", tx);

        // 3. Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log("Transaction Receipt:", receipt);

        // 4. Display result
        addResult.innerHTML = `
            <p><strong>Certificate Record Added Successfully!</strong></p>
            <p><strong>File Hash:</strong> ${fileHash}</p>
            <p><strong>Transaction Hash:</strong> ${receipt.transactionHash}</p>
            <p><strong>Block Number:</strong> ${receipt.blockNumber}</p>
        `;
        showStatus("Certificate record added successfully!", "success");
        addCertificateForm.reset(); // Clear the form

    } catch (error) {
        console.error("Error adding certificate:", error);
        addResult.innerHTML = `<p><strong>Error:</strong> ${error.message || 'Transaction failed or rejected.'}</p>`;
        showStatus(`Error adding certificate: ${error.code === 'ACTION_REJECTED' ? 'Transaction rejected by user.' : (error.message || 'Unknown error')}`, "error");
    }
}

// Verify Certificate
async function handleVerifyCertificate(event) {
    event.preventDefault();
    if (!contract) {
        showStatus("Please connect your wallet first.", "error");
        // Note: Reading doesn't strictly require a signer if using provider,
        // but keeping contract instance consistent simplifies logic here.
        // Alternatively, could instantiate a read-only contract with provider.
        return;
    }

    verifyResult.innerHTML = ''; // Clear previous results
    showStatus("Processing...", "info");

    const fileInput = document.getElementById('certificateFileVerify');
    if (!fileInput.files || fileInput.files.length === 0) {
        showStatus("Please select a certificate file to verify.", "error");
        return;
    }
    const file = fileInput.files[0];

    try {
        // 1. Hash the file
        const fileHash = await hashFile(file);
        console.log("Calculated File Hash for Verification:", fileHash);

        showStatus(`Hashed file. Checking hash: ${fileHash} on the blockchain...`, "info");

        // 2. Call the smart contract view function
        // Returns: uint blockNumber, string instituteName, string recipientName, string courseName, string marks, string dateOfCompletion
        const record = await contract.findDocHash(fileHash);
        console.log("Record Found:", record);

        // 3. Display result
        // Check if the record exists (e.g., block number is not 0 or a string field is non-empty)
        // Solidity returns default values (0 for uint, "" for string) if mapping key doesn't exist.
        if (record[0].toString() !== "0" || record[1] !== "") { // Check block number or institute name
            verifyResult.innerHTML = `
                <p style="color: green;"><strong>Certificate Found and Verified!</strong></p>
                <p><strong>File Hash:</strong> ${fileHash}</p>
                <p><strong>Institute Name:</strong> ${record[1]}</p>
                <p><strong>Recipient Name:</strong> ${record[2]}</p>
                <p><strong>Course Name:</strong> ${record[3]}</p>
                <p><strong>Marks/Grade:</strong> ${record[4]}</p>
                <p><strong>Date of Completion:</strong> ${record[5]}</p>
                <p><strong>Recorded in Block:</strong> ${record[0].toString()}</p>
             `;
            showStatus("Certificate verified successfully.", "success");
        } else {
            verifyResult.innerHTML = `
                <p style="color: red;"><strong>Certificate Not Found!</strong></p>
                <p>No record exists on the blockchain for the hash:</p>
                <p>${fileHash}</p>
                <p>The file may be incorrect, tampered with, or was never registered.</p>
            `;
            showStatus("Certificate record not found for this file.", "error");
        }
        verifyCertificateForm.reset(); // Clear the form

    } catch (error) {
        console.error("Error verifying certificate:", error);
        verifyResult.innerHTML = `<p><strong>Error:</strong> ${error.message || 'Could not query the blockchain.'}</p>`;
        showStatus(`Error verifying certificate: ${error.message || 'Unknown error'}`, "error");
    }
}

// --- UI Status Updates ---
function showStatus(message, type = "info") { // type can be 'info', 'success', 'error'
    console.log(`Status (${type}): ${message}`); // Log to console as well
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`; // Reset classes and add type
    // Clear message after some time? Maybe not for errors.
    if (type === 'success' || type === 'info') {
       // setTimeout(() => { statusMessage.textContent = ''; statusMessage.className='status-message'; }, 5000); // Clear after 5s
    }
}