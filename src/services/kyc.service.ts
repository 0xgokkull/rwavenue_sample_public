import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const abiPath = path.join(__dirname, '../../frontend/src/contracts/abis/RWAvenueKYC.json');

export const getKycStatus = async (address: string) => {
  const rpcUrl = process.env.PHAROS_RPC_URL || 'https://devnet.dplabs-internal.com';
  const contractAddress = process.env.KYC_CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error('KYC_CONTRACT_ADDRESS is not configured');
  }

  const abi = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(contractAddress, abi, provider);

  try {
    const isVerified = await contract.isVerified(address);
    const network = await provider.getNetwork();

    return {
      address,
      isVerified,
      chainId: Number(network.chainId)
    };
  } catch (error) {
    throw new Error('Failed to read KYC status from blockchain');
  }
};
