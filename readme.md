# RWAvenue: Web3 Marketplace for Real-World Asset Tokenization

## Overview

RWAvenue is an innovative decentralized marketplace platform developed for the Pharos Blockchain Hackathon. It enables users to tokenize and trade real-world assets (RWAs) such as real estate, jewelry, and luxury watches. Through blockchain technology and fractional ownership, RWAvenue democratizes access to high-value assets while ensuring transparency and security through smart contracts.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm

### Application Setup

Open the project root folder, then install and run:

```bash
npm install
npm run dev
```

`npm install` installs both backend and frontend dependencies automatically. On first setup, configure environment variables in `.env` (root) and `frontend/.env` before running the app. See [Environment Variables](#environment-variables) below.

This starts the **backend API** and **frontend dev server** at the same time.

### For Frontend Developers

Even if you are working on frontend tasks only, run the backend together with the frontend using `npm run dev` from the project root.

The UI depends on the API for asset data, transactions, validators, and dashboard features. Running the frontend alone will load the UI, but most marketplace and profile features will not work. Running both services lets you verify the full frontend behavior and its communication with the backend.

### Database Setup

Run these commands from the repository root:

```bash
npm run db:migrate
npm run db:seed
```

## Key Features

### 1. Asset Tokenization

**Purpose**: Converts physical assets into digital tokens on the blockchain.

**Process**:

- Asset owners submit ownership proof (e.g., deeds, certificates)
- Documentation verification process
- Smart contracts mint ERC-3643 tokens with verified metadata

**Benefit**: Ensures reliable asset digitization with blockchain verification.

### 2. Fractional Ownership

**Functionality**: Enables fractional investment in high-value assets.

**Implementation**:

- Token division based on asset value
- Automated ownership tracking via blockchain
- Fractional share management

**Benefit**: Makes high-value assets accessible to more investors.

### 3. Secure Marketplace

**Features**:

- Transparent price discovery
- Secure P2P transactions
- Real-time market data
- Smart contract-facilitated trades

**Benefit**: Creates an efficient, secure trading environment.

### 4. Robust Security

**Blockchain Integration**:

- Built on Ethereum/Polygon for scalability
- Transaction verification
- Automated compliance checks

**Smart Contracts**:

- Secure contract parameters
- Regular security audits
- Regulatory compliance

## Technical Architecture

### Blockchain Infrastructure

**Platform**: Ethereum/Polygon with Layer-2 optimization

**Smart Contracts**:

- Asset Tokenization Contract (ERC-721/ERC-1155)
- Marketplace Contract
- Escrow System

**Standards**:

- ERC-721 for unique assets
- ERC-1155 for fractionalized assets

### Frontend Architecture

**Framework**:

- React.js with TypeScript
- TailwindCSS for responsive design
- Web3.js for blockchain interaction

**Features**:

- Asset marketplace dashboard
- Portfolio management
- Transaction history

### Backend Services

**Core Components**:

- Node.js/Express API server
- IPFS for decentralized storage

**Data Management**:

- MongoDB for market data
- Redis for caching

## Use Cases

### Real Estate

- Property tokenization
- Fractional ownership
- Automated rental distributions

### Luxury Goods

- Digital ownership certificates
- Transparent pricing
- Secure transfers

### Art & Collectibles

- Provenance tracking
- Fractional trading
- Portfolio management

## Roadmap

### Phase 1: Core Platform

- Smart contract deployment
- Basic marketplace features
- User authentication

### Phase 2: Enhanced Features

- Multi-chain support
- Advanced trading features
- Improved UI/UX

### Phase 3: Market Expansion

- Additional asset classes
- Enhanced security features
- Mobile application

### Phase 4: Ecosystem Growth

- Community governance
- Partnership integrations
- Market analytics

## Conclusion

RWAvenue represents the future of asset tokenization through Web3 technology. Our platform democratizes access to high-value assets while ensuring secure and transparent trading. Through continuous development and community engagement, RWAvenue is positioned to lead the evolution of decentralized real-world asset trading.
